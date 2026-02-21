from django.db import models
from django.conf import settings


class BookRecommendation(models.Model):
    class SourceType(models.TextChoices):
        COURSE = "course", "Course"
        CONVERSATION = "conversation", "Conversation"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="book_recommendations", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    reason = models.TextField()
    recommended_at = models.DateTimeField(auto_now_add=True)
    source_type = models.CharField(max_length=20, choices=SourceType.choices)
    source_id = models.PositiveIntegerField()

    class Meta:
        ordering = ["-recommended_at"]

    def __str__(self):
        return f"{self.title} ({self.author})"
