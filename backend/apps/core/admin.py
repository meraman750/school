from django.contrib import admin

from .models import BaseModel, DashboardActivity


class BaseModelAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')
    list_filter = ('is_deleted', 'created_at')

    def get_queryset(self, request):
        return self.model.all_objects.all()


@admin.register(DashboardActivity)
class DashboardActivityAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'actor_name', 'actor_role', 'module', 'action', 'summary')
    list_filter = ('actor_role', 'module', 'action')
    search_fields = ('actor_name', 'actor_email', 'summary', 'detail')
    readonly_fields = ('created_at',)
