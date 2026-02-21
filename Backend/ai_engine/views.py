from django.db import transaction
from django.utils import timezone
from decouple import config
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from books.services import create_book_recommendation
from .models import (
    Conversation,
    Message,
    RolePlaySession,
    RolePlayMessage,
    InterviewAssessment,
    InterviewResponse,
    LearningPath,
)
from .serializers import (
    FABRequestSerializer,
    RolePlayRequestSerializer,
    RolePlaySessionSerializer,
    InterviewSubmitSerializer,
    InterviewAssessmentSerializer,
    LearningPathSerializer,
    REQUIRED_INTERVIEW_QUESTIONS,
)
from .services import ask_gemini, preprocess_user_prompt

INLINE_BOOK_RECOMMENDATIONS = config("INLINE_BOOK_RECOMMENDATIONS", default=False, cast=bool)


def _generate_learning_path_from_responses(responses):
    prompt = (
        "You are an elite soft-skills learning architect. Based on the user's interview responses, "
        "create an intensive and practical learning path. Return plain text in this strict format:\n"
        "TITLE: ...\n"
        "SUMMARY: ...\n"
        "FOCUS_AREAS: item1, item2, item3, ...\n"
        "WEEKLY_PLAN: Week 1 - ...; Week 2 - ...; Week 3 - ...; Week 4 - ...\n\n"
        f"Interview responses: {responses}"
    )
    raw = ask_gemini(prompt)

    title = "Intensive Soft Skills Growth Path"
    summary = raw
    weekly_plan = "Week 1 - Fundamentals; Week 2 - Practice; Week 3 - Feedback; Week 4 - Consolidation"
    focus_areas = ["Communication", "Emotional Intelligence", "Leadership"]

    for line in raw.splitlines():
        clean = line.strip()
        if clean.lower().startswith("title:"):
            title = clean.split(":", 1)[1].strip() or title
        elif clean.lower().startswith("summary:"):
            summary = clean.split(":", 1)[1].strip() or summary
        elif clean.lower().startswith("focus_areas:"):
            data = clean.split(":", 1)[1].strip()
            parsed = [item.strip() for item in data.split(",") if item.strip()]
            if parsed:
                focus_areas = parsed
        elif clean.lower().startswith("weekly_plan:"):
            weekly_plan = clean.split(":", 1)[1].strip() or weekly_plan

    return {
        "title": title,
        "summary": summary,
        "focus_areas": focus_areas,
        "weekly_plan": weekly_plan,
    }


class FABAssistView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FABRequestSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prompt = serializer.validated_data["prompt"]
        skill = serializer.validated_data.get("skill") or "soft skills"
        conversation_id = serializer.validated_data.get("conversation_id")

        if conversation_id:
            conversation = Conversation.objects.filter(id=conversation_id, user=request.user).first()
        else:
            conversation = None

        if not conversation:
            conversation = Conversation.objects.create(user=request.user, skill=skill)

        Message.objects.create(conversation=conversation, sender=Message.Sender.USER, content=prompt)
        reply = ask_gemini(preprocess_user_prompt(prompt), max_output_tokens=160, temperature=0.3)
        Message.objects.create(conversation=conversation, sender=Message.Sender.AI, content=reply)

        recommendation = None
        if INLINE_BOOK_RECOMMENDATIONS and conversation.messages.filter(sender=Message.Sender.USER).count() >= 3:
            recommendation = create_book_recommendation(
                user=request.user,
                topic=conversation.skill,
                source_type="conversation",
                source_id=conversation.id,
            )

        payload = {"reply": reply, "conversation_id": conversation.id}
        if recommendation:
            payload["book_recommendation"] = {
                "title": recommendation.title,
                "author": recommendation.author,
                "reason": recommendation.reason,
            }
        return Response(payload, status=status.HTTP_200_OK)


class RolePlayView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RolePlayRequestSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prompt = serializer.validated_data.get("prompt", "")
        end_session = serializer.validated_data.get("end_session", False)
        session_id = serializer.validated_data.get("session_id")

        if session_id:
            session = RolePlaySession.objects.filter(id=session_id, user=request.user).first()
        else:
            session = None
        if not session:
            session = RolePlaySession.objects.create(user=request.user)

        if prompt:
            RolePlayMessage.objects.create(session=session, role=RolePlayMessage.Role.USER, content=prompt)
            roleplay_prompt = (
                "You are a role-play coach focused on soft skills and personal development only. "
                "Provide practical, concise feedback and ask one follow-up question. "
                f"User message: {prompt}"
            )
            reply = ask_gemini(roleplay_prompt, max_output_tokens=140, temperature=0.35)
            RolePlayMessage.objects.create(session=session, role=RolePlayMessage.Role.AI, content=reply)
        else:
            reply = "Share a workplace soft-skill scenario and I will role-play it with you."

        recommendation = None
        if INLINE_BOOK_RECOMMENDATIONS and session.messages.filter(role=RolePlayMessage.Role.USER).count() >= 3:
            recommendation = create_book_recommendation(
                user=request.user,
                topic="role-play communication and leadership",
                source_type="conversation",
                source_id=session.id,
            )

        if end_session:
            session.ended_at = timezone.now()
            session.save(update_fields=["ended_at"])

        payload = {"reply": reply, "session_id": session.id, "ended_at": session.ended_at}
        if recommendation:
            payload["book_recommendation"] = {
                "title": recommendation.title,
                "author": recommendation.author,
                "reason": recommendation.reason,
            }
        return Response(payload, status=status.HTTP_200_OK)


class RolePlayHistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RolePlaySessionSerializer

    def get_queryset(self):
        return RolePlaySession.objects.filter(user=self.request.user).prefetch_related("messages")


class InterviewQuestionsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"required_questions": REQUIRED_INTERVIEW_QUESTIONS})


class InterviewSubmitView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = InterviewSubmitSerializer

    @transaction.atomic
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        responses = serializer.validated_data["responses"]

        assessment = InterviewAssessment.objects.create(user=request.user)
        for key, question_text in REQUIRED_INTERVIEW_QUESTIONS.items():
            InterviewResponse.objects.create(
                assessment=assessment,
                question_key=key,
                question_text=question_text,
                response_text=responses[key].strip(),
            )

        learning_path_data = _generate_learning_path_from_responses(responses)
        learning_path = LearningPath.objects.create(
            user=request.user,
            assessment=assessment,
            title=learning_path_data["title"],
            summary=learning_path_data["summary"],
            weekly_plan=learning_path_data["weekly_plan"],
            focus_areas=learning_path_data["focus_areas"],
        )

        try:
            create_book_recommendation(
                user=request.user,
                topic=", ".join(learning_path.focus_areas[:2]) or "soft skills",
                source_type="conversation",
                source_id=assessment.id,
            )
        except Exception:
            pass

        return Response(
            {
                "message": "Interview assessment saved and learning path generated.",
                "assessment": InterviewAssessmentSerializer(assessment).data,
                "learning_path": LearningPathSerializer(learning_path).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LatestLearningPathView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        path = LearningPath.objects.filter(user=request.user).order_by("-generated_at").first()
        if not path:
            return Response({"detail": "No learning path found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(LearningPathSerializer(path).data)
