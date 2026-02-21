from rest_framework import serializers
from .models import Enrollment, Progress, Quiz, QuizAttempt, LessonCompletion


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ["id", "user", "course", "enrolled_at"]
        read_only_fields = ["id", "user", "enrolled_at"]


class ProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Progress
        fields = [
            "id",
            "user",
            "course",
            "completed_lessons",
            "completion_percentage",
            "last_updated",
        ]
        read_only_fields = ["id", "user", "completion_percentage", "last_updated"]


class LessonCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonCompletion
        fields = ["id", "user", "lesson", "completed_at"]
        read_only_fields = ["id", "user", "completed_at"]


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ["id", "course", "title", "pass_score"]


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ["id", "user", "quiz", "score", "attempt_date"]
        read_only_fields = ["id", "user", "attempt_date"]


class EnrollmentRequestSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()


class LessonCompletionRequestSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    lesson_id = serializers.IntegerField()


class QuizAttemptRequestSerializer(serializers.Serializer):
    quiz_id = serializers.IntegerField()
    score = serializers.DecimalField(max_digits=5, decimal_places=2)
