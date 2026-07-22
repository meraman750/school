from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsStaffMember, IsTeacher

from .models import (
    AcademicYear, Term, Semester, Department, Subject, SchoolClass, Section,
    Curriculum, LessonPlan, Assignment, Homework, Examination, ExamSchedule,
    Grade, ReportCard, Transcript, Timetable, Room,
)
from .serializers import (
    AcademicYearSerializer, TermSerializer, SemesterSerializer, DepartmentSerializer,
    SubjectSerializer, SchoolClassSerializer, SectionSerializer, CurriculumSerializer,
    LessonPlanSerializer, AssignmentSerializer, HomeworkSerializer, ExaminationSerializer,
    ExamScheduleSerializer, GradeSerializer, ReportCardSerializer, TranscriptSerializer,
    TimetableSerializer, RoomSerializer,
)


class AcademicYearViewSet(BaseModelViewSet):
    queryset = AcademicYear.objects.filter(name__endswith=' E.C.').order_by('-start_date')
    serializer_class = AcademicYearSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['is_current']
    search_fields = ['name']


class TermViewSet(BaseModelViewSet):
    queryset = Term.objects.all()
    serializer_class = TermSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['academic_year', 'is_current']


class SemesterViewSet(BaseModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['academic_year', 'is_current']


class DepartmentViewSet(BaseModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsStaffMember]
    search_fields = ['name', 'code']


class SubjectViewSet(BaseModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['department']
    search_fields = ['name', 'code']


class SchoolClassViewSet(BaseModelViewSet):
    queryset = SchoolClass.objects.all()
    serializer_class = SchoolClassSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['academic_year', 'grade_level', 'class_teacher']
    search_fields = ['name']


class SectionViewSet(BaseModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['school_class']


class CurriculumViewSet(BaseModelViewSet):
    queryset = Curriculum.objects.all()
    serializer_class = CurriculumSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['grade_level', 'subject', 'academic_year']


class LessonPlanViewSet(BaseModelViewSet):
    queryset = LessonPlan.objects.all()
    serializer_class = LessonPlanSerializer
    permission_classes = [IsTeacher]
    filterset_fields = ['teacher', 'subject', 'school_class', 'date']
    search_fields = ['title']


class AssignmentViewSet(BaseModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsTeacher]
    filterset_fields = ['subject', 'school_class', 'teacher', 'status']
    search_fields = ['title']


class HomeworkViewSet(BaseModelViewSet):
    queryset = Homework.objects.all()
    serializer_class = HomeworkSerializer
    permission_classes = [IsTeacher]
    filterset_fields = ['assignment', 'student', 'is_late']


class ExaminationViewSet(BaseModelViewSet):
    queryset = Examination.objects.all()
    serializer_class = ExaminationSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['subject', 'term', 'exam_type']
    search_fields = ['name']


class ExamScheduleViewSet(BaseModelViewSet):
    queryset = ExamSchedule.objects.all()
    serializer_class = ExamScheduleSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['examination', 'school_class', 'date']


class GradeViewSet(BaseModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsTeacher]
    filterset_fields = ['student', 'subject', 'examination']


class ReportCardViewSet(BaseModelViewSet):
    queryset = ReportCard.objects.all()
    serializer_class = ReportCardSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['student', 'term', 'school_class', 'is_published']


class TranscriptViewSet(BaseModelViewSet):
    queryset = Transcript.objects.all()
    serializer_class = TranscriptSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['student', 'academic_year', 'is_official']


class TimetableViewSet(BaseModelViewSet):
    queryset = Timetable.objects.all()
    serializer_class = TimetableSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['school_class', 'subject', 'teacher', 'day_of_week']


class RoomViewSet(BaseModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['building', 'is_available']
    search_fields = ['name', 'building']
