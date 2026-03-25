from decimal import Decimal
import logging
from django.db import transaction
from rest_framework.exceptions import ValidationError
from courses.models import Course, Module
from books.services import create_book_recommendation
from certificates.services import issue_certificate_if_eligible
from .models import Enrollment, Progress, ModuleCompletion, QuizAttempt, Quiz

logger = logging.getLogger(__name__)


def calculate_completion_percentage(course: Course, completed_count: int) -> Decimal:
    total_modules = course.modules.count()
    if total_modules == 0:
        return Decimal("0.00")
    percentage = (Decimal(completed_count) / Decimal(total_modules)) * Decimal("100")
    return percentage.quantize(Decimal("0.01"))


def sync_progress_record(user, course: Course):
    progress, _ = Progress.objects.get_or_create(user=user, course=course)
    completed_module_ids = list(
        ModuleCompletion.objects.filter(user=user, module__course=course)
        .values_list("module_id", flat=True)
        .order_by("module__order_index")
    )
    progress.completed_modules = completed_module_ids
    progress.completion_percentage = calculate_completion_percentage(course, len(completed_module_ids))
    progress.save(update_fields=["completed_modules", "completion_percentage", "last_updated"])
    return progress


def sync_user_progress_snapshot(user):
    courses = {
        enrollment.course
        for enrollment in Enrollment.objects.filter(user=user).select_related("course")
    }
    courses.update(
        progress.course
        for progress in Progress.objects.filter(user=user).select_related("course")
    )
    for course in courses:
        sync_progress_record(user, course)


def _has_passed_course_exam(user, course: Course) -> bool:
    attempts = QuizAttempt.objects.filter(
        user=user,
        quiz__course=course,
        quiz__quiz_type=Quiz.QuizType.EXAM,
    ).select_related("quiz")
    return any(attempt.score >= attempt.quiz.pass_score for attempt in attempts)


@transaction.atomic
def enroll_user_in_course(user, course_id: int):
    course = Course.objects.get(id=course_id)
    enrollment, _ = Enrollment.objects.get_or_create(user=user, course=course)
    Progress.objects.get_or_create(user=user, course=course)
    return enrollment


@transaction.atomic
def mark_module_complete(user, course_id: int | None, module_id: int):
    module = Module.objects.select_related("course").get(id=module_id)
    course = module.course
    if course_id and course.id != int(course_id):
        raise Module.DoesNotExist

    module_quiz = Quiz.objects.filter(
        course=course,
        module=module,
        quiz_type=Quiz.QuizType.MODULE,
    ).first()
    if module_quiz and not QuizAttempt.objects.filter(
        user=user,
        quiz=module_quiz,
        score__gte=module_quiz.pass_score,
    ).exists():
        raise ValidationError(
            {"detail": "You must pass the module quiz before this module can be completed."}
        )

    ModuleCompletion.objects.get_or_create(user=user, module=module)
    progress = sync_progress_record(user, course)

    issued_certificate = None
    recommended_book = None
    if progress.completion_percentage == Decimal("100.00") and _has_passed_course_exam(user, course):
        try:
            issued_certificate = issue_certificate_if_eligible(user, course)
        except Exception:
            logger.exception("Certificate issue failed for user=%s course=%s", user.id, course.id)
        try:
            recommended_book = create_book_recommendation(
                user=user,
                topic=getattr(course.skill, "name", "") or course.title or "soft skills",
                source_type="course",
                source_id=course.id,
            )
        except Exception:
            logger.exception("Book recommendation failed for user=%s course=%s", user.id, course.id)

    return progress, issued_certificate, recommended_book

@transaction.atomic
def handle_quiz_submission(user, quiz: Quiz, attempt: QuizAttempt):
    course = quiz.course
    sync_progress_record(user, course)

    issued_certificate = None
    recommended_book = None

    if quiz.quiz_type == Quiz.QuizType.EXAM and attempt.score >= quiz.pass_score:
        try:
            issued_certificate = issue_certificate_if_eligible(user, course)
        except Exception:
            logger.exception("Certificate issue failed for user=%s course=%s", user.id, course.id)
        try:
            recommended_book = create_book_recommendation(
                user=user,
                topic=getattr(course.skill, "name", "") or course.title or "soft skills",
                source_type="course",
                source_id=course.id,
            )
        except Exception:
            logger.exception("Book recommendation failed for user=%s course=%s", user.id, course.id)

    return issued_certificate, recommended_book
