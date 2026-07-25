from django.contrib import admin

from apps.core.admin import BaseModelAdmin
from .models import (
    AcademicYear, Term, Semester, Department, Subject, SchoolClass, Section,
    Curriculum, LessonPlan, Assignment, Homework, Examination, ExamSchedule,
    Grade, ReportCard, Transcript, Timetable, Room, AnnualSchedule,
)

MODELS = [
    AcademicYear, Term, Semester, Department, Subject, SchoolClass, Section,
    Curriculum, LessonPlan, Assignment, Homework, Examination, ExamSchedule,
    Grade, ReportCard, Transcript, Timetable, Room, AnnualSchedule,
]

for model in MODELS:
    admin.site.register(model, BaseModelAdmin)
