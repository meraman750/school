from django.urls import path

from .views import ClassStudentMarksReportView

urlpatterns = [
    path('students/class-marks/', ClassStudentMarksReportView.as_view(), name='class-student-marks-report'),
]
