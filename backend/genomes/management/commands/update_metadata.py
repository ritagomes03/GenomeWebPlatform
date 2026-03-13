import csv
from django.core.management.base import BaseCommand
from genomes.models import Sequence

class Command(BaseCommand):
    help = 'Updates the genome_id for existing sequences from the metadata CSV'

    def handle(self, *args, **kwargs):
        csv_path = 'data/metadados.csv'
        batch_size = 5000
        sequences_to_update = []

        existing_seqs = {
            seq.accession: seq 
            for seq in Sequence.objects.only('accession', 'genome_id')
        }
        
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                acc_id = row.get('accession_id', '').strip()
                genome_id = row.get('genome_id', '').strip()
                
                if acc_id in existing_seqs and genome_id:
                    seq = existing_seqs[acc_id]
                    seq.genome_id = genome_id
                    sequences_to_update.append(seq)
                    
                if len(sequences_to_update) >= batch_size:
                    Sequence.objects.bulk_update(sequences_to_update, ['genome_id'])
                    sequences_to_update.clear()

        if sequences_to_update:
            Sequence.objects.bulk_update(sequences_to_update, ['genome_id'])

        self.stdout.write(self.style.SUCCESS("Metadados atualizados com sucesso!"))