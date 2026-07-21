from django.db.models import Sum, Count
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsFinanceStaff

from .models import FeeStructure, Invoice, Payment, Receipt, Scholarship, Discount
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
