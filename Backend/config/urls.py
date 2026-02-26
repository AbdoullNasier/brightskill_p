from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

from accounts.admin import user_admin

urlpatterns = [
    path("admin/", user_admin.urls),
    path("api/", include("core.urls")),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("accounts.urls")),
    path("api/", include("courses.urls")),
    path("api/courses/", include("courses.urls")),
    path("api/progress/", include("progress.urls")),
    path("api/certificates/", include("certificates.urls")),
    path("api/books/", include("books.urls")),
    path("api/", include("ai_engine.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
