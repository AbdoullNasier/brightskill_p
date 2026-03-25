from progress.models import QuizAttempt
from .models import Certificate


def issue_certificate_if_eligible(user, course):
    passed_exam_attempts = QuizAttempt.objects.filter(
        user=user,
        quiz__course=course,
        quiz__quiz_type="exam",
        score__gte=0,
    ).select_related("quiz")
    has_passed = any(attempt.score >= attempt.quiz.pass_score for attempt in passed_exam_attempts)
    if not has_passed:
        return None
    certificate, _ = Certificate.objects.get_or_create(user=user, course=course)
    return certificate
