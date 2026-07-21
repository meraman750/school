from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    StudentViewSet, GuardianViewSet, MedicalInfoViewSet,
    EmergencyContactViewSet, StudentDocumentViewSet, AdmissionViewSet,
)

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'guardians', GuardianViewSet, basename='guardian')
router.register(r'medical-info', MedicalInfoViewSet, basename='medical-info')
router.register(r'emergency-contacts', EmergencyContactViewSet, basename='emergency-contact')
router.register(r'documents', StudentDocumentViewSet, basename='student-document')
router.register(r'admissions', AdmissionViewSet, basename='admission')

urlpatterns = [
    path('', include(router.urls)),
]
