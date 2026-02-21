from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        SUPER_ADMIN = 'super_admin', 'Super Admin'
        TUTOR = 'tutor', 'Tutor'
        LEARNER = 'learner', 'Learner'

    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.LEARNER)
    bio = models.TextField(blank=True, null=True)
    avatar = models.URLField(blank=True, null=True, help_text="URL to profile picture")

    def __str__(self):
        return f"{self.username} ({self.role})"
