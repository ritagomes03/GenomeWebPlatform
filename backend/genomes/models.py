from django.db import models

class Taxonomy(models.Model):
    family = models.CharField(max_length=100, blank=True, null=True)
    genus = models.CharField(max_length=100, blank=True, null=True)
    species = models.CharField(max_length=255, unique=True)
    
    sequence_count = models.IntegerField(default=0)
    min_length = models.IntegerField(blank=True, null=True)
    max_length = models.IntegerField(blank=True, null=True)
    min_gc = models.FloatField(blank=True, null=True)
    max_gc = models.FloatField(blank=True, null=True)
    min_mt = models.FloatField(blank=True, null=True)
    max_mt = models.FloatField(blank=True, null=True)
    min_ent = models.FloatField(blank=True, null=True)
    max_ent = models.FloatField(blank=True, null=True)
    first_collection = models.DateField(blank=True, null=True)
    last_collection = models.DateField(blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['-sequence_count', 'species']),
        ]

    def __str__(self):
        return self.species

class Sequence(models.Model):
    accession = models.CharField(max_length=50, primary_key=True)
    taxonomy = models.ForeignKey(Taxonomy, on_delete=models.CASCADE, related_name='sequences', null=True, blank=True)
    organism_name = models.TextField(blank=True, null=True)
    collection_date = models.DateField(blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    source_db = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['collection_date']),
            models.Index(fields=['country']),
        ]

    def __str__(self):
        return self.accession

class SequenceMetrics(models.Model):
    sequence = models.OneToOneField(Sequence, on_delete=models.CASCADE, primary_key=True, related_name='metrics')
    length = models.IntegerField(blank=True, null=True)
    gc_content = models.FloatField(blank=True, null=True)
    entropy = models.FloatField(blank=True, null=True)
    melting_temp = models.FloatField(blank=True, null=True)
    pct_a = models.FloatField(blank=True, null=True)
    pct_c = models.FloatField(blank=True, null=True)
    pct_g = models.FloatField(blank=True, null=True)
    pct_t = models.FloatField(blank=True, null=True)