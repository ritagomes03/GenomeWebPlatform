import csv
import io
import zipfile
from pathlib import Path

from django.conf import settings
from django.core.paginator import Paginator
from django.db.models import Sum
from django.http import FileResponse, Http404, HttpResponse

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from .utils.uniformizer import STANDARD_HEADER_FIELDS, FIELD_ALIASES

from .models import Sequence, Taxonomy
from .serializers import SequenceSerializer, TaxonomyDetailSerializer, TaxonomyListSerializer
from .services.analysis import build_cleaned_fasta, clean_sequence_id, process_sequence, read_upload
from .services.graph import build_graph_files, get_graph_base_dirs, species_folder_name
from .utils.uniformizer import uniformize_sequence_data, _count_original_sequences

MAX_SEQUENCES    = 5_000

# ─── ViewSets ─────────────────────────────────────────────────────────────────

class TaxonomyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Taxonomy.objects.all()

    def get_serializer_class(self):
        return TaxonomyDetailSerializer if self.action == 'retrieve' else TaxonomyListSerializer

    def list(self, request):
        sort_by      = request.GET.get('sort', 'frequency')
        search_query = request.GET.get('q', '').strip()

        qs = (
            Taxonomy.objects.order_by('species')
            if sort_by == 'az'
            else Taxonomy.objects.order_by('-sequence_count', 'species')
        )
        if search_query:
            qs = qs.filter(species__icontains=search_query)

        paginator = Paginator(qs, 50)
        page_obj  = paginator.get_page(request.GET.get('page', 1))

        return Response({
            'total_species':   Taxonomy.objects.count(),
            'total_sequences': Taxonomy.objects.aggregate(Sum('sequence_count'))['sequence_count__sum'] or 0,
            'current_sort':    sort_by,
            'search_query':    search_query,
            'page':            page_obj.number,
            'num_pages':       paginator.num_pages,
            'has_next':        page_obj.has_next(),
            'has_previous':    page_obj.has_previous(),
            'results':         TaxonomyListSerializer(page_obj.object_list, many=True).data,
        })

    def retrieve(self, request, pk=None):
        tax = self.get_object()
        root_path, folder_name = get_graph_base_dirs(tax.species)

        graph_files  = build_graph_files(root_path, folder_name)
        graphs_exist = {k: v.exists() for k, v in graph_files.items()}

        sequences_qs = Sequence.objects.filter(taxonomy=tax).select_related('metrics')

        available_years = list(
            sequences_qs
            .filter(collection_date__isnull=False)
            .values_list('collection_date__year', flat=True)
            .distinct()
            .order_by('-collection_date__year')
        )

        selected_year = request.GET.get('year')
        if selected_year:
            sequences_qs = sequences_qs.filter(collection_date__year=selected_year)

        paginator = Paginator(sequences_qs.order_by('-collection_date'), 100)
        page_obj  = paginator.get_page(request.GET.get('page', 1))

        return Response({
            'taxonomy':        TaxonomyDetailSerializer(tax).data,
            'folder_name':     folder_name,
            'graphs_exist':    graphs_exist,
            'available_years': available_years,
            'selected_year':   selected_year,
            'page':            page_obj.number,
            'num_pages':       paginator.num_pages,
            'has_next':        page_obj.has_next(),
            'has_previous':    page_obj.has_previous(),
            'sequences':       SequenceSerializer(page_obj.object_list, many=True).data,
        })

    @action(detail=False, methods=['get'], url_path='autocomplete')
    def autocomplete(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return Response([])
        results = Taxonomy.objects.filter(
            species__icontains=query
        ).values_list('species', flat=True)[:10]
        return Response(list(results))

    @action(detail=True, methods=['get'], url_path='graph')
    def download_graph(self, request, pk=None):
        tax = self.get_object()
        root_path, folder_name = get_graph_base_dirs(tax.species)

        if not root_path:
            raise Http404('Graph folders not found.')

        file_path = build_graph_files(root_path, folder_name).get(request.GET.get('type'))
        if not file_path or not file_path.exists():
            raise Http404('Requested graph not found.')

        as_attachment = request.GET.get('download', 'false').lower() == 'true'
        response = FileResponse(open(file_path, 'rb'), as_attachment=as_attachment, filename=file_path.name)
        response['X-Frame-Options'] = 'SAMEORIGIN'
        return response

    @action(detail=True, methods=['get'], url_path='download')
    def download_zip(self, request, pk=None):
        tax         = self.get_object()
        folder_name = species_folder_name(tax.species)
        zip_path    = Path(settings.BASE_DIR) / 'data' / 'species_compressed' / f'{folder_name}.zip'

        if not zip_path.exists():
            raise Http404(f'ZIP not found: {zip_path}')
        return FileResponse(open(zip_path, 'rb'), as_attachment=True, filename=zip_path.name)


class SequenceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset         = Sequence.objects.select_related('metrics', 'taxonomy').all()
    serializer_class = SequenceSerializer
    lookup_field     = 'accession'

    @action(detail=True, methods=['get'], url_path='fasta')
    def download_fasta(self, request, accession=None):
        sequence = self.get_object()
        zip_path = Path(settings.BASE_DIR) / 'data' / 'cncb_sequences.zip'

        if not zip_path.exists():
            raise Http404('CNCB ZIP archive not found.')

        with zipfile.ZipFile(zip_path, 'r') as z:
            match = next((f for f in z.namelist() if f'{sequence.accession}.fasta' in f), None)
            if not match:
                raise Http404(f'Sequence {sequence.accession} not found in archive.')
            return FileResponse(
                io.BytesIO(z.read(match)),
                as_attachment=True,
                filename=f'{sequence.accession}.fasta',
            )


class GlobalViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        return Response({
            'total_species':   Taxonomy.objects.count(),
            'total_sequences': Taxonomy.objects.aggregate(Sum('sequence_count'))['sequence_count__sum'] or 0,
            'top_species':     list(TaxonomyListSerializer(
                Taxonomy.objects.order_by('-sequence_count')[:6], many=True
            ).data),
        })

    @action(detail=False, methods=['get'], url_path='fasta')
    def download_fasta(self, request):
        file_path = Path(settings.BASE_DIR) / 'data' / 'all_genomes_clean.fasta.zip'
        if not file_path.exists():
            raise Http404('Global FASTA file not found.')
        return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=file_path.name)

    @action(detail=False, methods=['get'], url_path='metadata')
    def download_metadata(self, request):
        taxonomies = Taxonomy.objects.all().order_by('-sequence_count', 'species')
        response   = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="global_species_metadata.csv"'

        def r(val): return round(val, 2) if val is not None else '-'

        writer = csv.writer(response)
        writer.writerow([
            'Family', 'Genus', 'Species', 'Sequence Count',
            'Min Length', 'Max Length', 'Min GC (%)', 'Max GC (%)',
            'Min Melting Temp', 'Max Melting Temp', 'Min Entropy', 'Max Entropy',
            'First Collection', 'Last Collection',
        ])
        for tax in taxonomies:
            writer.writerow([
                tax.family or '-', tax.genus or '-', tax.species, tax.sequence_count,
                tax.min_length or '-', tax.max_length or '-',
                r(tax.min_gc), r(tax.max_gc),
                r(tax.min_mt), r(tax.max_mt),
                r(tax.min_ent), r(tax.max_ent),
                tax.first_collection or '-', tax.last_collection or '-',
            ])
        return response


# ─── Analysis ViewSet ─────────────────────────────────────────────────────────

class AnalysisViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['get'], url_path='fields')
    def fields(self, request):
        return Response({
            'fields':  STANDARD_HEADER_FIELDS,
            'aliases': list(FIELD_ALIASES.keys()),
        })

    @action(detail=False, methods=['post'], url_path='fasta', parser_classes=[MultiPartParser])
    def analyze_fasta(self, request):
        upload = read_upload(request)
        if isinstance(upload, Response):
            return upload
        content, meta_order = upload
        try:
            cleaned = uniformize_sequence_data(content, meta_order)
            if len(cleaned) > MAX_SEQUENCES:
                return Response({'error': f'Demasiadas sequências. Limite: {MAX_SEQUENCES}.'}, status=400)
            results = [process_sequence(clean_sequence_id(h), s) for h, s in cleaned]
            return Response({
                'results':       results,
                'meta':          {'original_count': _count_original_sequences(content),
                                  'cleaned_count':  len(results)},
                'cleaned_fasta': build_cleaned_fasta(cleaned),
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            return Response({'error': f'Erro interno: {str(e)}'}, status=500)

    @action(detail=False, methods=['post'], url_path='uniformize', parser_classes=[MultiPartParser])
    def uniformize(self, request):
        upload = read_upload(request)
        if isinstance(upload, Response):
            return upload
        content, meta_order = upload
        try:
            cleaned = uniformize_sequence_data(content, meta_order)
            if len(cleaned) > MAX_SEQUENCES:
                return Response({'error': f'Demasiadas sequências. Limite: {MAX_SEQUENCES}.'}, status=400)
            return Response({
                'message':       'Uniformização concluída com sucesso.',
                'meta':          {'original_count': _count_original_sequences(content),
                                  'cleaned_count':  len(cleaned)},
                'cleaned_fasta': build_cleaned_fasta(cleaned),
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            return Response({'error': f'Erro interno: {str(e)}'}, status=500)