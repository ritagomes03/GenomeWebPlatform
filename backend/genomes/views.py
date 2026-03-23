import csv
import io
import zipfile
from pathlib import Path

from Bio.Seq import Seq
from Bio.SeqUtils import MeltingTemp as mt

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
from .utils.uniformizer import (
    uniformize_sequence_data,
    _count_original_sequences,
)

# nginx allows 100MB — stay just under at the application layer
MAX_UPLOAD_BYTES = 50 * 1024 * 1024   # 50 MB
MAX_SEQUENCES    = 5_000
ALLOWED_EXTENSIONS = {'.fasta', '.fa', '.fna', '.ffn', '.faa', '.frn'}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _get_species_graph_path(species_name):
    folder_name = species_name.strip().replace(' ', '_').replace('-', '_').replace('.', '_')
    candidates = [
        Path(settings.BASE_DIR) / 'static' / 'graphs',
        Path(settings.BASE_DIR) / 'graphs',
        Path(settings.BASE_DIR).parent / 'graphs',
    ]
    for path in candidates:
        if (path / folder_name).exists():
            return path / folder_name, folder_name
    return None, folder_name


def _build_graph_files(base_path, folder_name):
    return {
        'length':       base_path / 'length_histograms' / f'{folder_name}_length_histogram.pdf',
        'gc':           base_path / 'gcContentGraphs'   / f'{folder_name}_gc_histogram.pdf',
        'entropy':      base_path / 'entropyGraphs'     / f'{folder_name}_entropy.pdf',
        'melting_temp': base_path / 'meltingTempGraphs' / f'{folder_name}_melting_temp.pdf',
        'bases_tempo':  base_path / 'basesTempoGraphs'  / f'{folder_name}_bases_tempo.pdf',
    }


def _clean_sequence_id(header: str, max_length: int = 25) -> str:
    if not header:
        return ""
    clean_id = next((p for p in header.split('|') if p.strip()), "")
    if not clean_id:
        return ""
    return clean_id[:max_length] + '...' if len(clean_id) > max_length else clean_id


def _process_sequence(seq_id, seq_str):
    seq_str = seq_str.upper()
    length  = len(seq_str)

    if length == 0:
        return {'id': seq_id, 'length': 0, 'gc_content': 0,
                'a_perc': 0, 't_perc': 0, 'c_perc': 0, 'g_perc': 0, 'melting_temp': 0}

    count_a, count_t = seq_str.count('A'), seq_str.count('T')
    count_c, count_g = seq_str.count('C'), seq_str.count('G')

    try:
        tm_val = round(float(mt.Tm_NN(Seq(seq_str), nn_table=mt.DNA_NN3)), 2)
    except Exception:
        tm_val = 0

    return {
        'id':           seq_id,
        'length':       length,
        'gc_content':   round(((count_g + count_c) / length) * 100, 2),
        'a_perc':       round((count_a / length) * 100, 2),
        't_perc':       round((count_t / length) * 100, 2),
        'c_perc':       round((count_c / length) * 100, 2),
        'g_perc':       round((count_g / length) * 100, 2),
        'melting_temp': tm_val,
    }


def _build_cleaned_fasta(cleaned_sequences: list[tuple[str, str]]) -> str:
    lines = []
    for header, seq_str in cleaned_sequences:
        wrapped = '\n'.join(seq_str[i:i+80] for i in range(0, len(seq_str), 80))
        lines.append(f'>{header}\n{wrapped}')
    return '\n'.join(lines)


def _read_upload(request) -> tuple[str, str] | Response:
    if 'fasta_file' not in request.FILES:
        return Response({'error': 'O ficheiro fasta_file é obrigatório.'}, status=400)

    file = request.FILES['fasta_file']
    ext  = Path(file.name).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        return Response({'error': f'Tipo de ficheiro inválido: {ext}'}, status=400)

    raw = file.read(MAX_UPLOAD_BYTES + 1)
    if len(raw) > MAX_UPLOAD_BYTES:
        return Response({'error': 'Ficheiro demasiado grande. Limite: 50MB.'}, status=413)

    content    = raw.decode('utf-8-sig').strip().replace('\x00', '')
    meta_order = request.data.get('meta_order', '').strip()
    return content, meta_order


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
        base_path, folder_name = _get_species_graph_path(tax.species)

        graph_files  = _build_graph_files(base_path, folder_name) if base_path else {}
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
        base_path, folder_name = _get_species_graph_path(tax.species)

        if not base_path:
            raise Http404('Graph folder not found.')

        file_path = _build_graph_files(base_path, folder_name).get(request.GET.get('type'))
        if not file_path or not file_path.exists():
            raise Http404('Requested graph not found.')

        as_attachment = request.GET.get('download', 'false').lower() == 'true'
        response = FileResponse(open(file_path, 'rb'), as_attachment=as_attachment, filename=file_path.name)
        response['X-Frame-Options'] = 'SAMEORIGIN'
        return response

    @action(detail=True, methods=['get'], url_path='download')
    def download_zip(self, request, pk=None):
        tax         = self.get_object()
        folder_name = tax.species.strip().replace(' ', '_').replace('-', '_').replace('.', '_')
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
        upload = _read_upload(request)
        if isinstance(upload, Response):
            return upload
        content, meta_order = upload
        try:
            cleaned = uniformize_sequence_data(content, meta_order)
            if len(cleaned) > MAX_SEQUENCES:
                return Response({'error': f'Demasiadas sequências. Limite: {MAX_SEQUENCES}.'}, status=400)
            results = [_process_sequence(_clean_sequence_id(h), s) for h, s in cleaned]
            return Response({
                'results':       results,
                'meta':          {'original_count': _count_original_sequences(content),
                                  'cleaned_count':  len(results)},
                'cleaned_fasta': _build_cleaned_fasta(cleaned),
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            return Response({'error': f'Erro interno: {str(e)}'}, status=500)

    @action(detail=False, methods=['post'], url_path='uniformize', parser_classes=[MultiPartParser])
    def uniformize(self, request):
        upload = _read_upload(request)
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
                'cleaned_fasta': _build_cleaned_fasta(cleaned),
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            return Response({'error': f'Erro interno: {str(e)}'}, status=500)