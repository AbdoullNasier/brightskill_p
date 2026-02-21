from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Skill, Course, Lesson
from .serializers import SkillSerializer, CourseSerializer, LessonSerializer


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Course.objects.select_related("skill").prefetch_related("lessons")
        skill_id = self.request.query_params.get("skill")
        difficulty = self.request.query_params.get("difficulty")
        if skill_id:
            queryset = queryset.filter(skill_id=skill_id)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        return queryset


class LessonViewSet(viewsets.ModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Lesson.objects.select_related("course", "course__skill")
        course_id = self.request.query_params.get("course")
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset
