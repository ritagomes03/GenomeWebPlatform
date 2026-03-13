import csv
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db.models import Count, Min, Max
from genomes.models import Taxonomy, Sequence, SequenceMetrics

class Command(BaseCommand):
    help = 'Populate the database with genome data from CSV files'

    def handle(self, *args, **kwargs):
        self.stdout.write("Clearing database...")
        SequenceMetrics.objects.all().delete()
        Sequence.objects.all().delete()
        Taxonomy.objects.all().delete()

        batch_size = 10000

        self.stdout.write("Importing metadados.csv...")
        tax_cache = {}
        sequences_to_create = []

        with open('data/metadados.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                species_val = row.get('species', '').strip()
                if not species_val:
                    continue

                if species_val not in tax_cache:
                    tax, _ = Taxonomy.objects.get_or_create(
                        species=species_val,
                        defaults={
                            'family': row.get('family', '').strip(),
                            'genus': row.get('genus', '').strip()
                        }
                    )
                    tax_cache[species_val] = tax
                else:
                    tax = tax_cache[species_val]

                dt_str = row.get('collection_date')
                dt_obj = None
                if dt_str and dt_str not in ['N/A', '', 'unknown', '-']:
                    try:
                        dt_obj = datetime.strptime(dt_str.strip(), '%Y-%m-%d').date()
                    except ValueError:
                        try:
                            dt_obj = datetime.strptime(dt_str.strip()[:4], '%Y').date()
                        except ValueError:
                            pass

                sequences_to_create.append(Sequence(
                    accession=row.get('accession_id', '').strip(),
                    taxonomy=tax,
                    organism_name=row.get('organism_name', '').strip(),
                    country=row.get('country', '').strip(),
                    collection_date=dt_obj,
                    source_db=row.get('source', '').strip(),
                    genome_id=row.get('genome_id', '').strip(),
                    molecular_type=row.get('molecular_type', '').strip(),
                    completeness_flag=row.get('completeness_flag', '').strip()
                ))

                if len(sequences_to_create) >= batch_size:
                    Sequence.objects.bulk_create(sequences_to_create, ignore_conflicts=True)
                    sequences_to_create = []

            if sequences_to_create:
                Sequence.objects.bulk_create(sequences_to_create, ignore_conflicts=True)

        self.stdout.write("Importing genomes.csv...")
        metrics_to_create = []

        def to_f(val):
            try: return float(val) if val else None
            except ValueError: return None

        with open('data/genomes.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                acc_id = row.get('genome_id', '').strip()
                if not acc_id:
                    continue

                length_val = to_f(row.get('length'))
                
                metrics_to_create.append(SequenceMetrics(
                    sequence_id=acc_id,
                    length=int(length_val) if length_val else None,
                    gc_content=to_f(row.get('gc_content')),
                    melting_temp=to_f(row.get('melting_temp')),
                    entropy=to_f(row.get('entropy')),
                    pct_a=to_f(row.get('pct_a')),
                    pct_c=to_f(row.get('pct_c')),
                    pct_g=to_f(row.get('pct_g')),
                    pct_t=to_f(row.get('pct_t')),
                ))

                if len(metrics_to_create) >= batch_size:
                    SequenceMetrics.objects.bulk_create(metrics_to_create, ignore_conflicts=True)
                    metrics_to_create = []

            if metrics_to_create:
                SequenceMetrics.objects.bulk_create(metrics_to_create, ignore_conflicts=True)

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
            calc_last_date=Max('sequences__collection_date')
        )

        taxs_to_update = []
        for t in taxonomies:
            t.sequence_count = t.calc_count
            t.min_length = t.calc_min_len
            t.max_length = t.calc_max_len
            t.min_gc = t.calc_min_gc
            t.max_gc = t.calc_max_gc
            t.min_mt = t.calc_min_mt
            t.max_mt = t.calc_max_mt
            t.min_ent = t.calc_min_ent
            t.max_ent = t.calc_max_ent
            t.first_collection = t.calc_first_date
            t.last_collection = t.calc_last_date
            taxs_to_update.append(t)

        Taxonomy.objects.bulk_update(taxs_to_update, [
            'sequence_count', 'min_length', 'max_length', 
            'min_gc', 'max_gc', 
            'min_mt', 'max_mt', 'min_ent', 'max_ent', 
            'first_collection', 'last_collection'
        ])

        self.stdout.write(self.style.SUCCESS("Import completed successfully!"))