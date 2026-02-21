from django.urls import path
from .views import (
    FABAssistView,
    RolePlayView,
    RolePlayHistoryView,
    InterviewQuestionsView,
    InterviewSubmitView,
    LatestLearningPathView,
)

urlpatterns = [
    path("fab-assist/", FABAssistView.as_view(), name="fab_assist"),
    path("roleplay/", RolePlayView.as_view(), name="roleplay"),
    path("roleplay/history/", RolePlayHistoryView.as_view(), name="roleplay_history"),
    path("interview/questions/", InterviewQuestionsView.as_view(), name="interview_questions"),
    path("interview/submit/", InterviewSubmitView.as_view(), name="interview_submit"),
    path("interview/path/", LatestLearningPathView.as_view(), name="latest_learning_path"),
]
