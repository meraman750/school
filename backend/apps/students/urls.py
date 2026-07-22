from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    StudentViewSet, GuardianViewSet, MedicalInfoViewSet,
    EmergencyContactViewSet, StudentDocumentViewSet, AdmissionViewSet,
    StudentGradeReportViewSet, StudentEnrollmentRecordViewSet, StudentNoteViewSet,
)

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'grade-reports', StudentGradeReportViewSet, basename='student-grade-report')
router.register(r'enrollment-records', StudentEnrollmentRecordViewSet, basename='student-enrollment')
router.register(r'notes', StudentNoteViewSet, basename='student-note')
router.register(r'guardians', GuardianViewSet, basename='guardian')
router.register(r'medical-info', MedicalInfoViewSet, basename='medical-info')
router.register(r'emergency-contacts', EmergencyContactViewSet, basename='emergency-contact')
router.register(r'documents', StudentDocumentViewSet, basename='student-document')
router.register(r'admissions', AdmissionViewSet, basename='admission')

urlpatterns = [
    path('', include(router.urls)),
]
