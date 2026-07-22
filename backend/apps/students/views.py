from rest_framework.exceptions import MethodNotAllowed

from rest_framework import viewsets
from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsRegistrar, IsStaffMember

from .models import Student, Guardian, MedicalInfo, EmergencyContact, StudentDocument, Admission
from .serializers import (
    StudentSerializer, GuardianSerializer, MedicalInfoSerializer,
    EmergencyContactSerializer, StudentDocumentSerializer, AdmissionSerializer,
)


class StudentViewSet(BaseModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['status', 'gender', 'grade_level', 'section', 'city', 'region']
    search_fields = ['first_name', 'last_name', 'phone']
    ordering_fields = ['enrollment_date', 'last_name', 'created_at']

    def destroy(self, request, *args, **kwargs):
        raise MethodNotAllowed(
            'DELETE',
            detail='Students cannot be deleted. Set status to Inactive instead.',
        )


class GuardianViewSet(BaseModelViewSet):
    queryset = Guardian.objects.all()
    serializer_class = GuardianSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['student', 'relationship', 'is_primary']
    search_fields = ['first_name', 'last_name', 'phone', 'email']


class MedicalInfoViewSet(BaseModelViewSet):
    queryset = MedicalInfo.objects.all()
    serializer_class = MedicalInfoSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['student']


class EmergencyContactViewSet(BaseModelViewSet):
    queryset = EmergencyContact.objects.all()
    serializer_class = EmergencyContactSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['student', 'is_primary']
    search_fields = ['name', 'phone']


class StudentDocumentViewSet(BaseModelViewSet):
    queryset = StudentDocument.objects.all()
    serializer_class = StudentDocumentSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['student', 'document_type']
    search_fields = ['title']


class AdmissionViewSet(BaseModelViewSet):
    queryset = Admission.objects.all()
    serializer_class = AdmissionSerializer
    permission_classes = [IsRegistrar]
    filterset_fields = ['status', 'grade_applied', 'gender']
    search_fields = ['application_number', 'applicant_first_name', 'applicant_last_name', 'guardian_phone']
    ordering_fields = ['application_date', 'status']
