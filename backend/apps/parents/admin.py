from django.contrib import admin

from apps.core.admin import BaseModelAdmin
from .models import ParentProfile


@admin.register(ParentProfile)
class ParentProfileAdmin(BaseModelAdmin):
    list_display = ('user', 'relationship', 'occupation', 'is_primary_contact')
    search_fields = ('user__first_name', 'user__last_name', 'user__email')
    filter_horizontal = ('students',)
