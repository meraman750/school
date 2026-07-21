from django.contrib import admin

from apps.core.admin import BaseModelAdmin
from .models import StudentAttendance, TeacherAttendance

admin.site.register(StudentAttendance, BaseModelAdmin)
admin.site.register(TeacherAttendance, BaseModelAdmin)
