from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    FeeStructureViewSet, InvoiceViewSet, PaymentViewSet,
    ReceiptViewSet, ScholarshipViewSet, DiscountViewSet, FinancialReportsView,
    FinanceStudentMonthlyComplianceView, FinanceTeacherPayrollComplianceView,
)

router = DefaultRouter()
router.register(r'fee-structures', FeeStructureViewSet, basename='fee-structure')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'receipts', ReceiptViewSet, basename='receipt')
router.register(r'scholarships', ScholarshipViewSet, basename='scholarship')
router.register(r'discounts', DiscountViewSet, basename='discount')

urlpatterns = [
    path('reports/', FinancialReportsView.as_view(), name='financial-reports'),
    path('compliance/students/', FinanceStudentMonthlyComplianceView.as_view(), name='finance-student-compliance'),
    path('compliance/teachers/', FinanceTeacherPayrollComplianceView.as_view(), name='finance-teacher-compliance'),
    path('', include(router.urls)),
]
