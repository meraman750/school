from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsStaffMember, IsPrincipal

from .models import Teacher, TeacherQualification, TeacherLeave, TeacherPerformance
from .serializers import (
    TeacherSerializer, TeacherQualificationSerializer,
    TeacherLeaveSerializer, TeacherPerformanceSerializer,
)


class TeacherViewSet(BaseModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['status', 'gender', 'specialization']
    search_fields = ['employee_id', 'first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['hire_date', 'last_name']


class TeacherQualificationViewSet(BaseModelViewSet):
    queryset = TeacherQualification.objects.all()
    serializer_class = TeacherQualificationSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['teacher']


class TeacherLeaveViewSet(BaseModelViewSet):
    queryset = TeacherLeave.objects.all()
    serializer_class = TeacherLeaveSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['teacher', 'leave_type', 'status']
    ordering_fields = ['start_date']


class TeacherPerformanceViewSet(BaseModelViewSet):
    queryset = TeacherPerformance.objects.all()
    serializer_class = TeacherPerformanceSerializer
    permission_classes = [IsPrincipal]
    filterset_fields = ['teacher', 'review_period']
    ordering_fields = ['review_date', 'rating']
