from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Certificate
from .serializers import CertificateSerializer


class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user).select_related("course")

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
