from rest_framework import serializers
from .models import Taxonomy, Sequence, SequenceMetrics


class SequenceMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SequenceMetrics
        fields = ['length', 'gc_content', 'entropy', 'melting_temp', 'pct_a', 'pct_c', 'pct_g', 'pct_t']


class SequenceSerializer(serializers.ModelSerializer):
    metrics = SequenceMetricsSerializer(read_only=True)

    class Meta:
        model = Sequence
        fields = [
            'accession', 'organism_name', 'collection_date', 'country',
            'source_db', 'genome_id', 'molecular_type', 'completeness_flag',
            'metrics',
        ]


class TaxonomyListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Taxonomy
        fields = ['id', 'species', 'family', 'genus', 'sequence_count']


class TaxonomyDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Taxonomy
        fields = '__all__'
