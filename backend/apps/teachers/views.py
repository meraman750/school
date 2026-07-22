from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsStaffMember

from .models import (
    Teacher, TeacherQualification, TeacherLeave, TeacherPerformance,
    TeacherSalaryInfo, TeacherSalaryPayment,
)
from .serializers import (
    TeacherSerializer, TeacherProfileSerializer, TeacherQualificationSerializer,
    TeacherLeaveSerializer, TeacherPerformanceSerializer,
    TeacherSalaryInfoSerializer, TeacherSalaryPaymentSerializer,
)


class TeacherViewSet(BaseModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['status', 'gender', 'specialization']
    search_fields = ['employee_id', 'first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['hire_date', 'last_name']

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        teacher = Teacher.objects.prefetch_related(
            'qualifications',
            'leaves',
            'performance_reviews',
            'salary_payments',
        ).select_related('salary_info').get(pk=self.get_object().pk)
        serializer = TeacherProfileSerializer(teacher)
        return Response(serializer.data)


class TeacherQualificationViewSet(BaseModelViewSet):
    queryset = TeacherQualification.objects.select_related('teacher')
    serializer_class = TeacherQualificationSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['teacher']
    ordering_fields = ['graduation_year']


class TeacherLeaveViewSet(BaseModelViewSet):
    queryset = TeacherLeave.objects.select_related('teacher')
    serializer_class = TeacherLeaveSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['teacher', 'leave_type', 'status']
    ordering_fields = ['start_date']


class TeacherPerformanceViewSet(BaseModelViewSet):
    queryset = TeacherPerformance.objects.select_related('teacher')
    serializer_class = TeacherPerformanceSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['teacher', 'review_period']
    ordering_fields = ['review_date', 'rating']


class TeacherSalaryInfoViewSet(BaseModelViewSet):
    queryset = TeacherSalaryInfo.objects.select_related('teacher')
    serializer_class = TeacherSalaryInfoSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['teacher']


class TeacherSalaryPaymentViewSet(BaseModelViewSet):
    queryset = TeacherSalaryPayment.objects.select_related('teacher')
    serializer_class = TeacherSalaryPaymentSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['teacher', 'status']
    ordering_fields = ['pay_period_start', 'payment_date']
