from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AcademicYearViewSet, TermViewSet, SemesterViewSet, DepartmentViewSet,
    SubjectViewSet, SchoolClassViewSet, SectionViewSet, CurriculumViewSet,
    LessonPlanViewSet, AssignmentViewSet, HomeworkViewSet, ExaminationViewSet,
    ExamScheduleViewSet, GradeViewSet, ReportCardViewSet, TranscriptViewSet,
    TimetableViewSet, RoomViewSet, GradeAcademicItemViewSet, AnnualScheduleViewSet,
    GradeExamScheduleEntryViewSet,
)

router = DefaultRouter()
router.register(r'academic-years', AcademicYearViewSet, basename='academic-year')
router.register(r'terms', TermViewSet, basename='term')
router.register(r'semesters', SemesterViewSet, basename='semester')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'classes', SchoolClassViewSet, basename='school-class')
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'curricula', CurriculumViewSet, basename='curriculum')
router.register(r'lesson-plans', LessonPlanViewSet, basename='lesson-plan')
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'homework', HomeworkViewSet, basename='homework')
router.register(r'examinations', ExaminationViewSet, basename='examination')
router.register(r'exam-schedules', ExamScheduleViewSet, basename='exam-schedule')
router.register(r'grades', GradeViewSet, basename='grade')
router.register(r'report-cards', ReportCardViewSet, basename='report-card')
router.register(r'transcripts', TranscriptViewSet, basename='transcript')
router.register(r'timetables', TimetableViewSet, basename='timetable')
router.register(r'annual-schedules', AnnualScheduleViewSet, basename='annual-schedule')
router.register(r'grade-exam-schedules', GradeExamScheduleEntryViewSet, basename='grade-exam-schedule')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'grade-items', GradeAcademicItemViewSet, basename='grade-academic-item')

urlpatterns = [
    path('', include(router.urls)),
]
