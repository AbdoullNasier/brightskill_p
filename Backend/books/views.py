from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import BookRecommendation
from .serializers import BookRecommendationSerializer


class BookRecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookRecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = BookRecommendation.objects.filter(user=self.request.user)
        source_type = self.request.query_params.get("source_type")
        if source_type:
            queryset = queryset.filter(source_type=source_type)
        return queryset
