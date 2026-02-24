from accounts.admin import user_admin

from .models import (
    Conversation,
    InterviewAssessment,
    InterviewResponse,
    LearningPath,
    Message,
    RolePlayMessage,
    RolePlaySession,
)


user_admin.register([Conversation, InterviewAssessment, InterviewResponse, LearningPath, Message, RolePlayMessage, RolePlaySession])