from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import StudentAttendanceViewSet, TeacherAttendanceViewSet, AttendanceAnalyticsView

router = DefaultRouter()
router.register(r'students', StudentAttendanceViewSet, basename='student-attendance')
router.register(r'teachers', TeacherAttendanceViewSet, basename='teacher-attendance')

urlpatterns = [
    path('analytics/', AttendanceAnalyticsView.as_view(), name='attendance-analytics'),
    path('', include(router.urls)),
]
