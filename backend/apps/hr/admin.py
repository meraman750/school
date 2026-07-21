from django.contrib import admin

from apps.core.admin import BaseModelAdmin
from .models import Employee, Payroll, EmployeeLeave, PerformanceReview

for model in [Employee, Payroll, EmployeeLeave, PerformanceReview]:
    admin.site.register(model, BaseModelAdmin)
