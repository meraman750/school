from rest_framework.exceptions import MethodNotAllowed
from rest_framework.decorators import action
from rest_framework.response import Response

from rest_framework import viewsets
from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsRegistrar, IsStaffMember

from .models import (
    Student, Guardian, MedicalInfo, EmergencyContact, StudentDocument, Admission,
    StudentGradeReport,
)
from .serializers import (
    StudentSerializer, GuardianSerializer, MedicalInfoSerializer,
    EmergencyContactSerializer, StudentDocumentSerializer, AdmissionSerializer,
    StudentProfileSerializer, StudentGradeReportSerializer, StudentGradeReportWriteSerializer,
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

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        student = Student.objects.prefetch_related(
            'guardians',
            'emergency_contacts',
            'documents',
            'grade_reports__entries__subject',
            'grade_reports__academic_year',
        ).select_related('medical_info').get(pk=pk)
        serializer = StudentProfileSerializer(student)
        return Response(serializer.data)


class StudentGradeReportViewSet(BaseModelViewSet):
    queryset = StudentGradeReport.objects.select_related(
        'student', 'academic_year',
    ).prefetch_related('entries__subject')
    permission_classes = [IsStaffMember]
    filterset_fields = ['student', 'academic_year', 'grade_level', 'quarter']
    ordering_fields = ['academic_year__start_date', 'quarter', 'created_at']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return StudentGradeReportWriteSerializer
        return StudentGradeReportSerializer

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
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
