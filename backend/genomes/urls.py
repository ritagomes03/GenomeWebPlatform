from django.urls import path
from . import views


urlpatterns = [
    path("species/", views.species_list, name="species_list"),
    path("species/<int:taxonomy_id>/", views.species_detail, name="species_detail"),
    path("", views.species_list, name="home"), 
]