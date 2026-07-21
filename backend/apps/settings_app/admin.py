from django.contrib import admin

from apps.core.admin import BaseModelAdmin
from .models import SchoolProfile, AcademicSettings, GradingSettings, EmailSettings

for model in [SchoolProfile, AcademicSettings, GradingSettings, EmailSettings]:
    admin.site.register(model, BaseModelAdmin)
