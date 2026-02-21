from django.conf import settings
from django.db import models
from courses.models import Course, Lesson


class Enrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="enrollments", on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name="enrollments", on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-enrolled_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "course"], name="unique_user_course_enrollment"),
        ]

    def __str__(self):
        return f"{self.user} -> {self.course}"


class Progress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="course_progress", on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name="progress_records", on_delete=models.CASCADE)
    completed_lessons = models.JSONField(default=list, blank=True)
    completion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-last_updated"]
        constraints = [
            models.UniqueConstraint(fields=["user", "course"], name="unique_user_course_progress"),
        ]

    def __str__(self):
        return f"{self.user} - {self.course} ({self.completion_percentage}%)"


class Quiz(models.Model):
    course = models.ForeignKey(Course, related_name="quizzes", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    pass_score = models.DecimalField(max_digits=5, decimal_places=2, default=70)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return f"{self.course}: {self.title}"


class QuizAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="quiz_attempts", on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, related_name="attempts", on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    attempt_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-attempt_date"]

    def __str__(self):
        return f"{self.user} - {self.quiz} ({self.score})"


class LessonCompletion(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="lesson_completions", on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, related_name="completions", on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "lesson"], name="unique_user_lesson_completion"),
        ]

    def __str__(self):
        return f"{self.user} completed {self.lesson}"
