from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsFinanceStaff
from apps.students.models import Student
from apps.teachers.models import Teacher

from .compliance import (
    build_student_compliance_row,
    build_teacher_compliance_row,
    set_student_month_paid,
    set_teacher_month_paid,
)
from .models import (
    FeeStructure, Invoice, Payment, Receipt, Scholarship, Discount,
)
from .serializers import (
    FeeStructureSerializer, InvoiceSerializer, PaymentSerializer,
    ReceiptSerializer, ScholarshipSerializer, DiscountSerializer,
)


class FeeStructureViewSet(BaseModelViewSet):
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer
    permission_classes = [IsFinanceStaff]
    filterset_fields = ['academic_year', 'school_class', 'is_active']
    search_fields = ['name']


class InvoiceViewSet(BaseModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsFinanceStaff]
    filterset_fields = ['student', 'status', 'issue_date']
    search_fields = ['invoice_number']
    ordering_fields = ['issue_date', 'due_date']


class PaymentViewSet(BaseModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsFinanceStaff]
    filterset_fields = ['invoice', 'payment_method', 'status', 'payment_date']
    search_fields = ['payment_reference', 'transaction_id']
    ordering_fields = ['payment_date']


class ReceiptViewSet(BaseModelViewSet):
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer
    permission_classes = [IsFinanceStaff]
    filterset_fields = ['issued_date']
    search_fields = ['receipt_number', 'issued_to']


class ScholarshipViewSet(BaseModelViewSet):
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer
    permission_classes = [IsFinanceStaff]
    filterset_fields = ['student', 'status']
    search_fields = ['name', 'sponsor']


class DiscountViewSet(BaseModelViewSet):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer
    permission_classes = [IsFinanceStaff]
    filterset_fields = ['student', 'fee_structure', 'is_active', 'discount_type']
    search_fields = ['name']


class FinancialReportsView(APIView):
    permission_classes = [IsFinanceStaff]

    def get(self, request):
        total_invoiced = Invoice.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        total_collected = Payment.objects.filter(status='COMPLETED').aggregate(total=Sum('amount'))['total'] or 0
        pending_invoices = Invoice.objects.filter(status__in=['PENDING', 'PARTIAL', 'OVERDUE']).count()
        overdue_amount = Invoice.objects.filter(status='OVERDUE').aggregate(
            total=Sum('total_amount'),
        )['total'] or 0

        payments_by_method = Payment.objects.filter(status='COMPLETED').values('payment_method').annotate(
            total=Sum('amount'), count=Count('id'),
        )

        return Response({
            'success': True,
            'data': {
                'total_invoiced': float(total_invoiced),
                'total_collected': float(total_collected),
                'outstanding': float(total_invoiced - total_collected),
                'pending_invoices': pending_invoices,
                'overdue_amount': float(overdue_amount),
                'payments_by_method': list(payments_by_method),
            },
        })


class FinanceStudentMonthlyComplianceView(APIView):
    """Track whether each active student paid required fees per calendar month."""
    permission_classes = [IsFinanceStaff]

    def get(self, request):
        year = int(request.query_params.get('year', timezone.now().year))
        students = Student.objects.filter(is_deleted=False, status='ACTIVE').order_by('last_name', 'first_name')
        rows = [build_student_compliance_row(student, year) for student in students]
        return Response({'year': year, 'students': rows})

    def post(self, request):
        try:
            student_id = int(request.data.get('student_id'))
            year = int(request.data.get('year', timezone.now().year))
            month = int(request.data.get('month'))
            paid = request.data.get('paid')
        except (TypeError, ValueError):
            return Response({'detail': 'student_id, year, month, and paid are required.'}, status=400)
        if month < 1 or month > 12:
            return Response({'detail': 'month must be between 1 and 12.'}, status=400)
        if not isinstance(paid, bool):
            if str(paid).lower() in ('true', '1', 'yes'):
                paid = True
            elif str(paid).lower() in ('false', '0', 'no'):
                paid = False
            else:
                return Response({'detail': 'paid must be true or false.'}, status=400)
        try:
            student = Student.objects.get(pk=student_id, is_deleted=False)
        except Student.DoesNotExist:
            return Response({'detail': 'Student not found.'}, status=404)
        set_student_month_paid(student, year, month, paid, request.user)
        return Response(build_student_compliance_row(student, year))


class FinanceTeacherPayrollComplianceView(APIView):
    """Track whether each active teacher received salary per calendar month."""
    permission_classes = [IsFinanceStaff]

    def get(self, request):
        year = int(request.query_params.get('year', timezone.now().year))
        teachers = Teacher.objects.filter(is_deleted=False, status='ACTIVE').order_by('last_name', 'first_name')
        rows = [build_teacher_compliance_row(teacher, year) for teacher in teachers]
        return Response({'year': year, 'teachers': rows})

    def post(self, request):
        try:
            teacher_id = int(request.data.get('teacher_id'))
            year = int(request.data.get('year', timezone.now().year))
            month = int(request.data.get('month'))
            paid = request.data.get('paid')
        except (TypeError, ValueError):
            return Response({'detail': 'teacher_id, year, month, and paid are required.'}, status=400)
        if month < 1 or month > 12:
            return Response({'detail': 'month must be between 1 and 12.'}, status=400)
        if not isinstance(paid, bool):
            if str(paid).lower() in ('true', '1', 'yes'):
                paid = True
            elif str(paid).lower() in ('false', '0', 'no'):
                paid = False
            else:
                return Response({'detail': 'paid must be true or false.'}, status=400)
        try:
            teacher = Teacher.objects.get(pk=teacher_id, is_deleted=False)
        except Teacher.DoesNotExist:
            return Response({'detail': 'Teacher not found.'}, status=404)
        set_teacher_month_paid(teacher, year, month, paid, request.user)
        return Response(build_teacher_compliance_row(teacher, year))
