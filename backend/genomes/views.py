import csv
import io
import zipfile
from pathlib import Path

from django.conf import settings
from django.core.paginator import Paginator
from django.db.models import Sum
from django.http import FileResponse, Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.clickjacking import xframe_options_sameorigin

from .models import Sequence, Taxonomy


# --- Helpers ---

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


# --- Views ---

def home(request):
    top_species = Taxonomy.objects.order_by('-sequence_count')[:6]
    return JsonResponse({
        'total_species': Taxonomy.objects.count(),
        'total_sequences': Taxonomy.objects.aggregate(Sum('sequence_count'))['sequence_count__sum'] or 0,
        'top_species': list(top_species.values('id', 'species', 'family', 'genus', 'sequence_count')),
    })


def species_list(request):
    sort_by = request.GET.get('sort', 'frequency')
    search_query = request.GET.get('q', '').strip()

    qs = Taxonomy.objects.order_by('species') if sort_by == 'az' \
        else Taxonomy.objects.order_by('-sequence_count', 'species')

    if search_query:
        qs = qs.filter(species__icontains=search_query)

    paginator = Paginator(qs, 50)
    page_obj = paginator.get_page(request.GET.get('page', 1))

    return JsonResponse({
        'results': list(page_obj.object_list.values('id', 'species', 'family', 'genus', 'sequence_count')),
        'total_species': Taxonomy.objects.count(),
        'total_sequences': Taxonomy.objects.aggregate(Sum('sequence_count'))['sequence_count__sum'] or 0,
        'page': page_obj.number,
        'total_pages': paginator.num_pages,
        'current_sort': sort_by,
        'search_query': search_query,
    })


def species_autocomplete(request):
    query = request.GET.get('q', '').strip()
    if not query:
        return JsonResponse([], safe=False)
    results = Taxonomy.objects.filter(species__icontains=query).values('id', 'species')[:10]
    return JsonResponse(list(results), safe=False)


def species_detail(request, taxonomy_id):
    tax = get_object_or_404(Taxonomy, id=taxonomy_id)
    base_path, folder_name = _get_species_graph_path(tax.species)

    graph_files = _build_graph_files(base_path, folder_name) if base_path else {}
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
    page_obj = paginator.get_page(request.GET.get('page', 1))

    sequences = [
        {
            'accession': s.accession,
            'organism_name': s.organism_name,
            'country': s.country,
            'collection_date': s.collection_date,
            'source_db': s.source_db,
            'length': s.metrics.length if hasattr(s, 'metrics') and s.metrics else None,
            'gc_content': s.metrics.gc_content if hasattr(s, 'metrics') and s.metrics else None,
            'entropy': s.metrics.entropy if hasattr(s, 'metrics') and s.metrics else None,
            'melting_temp': s.metrics.melting_temp if hasattr(s, 'metrics') and s.metrics else None,
        }
        for s in page_obj.object_list
    ]

    return JsonResponse({
        'taxonomy': {
            'id': tax.id,
            'species': tax.species,
            'genus': tax.genus,
            'family': tax.family,
            'sequence_count': tax.sequence_count,
        },
        'graphs_exist': graphs_exist,
        'sequences': sequences,
        'available_years': available_years,
        'selected_year': selected_year,
        'page': page_obj.number,
        'total_pages': paginator.num_pages,
    })


@xframe_options_sameorigin
def download_graph(request, taxonomy_id, graph_type):
    tax = get_object_or_404(Taxonomy, id=taxonomy_id)
    base_path, folder_name = _get_species_graph_path(tax.species)

    if not base_path:
        raise Http404("Graph folder not found.")

    file_path = _build_graph_files(base_path, folder_name).get(graph_type)

    if not file_path or not file_path.exists():
        raise Http404("Requested graph not found.")

    as_attachment = request.GET.get('download', 'false').lower() == 'true'
    return FileResponse(open(file_path, 'rb'), as_attachment=as_attachment, filename=file_path.name)


def download_global_fasta(request):
    file_path = Path(settings.BASE_DIR) / 'data' / 'all_genomes_clean.fasta.zip'
    if not file_path.exists():
        raise Http404("Global FASTA file not found.")
    return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=file_path.name)


def download_global_metadata(request):
    taxonomies = Taxonomy.objects.all().order_by('-sequence_count', 'species')

    response = HttpResponse(content_type='text/csv')
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


def download_species_zip(request, taxonomy_id):
    tax = get_object_or_404(Taxonomy, id=taxonomy_id)
    folder_name = tax.species.strip().replace(' ', '_').replace('-', '_').replace('.', '_')
    zip_path = Path(settings.BASE_DIR) / 'data' / 'species_compressed' / f'{folder_name}.zip'

    if not zip_path.exists():
        raise Http404(f"ZIP not found: {zip_path}")
    return FileResponse(open(zip_path, 'rb'), as_attachment=True, filename=zip_path.name)


def download_cncb_fasta(request, accession):
    get_object_or_404(Sequence, accession=accession)
    zip_path = Path(settings.BASE_DIR) / 'data' / 'cncb_sequences.zip'

    if not zip_path.exists():
        raise Http404("CNCB ZIP archive not found.")

    with zipfile.ZipFile(zip_path, 'r') as z:
        match = next((f for f in z.namelist() if f'{accession}.fasta' in f), None)
        if not match:
            raise Http404(f"Sequence {accession} not found in archive.")
        return FileResponse(io.BytesIO(z.read(match)), as_attachment=True, filename=f'{accession}.fasta')
