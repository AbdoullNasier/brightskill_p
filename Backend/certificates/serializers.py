from rest_framework import serializers
from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Certificate
        fields = ["id", "user", "course", "course_title", "issued_at", "certificate_id"]
        read_only_fields = ["id", "user", "issued_at", "certificate_id"]
