from django.contrib import admin

from apps.core.admin import BaseModelAdmin
from .models import Student, Guardian, MedicalInfo, EmergencyContact, StudentDocument, Admission


@admin.register(Student)
class StudentAdmin(BaseModelAdmin):
    list_display = ('admission_number', 'first_name', 'last_name', 'gender', 'status', 'enrollment_date')
    search_fields = ('admission_number', 'first_name', 'last_name', 'email')
    list_filter = ('status', 'gender', 'is_deleted')


@admin.register(Guardian)
class GuardianAdmin(BaseModelAdmin):
    list_display = ('first_name', 'last_name', 'student', 'relationship', 'is_primary', 'phone')
    search_fields = ('first_name', 'last_name', 'phone')


@admin.register(MedicalInfo)
class MedicalInfoAdmin(BaseModelAdmin):
    list_display = ('student', 'doctor_name', 'insurance_provider')


@admin.register(EmergencyContact)
class EmergencyContactAdmin(BaseModelAdmin):
    list_display = ('name', 'student', 'phone', 'is_primary')


@admin.register(StudentDocument)
class StudentDocumentAdmin(BaseModelAdmin):
    list_display = ('title', 'student', 'document_type', 'uploaded_at')
    list_filter = ('document_type',)


@admin.register(Admission)
class AdmissionAdmin(BaseModelAdmin):
    list_display = ('application_number', 'applicant_first_name', 'applicant_last_name', 'status', 'grade_applied')
    list_filter = ('status', 'grade_applied')
