from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("especies/", views.species_list, name="species_list"),
    path("autocomplete/", views.species_autocomplete, name="species_autocomplete"),
    path("download-fasta-global/", views.download_global_fasta, name="download_global_fasta"),
    path("download-metadata-global/", views.download_global_metadata, name="download_global_metadata"),
    path("<int:taxonomy_id>/", views.species_detail, name="species_detail"),
    path("<int:taxonomy_id>/download/<str:graph_type>/", views.download_graph, name="download_graph"),
    path("<int:taxonomy_id>/download-zip/", views.download_species_zip, name="download_species_zip"),
    path("download-fasta-cncb/<str:accession>/", views.download_cncb_fasta, name="download_cncb_fasta"),
]