import uuid
from django.conf import settings
from django.db import models
from courses.models import Course


class Certificate(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="certificates", on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name="certificates", on_delete=models.CASCADE)
    issued_at = models.DateTimeField(auto_now_add=True)
    certificate_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    class Meta:
        ordering = ["-issued_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "course"], name="unique_user_course_certificate"),
        ]

    def __str__(self):
        return f"Certificate<{self.certificate_id}>"
