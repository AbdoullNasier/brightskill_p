from decimal import Decimal
from django.db import transaction
from courses.models import Course, Lesson
from books.services import create_book_recommendation
from certificates.services import issue_certificate_if_eligible
from .models import Enrollment, Progress, LessonCompletion, QuizAttempt


def calculate_completion_percentage(course: Course, completed_count: int) -> Decimal:
    total_lessons = course.lessons.count()
    if total_lessons == 0:
        return Decimal("0.00")
    percentage = (Decimal(completed_count) / Decimal(total_lessons)) * Decimal("100")
    return percentage.quantize(Decimal("0.01"))


@transaction.atomic
def enroll_user_in_course(user, course_id: int):
    course = Course.objects.get(id=course_id)
    enrollment, _ = Enrollment.objects.get_or_create(user=user, course=course)
    Progress.objects.get_or_create(user=user, course=course)
    return enrollment


@transaction.atomic
def mark_lesson_complete(user, course_id: int, lesson_id: int):
    course = Course.objects.get(id=course_id)
    lesson = Lesson.objects.get(id=lesson_id, course=course)

    LessonCompletion.objects.get_or_create(user=user, lesson=lesson)
    progress, _ = Progress.objects.get_or_create(user=user, course=course)

    completed_lesson_ids = list(
        LessonCompletion.objects.filter(user=user, lesson__course=course)
        .values_list("lesson_id", flat=True)
        .order_by("lesson__order")
    )
    progress.completed_lessons = completed_lesson_ids
    progress.completion_percentage = calculate_completion_percentage(course, len(completed_lesson_ids))
    progress.save(update_fields=["completed_lessons", "completion_percentage", "last_updated"])

    latest_passing_attempt = QuizAttempt.objects.filter(
        user=user,
        quiz__course=course,
        score__gte=0,
    ).select_related("quiz")
    has_passed_quiz = any(attempt.score >= attempt.quiz.pass_score for attempt in latest_passing_attempt)

    issued_certificate = None
    recommended_book = None
    if progress.completion_percentage == Decimal("100.00") and has_passed_quiz:
        issued_certificate = issue_certificate_if_eligible(user, course)
        recommended_book = create_book_recommendation(
            user=user,
            topic=course.skill.name,
            source_type="course",
            source_id=course.id,
        )

    return progress, issued_certificate, recommended_book
