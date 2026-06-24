from rest_framework import serializers
from .models import (
    Taxonomy,
    Sequence,
    SequenceMetrics,
    ContactMessage,
)


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


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            'id',
            'name',
            'email',
            'category',
            'subject',
            'message',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
        ]

    def validate_name(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                'Name must contain at least 2 characters.'
            )

        return value

    def validate_subject(self, value):
        value = value.strip()

        if len(value) < 5:
            raise serializers.ValidationError(
                'Subject must contain at least 5 characters.'
            )

        return value

    def validate_message(self, value):
        value = value.strip()

        if len(value) < 10:
            raise serializers.ValidationError(
                'Message must contain at least 10 characters.'
            )

        return value