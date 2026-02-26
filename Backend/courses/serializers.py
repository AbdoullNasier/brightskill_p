import re
from urllib.parse import parse_qs, urlparse

from rest_framework import serializers

from .models import Skill, Course, Lesson, Module


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "description"]


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "course", "title", "content", "video_url", "order"]


class CourseSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name", read_only=True)
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)
    modules = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "skill",
            "skill_name",
            "created_by",
            "created_by_email",
            "title",
            "slug",
            "description",
            "difficulty",
            "is_published",
            "is_active",
            "created_at",
            "updated_at",
            "lessons",
            "modules",
        ]
        read_only_fields = [
            "created_by",
            "created_by_email",
            "slug",
            "is_active",
            "created_at",
            "updated_at",
            "lessons",
            "modules",
        ]
        extra_kwargs = {
            "skill": {"required": False, "allow_null": True},
            "difficulty": {"required": False},
        }

    def get_modules(self, obj):
        modules_qs = obj.modules.order_by("order_index", "id")
        return ModuleSerializer(modules_qs, many=True).data


class ModuleSerializer(serializers.ModelSerializer):
    embed_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Module
        fields = [
            "id",
            "course",
            "title",
            "description",
            "content",
            "youtube_url",
            "youtube_video_id",
            "embed_url",
            "order_index",
            "is_preview",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["youtube_video_id", "embed_url", "created_at", "updated_at"]
        extra_kwargs = {
            "course": {"required": False},
        }
        validators = []

    def get_embed_url(self, obj):
        if not obj.youtube_video_id:
            return None
        return f"https://www.youtube.com/embed/{obj.youtube_video_id}"

    def validate(self, attrs):
        course = attrs.get("course") or getattr(self.instance, "course", None) or self.context.get("course")
        order_index = attrs.get("order_index")
        if self.instance and order_index is None:
            order_index = self.instance.order_index
        if course and order_index is not None:
            existing = Module.objects.filter(course=course, order_index=order_index)
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError(
                    {"order_index": "order_index must be unique within the selected course."}
                )

        content = attrs.get("content")
        if content is None and self.instance:
            content = self.instance.content

        youtube_url = attrs.get("youtube_url")
        if youtube_url is None and self.instance:
            youtube_url = self.instance.youtube_url

        if not (content and str(content).strip()) and not (youtube_url and str(youtube_url).strip()):
            raise serializers.ValidationError(
                {"detail": "Provide module content text, a video URL, or both."}
            )

        if youtube_url and str(youtube_url).strip():
            attrs["youtube_video_id"] = self._extract_optional_youtube_video_id(youtube_url)
        else:
            attrs["youtube_video_id"] = ""

        return attrs

    def create(self, validated_data):
        if "course" not in validated_data and self.context.get("course"):
            validated_data["course"] = self.context["course"]
        return super().create(validated_data)

    @staticmethod
    def _extract_optional_youtube_video_id(youtube_url):
        parsed = urlparse(youtube_url)
        host = (parsed.netloc or "").lower()

        if "youtube.com" not in host and "youtu.be" not in host and "youtube-nocookie.com" not in host:
            return ""

        if "youtu.be" in host:
            candidate = parsed.path.lstrip("/").split("/")[0]
        elif "youtube.com" in host or "youtube-nocookie.com" in host:
            if parsed.path == "/watch":
                candidate = parse_qs(parsed.query).get("v", [None])[0]
            elif parsed.path.startswith("/embed/"):
                candidate = parsed.path.split("/embed/")[1].split("/")[0]
            elif parsed.path.startswith("/shorts/"):
                candidate = parsed.path.split("/shorts/")[1].split("/")[0]
            else:
                candidate = None
        else:
            candidate = None

        if candidate and re.match(r"^[a-zA-Z0-9_-]{11}$", candidate):
            return candidate
        raise serializers.ValidationError({"youtube_url": "Enter a valid YouTube URL."})
