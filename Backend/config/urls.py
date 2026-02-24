from accounts.admin import user_admin
from django.urls import include, path

urlpatterns = [
    path("admin/", user_admin.urls),
    path("api/", include("core.urls")),
    path("api/auth/", include("accounts.urls")),
    path("api/courses/", include("courses.urls")),
    path("api/progress/", include("progress.urls")),
    path("api/certificates/", include("certificates.urls")),
    path("api/books/", include("books.urls")),
    path("api/", include("ai_engine.urls")),
]
