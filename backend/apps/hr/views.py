from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsStaffMember, IsPrincipal

from .models import Employee, Payroll, EmployeeLeave, PerformanceReview
from .serializers import EmployeeSerializer, PayrollSerializer, EmployeeLeaveSerializer, PerformanceReviewSerializer


class EmployeeViewSet(BaseModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['department', 'status', 'employment_type']
    search_fields = ['employee_id', 'first_name', 'last_name', 'email']


class PayrollViewSet(BaseModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['employee', 'status']
    ordering_fields = ['pay_period_start']


class EmployeeLeaveViewSet(BaseModelViewSet):
    queryset = EmployeeLeave.objects.all()
    serializer_class = EmployeeLeaveSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['employee', 'leave_type', 'status']


class PerformanceReviewViewSet(BaseModelViewSet):
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer
    permission_classes = [IsPrincipal]
    filterset_fields = ['employee', 'review_period']
