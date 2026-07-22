from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    TeacherViewSet, TeacherQualificationViewSet,
    TeacherLeaveViewSet, TeacherPerformanceViewSet,
    TeacherSalaryInfoViewSet, TeacherSalaryPaymentViewSet,
)

router = DefaultRouter()
router.register(r'teachers', TeacherViewSet, basename='teacher')
router.register(r'qualifications', TeacherQualificationViewSet, basename='teacher-qualification')
router.register(r'leaves', TeacherLeaveViewSet, basename='teacher-leave')
router.register(r'performance', TeacherPerformanceViewSet, basename='teacher-performance')
router.register(r'salary-info', TeacherSalaryInfoViewSet, basename='teacher-salary-info')
router.register(r'salary-payments', TeacherSalaryPaymentViewSet, basename='teacher-salary-payment')

urlpatterns = [
    path('', include(router.urls)),
]
