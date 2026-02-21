from rest_framework import serializers
from .models import BookRecommendation


class BookRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookRecommendation
        fields = [
            "id",
            "user",
            "title",
            "author",
            "reason",
            "recommended_at",
            "source_type",
            "source_id",
        ]
        read_only_fields = ["id", "user", "recommended_at"]
