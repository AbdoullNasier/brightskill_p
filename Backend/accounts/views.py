from django.contrib.auth import get_user_model
from django.db.models import Q, Count
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from core.permissions import IsPlatformAdmin
from courses.models import Course
from progress.models import Progress, Enrollment, LessonCompletion
from certificates.models import Certificate
from ai_engine.models import LearningPath
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    AdminUserSerializer,
    AdminUserUpdateSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "message": "Registration successful",
            },
            status=status.HTTP_201_CREATED,
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class AdminDashboardStatsView(generics.GenericAPIView):
    permission_classes = (IsPlatformAdmin,)

    def get(self, request):
        total_users = User.objects.count()
        active_learners = User.objects.filter(role=User.Roles.LEARNER, is_active=True).count()
        total_courses = Course.objects.count()
        completed_courses = Progress.objects.filter(completion_percentage=100).count()

        completion_rate = 0
        if total_users > 0 and total_courses > 0:
            completion_rate = round((completed_courses / (total_users * total_courses)) * 100, 2)

        recent_signups = User.objects.order_by("-date_joined")[:5]
        popular_courses = (
            Course.objects.annotate(total_enrollments=Count("enrollments"))
            .order_by("-total_enrollments", "title")[:5]
        )

        return Response(
            {
                "total_users": total_users,
                "active_learners": active_learners,
                "total_courses": total_courses,
                "completion_rate": completion_rate,
                "lessons_completed": LessonCompletion.objects.count(),
                "certificates_issued": Certificate.objects.count(),
                "enrollments": Enrollment.objects.count(),
                "recent_signups": AdminUserSerializer(recent_signups, many=True).data,
                "course_popularity": [
                    {
                        "course_id": c.id,
                        "course_title": c.title,
                        "enrolled_users": c.total_enrollments,
                    }
                    for c in popular_courses
                ],
            }
        )


class AdminUserListView(generics.ListAPIView):
    permission_classes = (IsPlatformAdmin,)
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        queryset = User.objects.all().order_by("-date_joined")
        role = self.request.query_params.get("role")
        search = self.request.query_params.get("search")

        if role:
            queryset = queryset.filter(role=role)
        if search:
            queryset = queryset.filter(Q(username__icontains=search) | Q(email__icontains=search))

        return queryset


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsPlatformAdmin,)
    queryset = User.objects.all()
    lookup_url_kwarg = "user_id"

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return AdminUserUpdateSerializer
        return AdminUserSerializer

    def perform_destroy(self, instance):
        if instance.id == self.request.user.id:
            raise PermissionDenied("You cannot delete your own account from admin panel.")
        instance.delete()


class UserDashboardView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        progress_qs = Progress.objects.filter(user=user).select_related("course")
        completed_courses = progress_qs.filter(completion_percentage=100).count()
        total_lessons_completed = LessonCompletion.objects.filter(user=user).count()
        certificates_count = Certificate.objects.filter(user=user).count()
        enrollments_count = Enrollment.objects.filter(user=user).count()
        latest_path = LearningPath.objects.filter(user=user).order_by("-generated_at").first()

        xp = (completed_courses * 500) + (total_lessons_completed * 50) + (certificates_count * 200)
        level = max(1, (xp // 1000) + 1)

        active_progress = progress_qs.exclude(completion_percentage=100).order_by("-last_updated").first()
        continue_learning = None
        if active_progress:
            continue_learning = {
                "course_id": active_progress.course_id,
                "course_title": active_progress.course.title,
                "difficulty": active_progress.course.difficulty,
                "completion_percentage": float(active_progress.completion_percentage),
            }

        return Response(
            {
                "stats": {
                    "xp": xp,
                    "level": level,
                    "completed_courses": completed_courses,
                    "enrollments": enrollments_count,
                    "certificates": certificates_count,
                    "lessons_completed": total_lessons_completed,
                },
                "continue_learning": continue_learning,
                "has_learning_path": latest_path is not None,
            }
        )


class LeaderboardView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        users = User.objects.filter(is_active=True).order_by("id")
        rows = []
        for user in users:
            completed_courses = Progress.objects.filter(user=user, completion_percentage=100).count()
            lessons_completed = LessonCompletion.objects.filter(user=user).count()
            certificates_count = Certificate.objects.filter(user=user).count()
            xp = (completed_courses * 500) + (lessons_completed * 50) + (certificates_count * 200)
            rows.append(
                {
                    "user_id": user.id,
                    "username": user.username,
                    "display_name": f"{user.first_name} {user.last_name}".strip() or user.username,
                    "xp": xp,
                    "is_current_user": user.id == request.user.id,
                }
            )

        rows.sort(key=lambda item: item["xp"], reverse=True)
        for index, row in enumerate(rows, start=1):
            row["rank"] = index

        return Response(rows[:10])
