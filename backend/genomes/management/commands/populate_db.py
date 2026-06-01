import csv
import gc
from datetime import date, datetime
from django.core.management.base import BaseCommand
from django.db.models import Count, Min, Max
from django.apps import apps
from django.db import connection, transaction

class Command(BaseCommand):
    help = 'Populate the database with genome data from CSV files'

    def handle(self, *args, **kwargs):
        Taxonomy = apps.get_model('genomes', 'Taxonomy')
        Sequence = apps.get_model('genomes', 'Sequence')
        SequenceMetrics = apps.get_model('genomes', 'SequenceMetrics')

        metadata_path = 'data/metadados.csv'
        genomes_path = 'data/genomes.csv'
        batch_size = 5000
        invalid_date_values = {'N/A', '', 'unknown', '-'}

        def parse_collection_date(raw_value, cache):
            if raw_value is None:
                return None
            key = raw_value.strip()
            if key in cache:
                return cache[key]
            if key in invalid_date_values:
                cache[key] = None
                return None

            parsed = None
            if len(key) >= 10:
                try:
                    parsed = datetime.strptime(key[:10], '%Y-%m-%d').date()
                except ValueError:
                    parsed = None
            if parsed is None and len(key) >= 4 and key[:4].isdigit():
                try:
                    parsed = date(int(key[:4]), 1, 1)
                except ValueError:
                    parsed = None

            cache[key] = parsed
            return parsed

        def to_f(val):
            if val is None:
                return None
            text = val.strip()
            if not text:
                return None
            try:
                return float(text)
            except ValueError:
                return None

        def to_i(val):
            number = to_f(val)
            return int(number) if number is not None else None

        self.stdout.write("Clearing database (Fast mode)...")
        gc.disable()
        try:
            with transaction.atomic():
                # Usar SQL direto (TRUNCATE) evita overhead do ORM em grandes volumes.
                with connection.cursor() as cursor:

                    cursor.execute('SET FOREIGN_KEY_CHECKS=0;')
                    cursor.execute('TRUNCATE TABLE genomes_sequencemetrics;')
                    cursor.execute('TRUNCATE TABLE genomes_sequence;')
                    cursor.execute('TRUNCATE TABLE genomes_taxonomy;')
                    cursor.execute('SET FOREIGN_KEY_CHECKS=1;')

                self.stdout.write("Reading species from metadados.csv...")
                species_defaults = {}
                with open(metadata_path, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        species_val = row.get('species', '').strip()
                        if not species_val or species_val in species_defaults:
                            continue
                        species_defaults[species_val] = {
                            'family': row.get('family', '').strip(),
                            'genus': row.get('genus', '').strip(),
                        }

                self.stdout.write(f"Creating {len(species_defaults)} taxonomy records...")
                taxonomy_rows = [
                    Taxonomy(species=species, family=data['family'], genus=data['genus'])
                    for species, data in species_defaults.items()
                ]
                if taxonomy_rows:
                    Taxonomy.objects.bulk_create(
                        taxonomy_rows,
                        ignore_conflicts=True,
                        batch_size=batch_size,
                    )

                tax_cache = dict(Taxonomy.objects.values_list('species', 'id'))

                self.stdout.write("Importing metadados.csv (sequences)...")
                created_accessions = set()
                date_cache = {}
                sequences_to_create = []

                with open(metadata_path, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        species_val = row.get('species', '').strip()
                        if not species_val:
                            continue

                        taxonomy_id = tax_cache.get(species_val)
                        if taxonomy_id is None:
                            continue

                        acc_id = row.get('accession_id', '').strip()
                        if not acc_id:
                            continue

                        created_accessions.add(acc_id)

                        sequences_to_create.append(Sequence(
                            accession=acc_id,
                            taxonomy_id=taxonomy_id,
                            organism_name=row.get('organism_name', '').strip(),
                            country=row.get('country', '').strip(),
                            collection_date=parse_collection_date(row.get('collection_date'), date_cache),
                            source_db=row.get('source', '').strip(),
                            genome_id=row.get('genome_id', '').strip(),
                            molecular_type=row.get('molecular_type', '').strip(),
                            completeness_flag=row.get('completeness_flag', '').strip(),
                        ))

                        if len(sequences_to_create) >= batch_size:
                            Sequence.objects.bulk_create(
                                sequences_to_create,
                                ignore_conflicts=True,
                                batch_size=batch_size,
                            )
                            sequences_to_create = []

                    if sequences_to_create:
                        Sequence.objects.bulk_create(
                            sequences_to_create,
                            ignore_conflicts=True,
                            batch_size=batch_size,
                        )

                self.stdout.write("Importing genomes.csv...")
                metrics_to_create = []

                with open(genomes_path, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        # Só carrega métricas para sequências que já foram importadas.
                        acc_id = row.get('genome_id', '').strip()
                        if not acc_id or acc_id not in created_accessions:
                            continue

                        metrics_to_create.append(SequenceMetrics(
                            sequence_id=acc_id,
                            length=to_i(row.get('length')),
                            gc_content=to_f(row.get('gc_content')),
                            melting_temp=to_f(row.get('melting_temp')),
                            entropy=to_f(row.get('entropy')),
                            pct_a=to_f(row.get('pct_a')),
                            pct_c=to_f(row.get('pct_c')),
                            pct_g=to_f(row.get('pct_g')),
                            pct_t=to_f(row.get('pct_t')),
                        ))

                        if len(metrics_to_create) >= batch_size:
                            SequenceMetrics.objects.bulk_create(
                                metrics_to_create,
                                ignore_conflicts=True,
                                batch_size=batch_size,
                            )
                            metrics_to_create = []

                    if metrics_to_create:
                        SequenceMetrics.objects.bulk_create(
                            metrics_to_create,
                            ignore_conflicts=True,
                            batch_size=batch_size,
                        )

                self.stdout.write("Calculating Taxonomy statistics...")
                taxonomies = Taxonomy.objects.annotate(
                    calc_count=Count('sequences'),
                    calc_min_len=Min('sequences__metrics__length'),
                    calc_max_len=Max('sequences__metrics__length'),
                    calc_min_gc=Min('sequences__metrics__gc_content'),
                    calc_max_gc=Max('sequences__metrics__gc_content'),
                    calc_min_mt=Min('sequences__metrics__melting_temp'),
                    calc_max_mt=Max('sequences__metrics__melting_temp'),
                    calc_min_ent=Min('sequences__metrics__entropy'),
                    calc_max_ent=Max('sequences__metrics__entropy'),
                    calc_first_date=Min('sequences__collection_date'),
                    calc_last_date=Max('sequences__collection_date'),
                )

                taxs_to_update = []
                for taxonomy in taxonomies:
                    taxonomy.sequence_count = taxonomy.calc_count
                    taxonomy.min_length = taxonomy.calc_min_len
                    taxonomy.max_length = taxonomy.calc_max_len
                    taxonomy.min_gc = taxonomy.calc_min_gc
                    taxonomy.max_gc = taxonomy.calc_max_gc
                    taxonomy.min_mt = taxonomy.calc_min_mt
                    taxonomy.max_mt = taxonomy.calc_max_mt
                    taxonomy.min_ent = taxonomy.calc_min_ent
                    taxonomy.max_ent = taxonomy.calc_max_ent
                    taxonomy.first_collection = taxonomy.calc_first_date
                    taxonomy.last_collection = taxonomy.calc_last_date
                    taxs_to_update.append(taxonomy)

                if taxs_to_update:
                    Taxonomy.objects.bulk_update(taxs_to_update, [
                        'sequence_count', 'min_length', 'max_length', 'min_gc', 'max_gc',
                        'min_mt', 'max_mt', 'min_ent', 'max_ent', 'first_collection', 'last_collection',
                    ], batch_size=batch_size)

            self.stdout.write(self.style.SUCCESS("Import completed successfully!"))
        finally:
            gc.enable()