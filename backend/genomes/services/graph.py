from pathlib import Path

from django.conf import settings


def species_folder_name(species_name: str) -> str:
    return species_name.strip().replace(' ', '_').replace('-', '_').replace('.', '_')


def get_graph_base_dirs(species_name: str):
    folder_name = species_folder_name(species_name)
    candidates = [
        Path(settings.BASE_DIR) / 'static',
        Path(settings.BASE_DIR),
        Path(settings.BASE_DIR).parent,
    ]
    for root in candidates:
        if (root / 'graphs' / folder_name).exists() or (root / 'graphs_semout' / folder_name).exists():
            return root, folder_name
    return None, folder_name


def build_graph_files(root_path, folder_name):
    if not root_path:
        return {}

    path_graphs = root_path / 'graphs' / folder_name

    return {
        'length': path_graphs / 'length_histograms' / 'no_outliers' / f'{folder_name}_length_histogram.pdf',
        'gc': path_graphs / 'gcContentGraphs' / f'{folder_name}_gc_histogram.pdf',
        'entropy': path_graphs / 'entropyGraphs' / f'{folder_name}_entropy.pdf',
        'melting_temp': path_graphs / 'meltingTempGraphs' / f'{folder_name}_melting_temp.pdf',
        'bases_tempo': path_graphs / 'basesTempoGraphs' / f'{folder_name}_bases_tempo.pdf',
    }