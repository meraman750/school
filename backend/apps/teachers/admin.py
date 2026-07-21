from django.contrib import admin

from apps.core.admin import BaseModelAdmin
from .models import Teacher, TeacherQualification, TeacherLeave, TeacherPerformance


@admin.register(Teacher)
class TeacherAdmin(BaseModelAdmin):
    list_display = ('employee_id', 'first_name', 'last_name', 'status', 'hire_date', 'specialization')
    search_fields = ('employee_id', 'first_name', 'last_name', 'email')
    list_filter = ('status', 'gender')


@admin.register(TeacherQualification)
class TeacherQualificationAdmin(BaseModelAdmin):
    list_display = ('teacher', 'degree', 'institution', 'graduation_year')


@admin.register(TeacherLeave)
class TeacherLeaveAdmin(BaseModelAdmin):
    list_display = ('teacher', 'leave_type', 'start_date', 'end_date', 'status')
    list_filter = ('leave_type', 'status')


@admin.register(TeacherPerformance)
class TeacherPerformanceAdmin(BaseModelAdmin):
    list_display = ('teacher', 'review_period', 'review_date', 'rating')
