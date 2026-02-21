from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import (
    RegisterView,
    UserDetailView,
    CustomTokenObtainPairView,
    AdminDashboardStatsView,
    AdminUserListView,
    AdminUserDetailView,
    UserDashboardView,
    LeaderboardView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserDetailView.as_view(), name='profile'),
    path('dashboard/', UserDashboardView.as_view(), name='user_dashboard'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin_stats'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_users'),
    path('admin/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
]
