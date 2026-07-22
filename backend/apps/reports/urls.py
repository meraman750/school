from django.urls import path

from .views import StudentReportView, TeacherReportView

urlpatterns = [
    path('students/', StudentReportView.as_view(), name='student-report'),
    path('teachers/', TeacherReportView.as_view(), name='teacher-report'),
]
