from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import SkillViewSet, CourseViewSet, LessonViewSet, ModuleViewSet

router = DefaultRouter()
router.register(r"skills", SkillViewSet, basename="skill")
router.register(r"courses", CourseViewSet, basename="course")
router.register(r"lessons", LessonViewSet, basename="lesson")

course_list = CourseViewSet.as_view({"get": "list", "post": "create"})
course_detail = CourseViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"})
course_modules = CourseViewSet.as_view({"get": "modules", "post": "modules"})
module_detail = ModuleViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"})

urlpatterns = [
    # New REST endpoints
    path("courses/", course_list, name="course-list"),
    path("courses/<int:pk>/", course_detail, name="course-detail"),
    path("courses/<int:pk>/modules/", course_modules, name="course-modules"),
    path("modules/<int:pk>/", module_detail, name="module-detail"),
    # Legacy router endpoints kept for backward compatibility
    path("", include(router.urls)),
]
