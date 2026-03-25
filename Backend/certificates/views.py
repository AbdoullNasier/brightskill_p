import logging

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Certificate
from .serializers import CertificateSerializer
from .services import issue_certificate_if_eligible
from progress.models import Progress, QuizAttempt, Quiz
from progress.services import sync_user_progress_snapshot

logger = logging.getLogger(__name__)


class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        sync_user_progress_snapshot(user)
        eligible_courses = set(
            Progress.objects.filter(
                user=user,
                completion_percentage=100,
            ).values_list("course_id", flat=True)
        )
        eligible_courses.update(
            QuizAttempt.objects.filter(
                user=user,
                quiz__quiz_type=Quiz.QuizType.EXAM,
            ).values_list("quiz__course_id", flat=True)
        )
        for progress in Progress.objects.filter(user=user, course_id__in=eligible_courses).select_related("course"):
            try:
                issue_certificate_if_eligible(user, progress.course)
            except Exception:
                logger.exception(
                    "Auto certificate issue failed for user=%s course=%s",
                    user.id,
                    progress.course_id,
                )
        return Certificate.objects.filter(user=user).select_related("course")

    @action(detail=False, methods=["get"], permission_classes=[AllowAny], url_path=r"verify/(?P<certificate_uuid>[^/.]+)")
    def verify(self, request, certificate_uuid=None):
        certificate = Certificate.objects.filter(certificate_id=certificate_uuid).select_related("user", "course").first()
        if not certificate:
            return Response({"valid": False}, status=404)
        return Response(
            {
                "valid": True,
                "certificate_id": str(certificate.certificate_id),
                "recipient": certificate.user.username,
                "course": certificate.course.title,
                "issued_at": certificate.issued_at,
            }
        )
