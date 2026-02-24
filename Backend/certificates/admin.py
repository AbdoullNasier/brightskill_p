from accounts.admin import user_admin
from .models import Certificate


user_admin.register([Certificate])