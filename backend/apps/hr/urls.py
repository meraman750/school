from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import EmployeeViewSet, PayrollViewSet, EmployeeLeaveViewSet, PerformanceReviewViewSet

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'payrolls', PayrollViewSet, basename='payroll')
router.register(r'leaves', EmployeeLeaveViewSet, basename='employee-leave')
router.register(r'performance-reviews', PerformanceReviewViewSet, basename='performance-review')

urlpatterns = [
    path('', include(router.urls)),
]
