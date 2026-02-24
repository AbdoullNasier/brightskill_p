from accounts.admin import user_admin

from .models import Course, Lesson, Skill

user_admin.register([Course, Lesson, Skill])