from pathlib import Path
from django.conf import settings
from django.shortcuts import render, get_object_or_404
from django.http import FileResponse, Http404, JsonResponse
from django.core.paginator import Paginator
from django.db.models import Sum
from .models import Taxonomy, Sequence

def _get_species_graph_path(species_name):
    """Helper to find the base directory for a species' graphs."""
    folder_name = species_name.strip().replace(' ', '_').replace('-', '_').replace('.', '_')
    
    possible_base_dirs = [
        Path(settings.BASE_DIR) / 'static' / 'graphs',
        Path(settings.BASE_DIR) / 'graphs',
        Path(settings.BASE_DIR).parent / 'graphs',
    ]
    
    for p in possible_base_dirs:
        if (p / folder_name).exists():
            return p / folder_name, folder_name
    return None, folder_name

def species_list(request):
    sort_by = request.GET.get('sort', 'frequency')
    search_query = request.GET.get('q', '').strip()
    
    if sort_by == 'az':
        species_qs = Taxonomy.objects.order_by('species')
    else:
        species_qs = Taxonomy.objects.order_by('-sequence_count', 'species')
        
    if search_query:
        species_qs = species_qs.filter(species__icontains=search_query)
    
    paginator = Paginator(species_qs, 50)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    total_species = Taxonomy.objects.count()
    total_sequences = Taxonomy.objects.aggregate(Sum('sequence_count'))['sequence_count__sum'] or 0
    
    return render(request, 'genomes/species_list.html', {
        'page_obj': page_obj,
        'total_species': total_species,
        'total_sequences': total_sequences,
        'current_sort': sort_by,
        'search_query': search_query
    })

def download_global_fasta(request):
    filename = 'all_genomes_clean.fasta.zip'
    file_path = Path(settings.BASE_DIR) / 'data' / filename
    
    if file_path.exists():
        return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=filename)
    else:
        raise Http404("O ficheiro FASTA global não foi encontrado no servidor.")

def species_autocomplete(request):
    query = request.GET.get('q', '').strip()
    if query:
        results = Taxonomy.objects.filter(species__icontains=query).values_list('species', flat=True)[:10]
        return JsonResponse(list(results), safe=False)
    return JsonResponse([], safe=False)

def species_detail(request, taxonomy_id):
    tax = get_object_or_404(Taxonomy, id=taxonomy_id)
    base_graph_path, folder_name = _get_species_graph_path(tax.species)
    
    graph_files = {}
    if base_graph_path:
        graph_files = {
            'length': base_graph_path / 'length_histograms' / f'{folder_name}_length_histogram.pdf',
            'gc': base_graph_path / 'gcContentGraphs' / f'{folder_name}_gc_histogram.pdf',
            'entropy': base_graph_path / 'entropyGraphs' / f'{folder_name}_entropy.pdf',
            'melting_temp': base_graph_path / 'meltingTempGraphs' / f'{folder_name}_melting_temp.pdf',
            'bases_tempo': base_graph_path / 'basesTempoGraphs' / f'{folder_name}_bases_tempo.pdf',
        }

    graphs_exist = {k: v.exists() for k, v in graph_files.items()} if graph_files else {}
    debug_msg = f"A pasta '{folder_name}' não foi encontrada."

    sequences_qs = Sequence.objects.filter(taxonomy=tax).select_related('metrics')
    paginator = Paginator(sequences_qs, 100)
    sequences_page = paginator.get_page(request.GET.get('page'))

    return render(request, 'genomes/species_detail.html', {
        'taxonomy': tax,
        'folder_name': folder_name,
        'graphs_exist': graphs_exist,
        'debug_msg': debug_msg,
        'sequences': sequences_page,
    })

def download_graph(request, taxonomy_id, graph_type):
    """Dedicated endpoint specifically for downloading species graphs."""
    tax = get_object_or_404(Taxonomy, id=taxonomy_id)
    base_graph_path, folder_name = _get_species_graph_path(tax.species)

    if not base_graph_path:
        raise Http404("Pasta de gráficos não encontrada.")

    graph_files = {
        'length': base_graph_path / 'length_histograms' / f'{folder_name}_length_histogram.pdf',
        'gc': base_graph_path / 'gcContentGraphs' / f'{folder_name}_gc_histogram.pdf',
        'entropy': base_graph_path / 'entropyGraphs' / f'{folder_name}_entropy.pdf',
        'melting_temp': base_graph_path / 'meltingTempGraphs' / f'{folder_name}_melting_temp.pdf',
        'bases_tempo': base_graph_path / 'basesTempoGraphs' / f'{folder_name}_bases_tempo.pdf',
    }

    file_path = graph_files.get(graph_type)
    if file_path and file_path.exists():
        return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=file_path.name)
    
    raise Http404("O gráfico solicitado não foi encontrado.")