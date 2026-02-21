from rest_framework import serializers
from .models import Skill, Course, Lesson


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "description"]


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "course", "title", "content", "order"]


class CourseSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name", read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "skill",
            "skill_name",
            "title",
            "description",
            "difficulty",
            "created_at",
            "updated_at",
            "lessons",
        ]
