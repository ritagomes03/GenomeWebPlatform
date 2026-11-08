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
    
    genome_id = models.CharField(max_length=100, blank=True, null=True)
    molecular_type = models.CharField(max_length=100, blank=True, null=True)
    completeness_flag = models.CharField(max_length=100, blank=True, null=True)

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

class ContactMessage(models.Model):
    CATEGORY_CHOICES = [
        ('database_usage', 'Database usage'),
        ('sequence_analysis', 'Sequence analysis'),
        ('data_download', 'Data download'),
        ('genomic_metrics', 'Genomic metrics'),
        ('api_access', 'API access'),
        ('technical_issue', 'Technical issue'),
        ('scientific_question', 'Scientific question'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_review', 'In review'),
        ('answered', 'Answered'),
        ('closed', 'Closed'),
    ]

    name = models.CharField(max_length=120)

    email = models.EmailField()

    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES,
    )

    subject = models.CharField(max_length=200)

    message = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='new',
        db_index=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
        ]

    def __str__(self):
        return f'{self.subject} - {self.name}'