from django.contrib import admin

from .models import BaseModel


class BaseModelAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')
    list_filter = ('is_deleted', 'created_at')

    def get_queryset(self, request):
        return self.model.all_objects.all()
