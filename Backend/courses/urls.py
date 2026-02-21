from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import SkillViewSet, CourseViewSet, LessonViewSet

router = DefaultRouter()
router.register(r"skills", SkillViewSet, basename="skill")
router.register(r"courses", CourseViewSet, basename="course")
router.register(r"lessons", LessonViewSet, basename="lesson")

urlpatterns = [
    path("", include(router.urls)),
]
