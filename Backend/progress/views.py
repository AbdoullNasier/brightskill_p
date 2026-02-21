from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Enrollment, Progress, Quiz, QuizAttempt
from .serializers import (
    EnrollmentSerializer,
    ProgressSerializer,
    QuizSerializer,
    QuizAttemptSerializer,
    EnrollmentRequestSerializer,
    LessonCompletionRequestSerializer,
    QuizAttemptRequestSerializer,
)
from .services import enroll_user_in_course, mark_lesson_complete


class ProgressViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["post"], url_path="enroll")
    def enroll(self, request):
        serializer = EnrollmentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        enrollment = enroll_user_in_course(request.user, serializer.validated_data["course_id"])
        return Response(
            {
                "message": "Enrollment successful",
                "enrollment_id": enrollment.id,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], url_path="complete-lesson")
    def complete_lesson(self, request):
        serializer = LessonCompletionRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        progress, certificate, recommendation = mark_lesson_complete(
            request.user,
            serializer.validated_data["course_id"],
            serializer.validated_data["lesson_id"],
        )

        payload = {
            "message": "Lesson completion updated",
            "progress": ProgressSerializer(progress).data,
        }
        if certificate:
            payload["certificate"] = {
                "certificate_id": str(certificate.certificate_id),
                "issued_at": certificate.issued_at,
            }
        if recommendation:
            payload["book_recommendation"] = {
                "id": recommendation.id,
                "title": recommendation.title,
                "author": recommendation.author,
                "reason": recommendation.reason,
            }
        return Response(payload, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="my-progress")
    def my_progress(self, request):
        queryset = Progress.objects.filter(user=request.user).select_related("course", "course__skill")
        serializer = ProgressSerializer(queryset, many=True)
        return Response(serializer.data)


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user).select_related("course", "course__skill")


class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]
    queryset = Quiz.objects.select_related("course", "course__skill")


class QuizAttemptViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["post"], url_path="submit")
    def submit(self, request):
        serializer = QuizAttemptRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        quiz = get_object_or_404(Quiz, id=serializer.validated_data["quiz_id"])
        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=serializer.validated_data["score"],
        )
        data = QuizAttemptSerializer(attempt).data
        data["passed"] = attempt.score >= quiz.pass_score
        return Response(data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="my-attempts")
    def my_attempts(self, request):
        attempts = QuizAttempt.objects.filter(user=request.user).select_related("quiz", "quiz__course")
        return Response(QuizAttemptSerializer(attempts, many=True).data)
