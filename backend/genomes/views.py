from pathlib import Path
from django.conf import settings
from django.shortcuts import render, get_object_or_404
from django.http import FileResponse, Http404, JsonResponse
from django.core.paginator import Paginator
from django.db.models import Sum
from .models import Taxonomy, Sequence
import csv
from django.http import HttpResponse

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

    # Base da query
    sequences_qs = Sequence.objects.filter(taxonomy=tax).select_related('metrics')
    
    # 1. Extrair os anos únicos que existem para esta espécie (ignorando os nulos)
    available_years = sequences_qs.filter(collection_date__isnull=False)\
                                  .values_list('collection_date__year', flat=True)\
                                  .distinct().order_by('-collection_date__year')

    # 2. Aplicar o filtro de ano se existir no URL (?year=2020)
    selected_year = request.GET.get('year')
    if selected_year:
        sequences_qs = sequences_qs.filter(collection_date__year=selected_year)

    # Ordenar por data mais recente
    sequences_qs = sequences_qs.order_by('-collection_date')

    paginator = Paginator(sequences_qs, 100)
    sequences_page = paginator.get_page(request.GET.get('page'))

    return render(request, 'genomes/species_detail.html', {
        'taxonomy': tax,
        'folder_name': folder_name,
        'graphs_exist': graphs_exist,
        'debug_msg': debug_msg,
        'sequences': sequences_page,
        'available_years': available_years, # Passar os anos para o HTML
        'selected_year': selected_year,     # Manter a seleção ativa
    })

from django.views.decorators.clickjacking import xframe_options_sameorigin
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
from .models import Taxonomy

@xframe_options_sameorigin
def download_graph(request, taxonomy_id, graph_type):
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
        is_download = request.GET.get('download', 'false').lower() == 'true'
        return FileResponse(open(file_path, 'rb'), as_attachment=is_download, filename=file_path.name)
    
    raise Http404("O gráfico solicitado não foi encontrado.")


def home(request):
    total_species = Taxonomy.objects.count()
    total_sequences = Taxonomy.objects.aggregate(Sum('sequence_count'))['sequence_count__sum'] or 0
    top_species = Taxonomy.objects.order_by('-sequence_count')[:6]
    
    return render(request, 'genomes/home.html', {
        'total_species': total_species,
        'total_sequences': total_sequences,
        'top_species': top_species
    })



import csv
from django.http import HttpResponse

def download_global_metadata(request):
    taxonomies = Taxonomy.objects.all().order_by('-sequence_count', 'species')
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="global_species_metadata.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Family', 'Genus', 'Species', 'Sequence Count',
        'Min Length', 'Max Length', 'Min GC (%)', 'Max GC (%)',
        'Min Melting Temp', 'Max Melting Temp', 'Min Entropy', 'Max Entropy',
        'First Collection', 'Last Collection'
    ])
    
    for tax in taxonomies:
        writer.writerow([
            tax.family or '-',
            tax.genus or '-',
            tax.species,
            tax.sequence_count,
            tax.min_length or '-',
            tax.max_length or '-',
            round(tax.min_gc, 2) if tax.min_gc is not None else '-',
            round(tax.max_gc, 2) if tax.max_gc is not None else '-',
            round(tax.min_mt, 2) if tax.min_mt is not None else '-',
            round(tax.max_mt, 2) if tax.max_mt is not None else '-',
            round(tax.min_ent, 2) if tax.min_ent is not None else '-',
            round(tax.max_ent, 2) if tax.max_ent is not None else '-',
            tax.first_collection or '-',
            tax.last_collection or '-'
        ])
        
    return response

import csv
from django.http import HttpResponse

def download_species_metadata(request, taxonomy_id):
    tax = get_object_or_404(Taxonomy, id=taxonomy_id)
    # Importa o modelo Sequence no topo do ficheiro se ainda não estiver: from .models import Taxonomy, Sequence
    from .models import Sequence 
    sequences = Sequence.objects.filter(taxonomy=tax).select_related('metrics')
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{tax.species.replace(" ", "_")}_metadata.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Accession', 'Organism Name', 'Country', 'Collection Date', 'Source DB', 
        'Length', 'GC Content (%)', 'Entropy', 'Melting Temp'
    ])
    
    for seq in sequences:
        metrics = seq.metrics if hasattr(seq, 'metrics') else None
        writer.writerow([
            seq.accession,
            seq.organism_name or '-',
            seq.country or '-',
            seq.collection_date or '-',
            seq.source_db or '-',
            metrics.length if metrics and metrics.length is not None else '-',
            round(metrics.gc_content, 2) if metrics and metrics.gc_content is not None else '-',
            round(metrics.entropy, 2) if metrics and metrics.entropy is not None else '-',
            round(metrics.melting_temp, 2) if metrics and metrics.melting_temp is not None else '-'
        ])
        
    return response

from pathlib import Path
from django.conf import settings
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from .models import Taxonomy

def download_species_zip(request, taxonomy_id):
    tax = get_object_or_404(Taxonomy, id=taxonomy_id)
    
    folder_name = tax.species.strip().replace(' ', '_').replace('-', '_').replace('.', '_')
    zip_filename = f"{folder_name}.zip"
    
    # Atualizado para a pasta correta: species_compressed
    zip_path = Path(settings.BASE_DIR) / 'data' / 'species_compressed' / zip_filename
    
    if zip_path.exists() and zip_path.is_file():
        return FileResponse(open(zip_path, 'rb'), as_attachment=True, filename=zip_filename)
    
    raise Http404(f"Ficheiro não encontrado. O Django procurou aqui: {zip_path}")


    import zipfile
import zipfile
import io
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from pathlib import Path
from django.conf import settings
from .models import Sequence

def download_cncb_fasta(request, accession):
    sequence = get_object_or_404(Sequence, accession=accession)
    zip_path = Path(settings.BASE_DIR) / 'data' / 'cncb_sequences.zip'
    
    if not zip_path.exists():
        raise Http404("Arquivo ZIP não encontrado.")

    with zipfile.ZipFile(zip_path, 'r') as z:
        # Obtém a lista de todos os ficheiros no ZIP
        namelist = z.namelist()
        
        # Tenta encontrar o ficheiro ignorando maiúsculas/minúsculas ou pastas
        target = f"{accession}.fasta"
        match = next((f for f in namelist if target in f), None)
        
        if match:
            fasta_data = z.read(match)
            return FileResponse(
                io.BytesIO(fasta_data),
                as_attachment=True,
                filename=f"{accession}.fasta"
            )
            
    raise Http404(f"Sequência {accession} não encontrada no ZIP.")