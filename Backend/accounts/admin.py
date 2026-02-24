from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User

class UserAdmin(admin.AdminSite):
    site_header = "BrightSkills"
    site_title = "Admin Panel"
    index_title = "Welcome to BrightSkills Admin Panel"
    
    def each_context(self, request):
        context = super().each_context(request)
        context['site_brand'] = 'BrightSkills'
        return context
    # list_display = (
    #     "id",
    #     "username",
    #     "email",
    #     "first_name",
    #     "last_name",
    #     "role",
    #     "is_active",
    #     "is_staff",
    #     "date_joined",
    # )
    # list_filter = ("role", "is_active", "is_staff", "is_superuser", "date_joined")
    # search_fields = ("username", "email", "first_name", "last_name")
    # ordering = ("-date_joined",)
    # fieldsets = BaseUserAdmin.fieldsets + (
    #     ("BrightSkill Profile", {"fields": ("role", "bio", "avatar")}),
    # )

user_admin = UserAdmin(name='admin_panel')

user_admin.register([User])