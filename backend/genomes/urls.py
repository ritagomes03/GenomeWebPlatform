from django.urls import path
from . import views

urlpatterns = [
    path("", views.species_list, name="species_list"),
    path("autocomplete/", views.species_autocomplete, name="species_autocomplete"),
    path(
        "download-fasta-global/",
        views.download_global_fasta,
        name="download_global_fasta",
    ),
    path("<int:taxonomy_id>/", views.species_detail, name="species_detail"),
    path(
        "<int:taxonomy_id>/download/<str:graph_type>/",
        views.download_graph,
        name="download_graph",
    ),
]
