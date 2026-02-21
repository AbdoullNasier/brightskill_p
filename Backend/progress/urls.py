from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ProgressViewSet, EnrollmentViewSet, QuizViewSet, QuizAttemptViewSet

router = DefaultRouter()
router.register(r"enrollments", EnrollmentViewSet, basename="enrollment")
router.register(r"quiz", QuizViewSet, basename="quiz")
router.register(r"quiz-attempts", QuizAttemptViewSet, basename="quiz-attempt")
router.register(r"", ProgressViewSet, basename="progress")

urlpatterns = [
    path("", include(router.urls)),
]
