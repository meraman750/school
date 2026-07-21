from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'is_verified')
    list_filter = ('role', 'is_active', 'is_verified', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Biruk Academy', {'fields': ('role', 'phone', 'avatar', 'is_verified', 'must_change_password')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Biruk Academy', {'fields': ('role', 'phone', 'email', 'first_name', 'last_name')}),
    )
