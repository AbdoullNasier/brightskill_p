from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import BookRecommendationViewSet

router = DefaultRouter()
router.register(r"", BookRecommendationViewSet, basename="book-recommendation")

urlpatterns = [
    path("", include(router.urls)),
]
