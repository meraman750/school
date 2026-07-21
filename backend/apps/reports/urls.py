from django.urls import path

from .views import StudentReportView, TeacherReportView, AttendanceReportView, FinanceReportView

urlpatterns = [
    path('students/', StudentReportView.as_view(), name='student-report'),
    path('teachers/', TeacherReportView.as_view(), name='teacher-report'),
    path('attendance/', AttendanceReportView.as_view(), name='attendance-report'),
    path('finance/', FinanceReportView.as_view(), name='finance-report'),
]
