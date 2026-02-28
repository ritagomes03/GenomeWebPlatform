from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.db.models import Sum
from .models import Taxonomy, Sequence

def species_list(request):
    species_qs = Taxonomy.objects.order_by('-sequence_count', 'species')
    
    paginator = Paginator(species_qs, 50)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    total_species = Taxonomy.objects.count()
    total_sequences = Taxonomy.objects.aggregate(Sum('sequence_count'))['sequence_count__sum'] or 0
    
    return render(request, 'genomes/species_list.html', {
        'page_obj': page_obj,
        'total_species': total_species,
        'total_sequences': total_sequences
    })


def species_detail(request, taxonomy_id):
    tax = get_object_or_404(Taxonomy, id=taxonomy_id)
    
    sequences_qs = Sequence.objects.filter(taxonomy=tax).select_related('metrics')
    
    paginator = Paginator(sequences_qs, 100)
    page_number = request.GET.get('page')
    sequences_page = paginator.get_page(page_number)

    return render(request, 'genomes/species_detail.html', {
        'taxonomy': tax,
        'sequences': sequences_page,
    })