from django.contrib import admin

from .models import TutorApplication, User


class UserAdmin(admin.AdminSite):
    site_header = "BrightSkills"
    site_title = "Admin Panel"
    index_title = "Welcome to BrightSkills Admin Panel"

    def each_context(self, request):
        context = super().each_context(request)
        context["site_brand"] = "BrightSkills"
        return context


class TutorApplicationAdmin(admin.ModelAdmin):
    list_display = ("user", "qualification", "experience_years", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("user__email",)


user_admin = UserAdmin(name="admin_panel")
user_admin.register(User)
user_admin.register(TutorApplication, TutorApplicationAdmin)
