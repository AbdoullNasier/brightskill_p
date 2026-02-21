from progress.models import QuizAttempt
from .models import Certificate


def issue_certificate_if_eligible(user, course):
    passed_quiz = QuizAttempt.objects.filter(
        user=user,
        quiz__course=course,
        score__gte=0,
    ).select_related("quiz")
    has_passed = any(attempt.score >= attempt.quiz.pass_score for attempt in passed_quiz)
    if not has_passed:
        return None
    certificate, _ = Certificate.objects.get_or_create(user=user, course=course)
    return certificate
