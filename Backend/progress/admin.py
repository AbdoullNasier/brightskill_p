from accounts.admin import user_admin
from .models import Enrollment, LessonCompletion, Progress, Quiz, QuizAttempt


user_admin.register([Enrollment, LessonCompletion, Progress, Quiz, QuizAttempt])