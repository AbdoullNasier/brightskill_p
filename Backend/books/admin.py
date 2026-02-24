from accounts.admin import user_admin

from .models import BookRecommendation

user_admin.register([BookRecommendation])
