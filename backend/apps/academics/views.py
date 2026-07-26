from datetime import date, timedelta, time, datetime

from django.db.models import Count, Prefetch, Q
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsStaffMember, IsTeacher, IsStaffMemberOrPortalReadOnly
from apps.core.portal_scope import get_portal_grade_levels, portal_may_access_class, portal_may_access_grade

from .models import (
    AcademicYear, Term, Semester, Department, Subject, SchoolClass, Section,
    Curriculum, LessonPlan, Assignment, Homework, Examination, ExamSchedule,
    Grade, ReportCard, Transcript, Timetable, Room,
    GradeAcademicItem, GradeAcademicItemAttachment, Subject, AnnualSchedule, AnnualScheduleAttachment,
    GradeExamScheduleEntry, GradeExamSchedulePlan,
)
from .serializers import (
    AcademicYearSerializer, TermSerializer, SemesterSerializer, DepartmentSerializer,
    SubjectSerializer, SchoolClassSerializer, SectionSerializer, CurriculumSerializer,
    LessonPlanSerializer, AssignmentSerializer, HomeworkSerializer, ExaminationSerializer,
    ExamScheduleSerializer, GradeSerializer, ReportCardSerializer, TranscriptSerializer,
    TimetableSerializer, RoomSerializer, GradeAcademicItemSerializer, AnnualScheduleSerializer,
    GradeExamScheduleEntrySerializer, GradeExamSchedulePlanSerializer,
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
    permission_classes = [IsStaffMemberOrPortalReadOnly]
    filterset_fields = ['department']
    search_fields = ['name', 'code']


class SchoolClassViewSet(BaseModelViewSet):
    queryset = SchoolClass.objects.all()
    serializer_class = SchoolClassSerializer
    permission_classes = [IsStaffMemberOrPortalReadOnly]
    filterset_fields = ['academic_year', 'grade_level', 'class_teacher']
    search_fields = ['name']

    @action(detail=False, methods=['post'], url_path='ensure-grade-sections')
    def ensure_grade_sections(self, request):
        grade_level = request.data.get('grade_level')
        if grade_level is None:
            return Response({'detail': 'grade_level is required.'}, status=400)
        try:
            grade_level = int(grade_level)
        except (TypeError, ValueError):
            return Response({'detail': 'Invalid grade_level.'}, status=400)
        if grade_level < 1 or grade_level > 8:
            return Response({'detail': 'grade_level must be between 1 and 8.'}, status=400)
        if not portal_may_access_grade(request.user, grade_level):
            return Response({'detail': 'You may only view your own class timetable.'}, status=403)

        academic_year = AcademicYear.objects.filter(is_current=True).first()
        if not academic_year:
            academic_year = AcademicYear.objects.order_by('-start_date').first()
        if not academic_year:
            return Response({'detail': 'No academic year configured.'}, status=400)

        school_class = SchoolClass.objects.filter(
            academic_year=academic_year,
            grade_level=grade_level,
            is_deleted=False,
        ).first()
        if not school_class:
            school_class = SchoolClass.objects.create(
                name=f'Grade {grade_level}',
                grade_level=grade_level,
                academic_year=academic_year,
                capacity=40,
                created_by=request.user,
                updated_by=request.user,
            )

        sections = []
        for letter in ('A', 'B', 'C'):
            section, _ = Section.objects.get_or_create(
                school_class=school_class,
                name=letter,
                defaults={
                    'capacity': 40,
                    'created_by': request.user,
                    'updated_by': request.user,
                },
            )
            sections.append(section)

        serializer = SectionSerializer(sections, many=True)
        return Response({
            'school_class': SchoolClassSerializer(school_class).data,
            'sections': serializer.data,
        })


class SectionViewSet(BaseModelViewSet):
    queryset = Section.objects.select_related('school_class').all()
    serializer_class = SectionSerializer
    permission_classes = [IsStaffMemberOrPortalReadOnly]
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


class GradeExamScheduleEntryViewSet(BaseModelViewSet):
    queryset = GradeExamScheduleEntry.objects.select_related('subject').filter(is_deleted=False)
    serializer_class = GradeExamScheduleEntrySerializer
    permission_classes = [IsStaffMemberOrPortalReadOnly]
    filterset_fields = ['grade_level', 'subject', 'exam_date']
    ordering_fields = ['exam_date', 'start_time', 'schedule_slot_index']

    def get_queryset(self):
        from apps.core.portal_scope import filter_queryset_for_portal
        return filter_queryset_for_portal(self.request.user, super().get_queryset())

    def _parse_grade_level(self, request):
        grade_level = request.query_params.get('grade_level')
        if grade_level is None and hasattr(request, 'data'):
            grade_level = request.data.get('grade_level')
        if grade_level is None:
            return None, Response({'detail': 'grade_level is required.'}, status=400)
        try:
            grade_level = int(grade_level)
        except (TypeError, ValueError):
            return None, Response({'detail': 'Invalid grade_level.'}, status=400)
        if grade_level < 1 or grade_level > 8:
            return None, Response({'detail': 'grade_level must be between 1 and 8.'}, status=400)
        return grade_level, None

    @action(detail=False, methods=['get', 'patch'], url_path='grade-plan')
    def grade_plan(self, request):
        grade_level, err = self._parse_grade_level(request)
        if err:
            return err
        if not portal_may_access_grade(request.user, grade_level):
            return Response({'detail': 'You may only view your own class exam schedule.'}, status=403)
        user = request.user
        if request.method == 'GET':
            plan, _ = GradeExamSchedulePlan.objects.get_or_create(
                grade_level=grade_level,
                defaults={
                    'title': f'Grade {grade_level} Exam Schedule',
                    'subjects_per_day': 1,
                    'created_by': user,
                    'updated_by': user,
                },
            )
            return Response(GradeExamSchedulePlanSerializer(plan).data)

        plan = GradeExamSchedulePlan.objects.filter(
            grade_level=grade_level, is_deleted=False,
        ).first()
        if not plan:
            plan = GradeExamSchedulePlan.objects.create(
                grade_level=grade_level,
                title=f'Grade {grade_level} Exam Schedule',
                subjects_per_day=1,
                created_by=user,
                updated_by=user,
            )
        serializer = GradeExamSchedulePlanSerializer(
            plan, data=request.data, partial=True, context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @staticmethod
    def _next_monday(from_day=None):
        base = from_day or date.today()
        while base.weekday() != 0:
            base += timedelta(days=1)
        return base

    @action(detail=False, methods=['post'], url_path='save-grade-week')
    def save_grade_week(self, request):
        grade_level, err = self._parse_grade_level(request)
        if err:
            return err

        slots = request.data.get('slots', [])
        title = (request.data.get('title') or '').strip()
        week_start_raw = request.data.get('week_start_date')
        scheduled_raw = request.data.get('scheduled_days', [])
        user = request.user

        scheduled_weekdays = []
        for item in scheduled_raw if isinstance(scheduled_raw, list) else []:
            try:
                day_num = int(item)
            except (TypeError, ValueError):
                continue
            if 1 <= day_num <= 7:
                scheduled_weekdays.append(day_num)

        week_start = None
        if week_start_raw:
            try:
                if isinstance(week_start_raw, str):
                    week_start = date.fromisoformat(week_start_raw[:10])
                else:
                    week_start = week_start_raw
            except (TypeError, ValueError):
                return Response({'detail': 'Invalid week_start_date.'}, status=400)
        if week_start is None:
            week_start = self._next_monday()
        elif week_start.weekday() != 0:
            return Response({'detail': 'week_start_date must be a Monday.'}, status=400)

        plan = GradeExamSchedulePlan.objects.filter(
            grade_level=grade_level, is_deleted=False,
        ).first()
        if not plan:
            plan = GradeExamSchedulePlan.objects.create(
                grade_level=grade_level,
                title=title or f'Grade {grade_level} Exam Schedule',
                week_start_date=week_start,
                scheduled_weekdays=scheduled_weekdays,
                created_by=user,
                updated_by=user,
            )
        else:
            plan.title = title or plan.title
            plan.week_start_date = week_start
            plan.updated_by = user

        existing = GradeExamScheduleEntry.all_objects.filter(
            grade_level=grade_level, is_deleted=False,
        )
        for row in existing:
            row.soft_delete()

        created = []
        for slot in slots:
            subject_id = slot.get('subject')
            day_of_week = slot.get('day_of_week')
            start_raw = slot.get('start_time')
            end_raw = slot.get('end_time')
            slot_index_raw = slot.get('schedule_slot_index', 0)
            if not subject_id or not day_of_week or not start_raw or not end_raw:
                continue
            try:
                day_of_week = int(day_of_week)
                slot_index = int(slot_index_raw)
            except (TypeError, ValueError):
                continue
            if day_of_week < 1 or day_of_week > 7 or slot_index < 0:
                continue
            exam_date = week_start + timedelta(days=day_of_week - 1)

            def parse_clock(raw):
                s = str(raw).strip()
                if len(s) >= 5:
                    return datetime.strptime(s[:5], '%H:%M').time()
                return time.fromisoformat(s[:8])

            start_t = start_raw if isinstance(start_raw, time) else parse_clock(start_raw)
            end_t = end_raw if isinstance(end_raw, time) else parse_clock(end_raw)
            if end_t <= start_t:
                continue
            entry = GradeExamScheduleEntry.objects.create(
                grade_level=grade_level,
                subject_id=subject_id,
                exam_date=exam_date,
                start_time=start_t,
                end_time=end_t,
                schedule_slot_index=slot_index,
                created_by=user,
                updated_by=user,
            )
            created.append(entry)

        if not created:
            return Response({'detail': 'Add at least one exam before saving.'}, status=400)

        plan.scheduled_weekdays = scheduled_weekdays
        plan.save(update_fields=[
            'title', 'week_start_date', 'scheduled_weekdays', 'updated_by', 'updated_at',
        ])

        return Response(GradeExamScheduleEntrySerializer(created, many=True).data)

    @action(detail=False, methods=['post'], url_path='ensure-grade-sample')
    def ensure_grade_sample(self, request):
        grade_level, err = self._parse_grade_level(request)
        if err:
            return err

        user = request.user
        GradeExamSchedulePlan.objects.get_or_create(
            grade_level=grade_level,
            defaults={
                'title': f'Grade {grade_level} Exam Schedule',
                'week_start_date': self._next_monday(),
                'subjects_per_day': 1,
                'created_by': user,
                'updated_by': user,
            },
        )

        existing = self.get_queryset().filter(grade_level=grade_level).order_by('exam_date', 'start_time')
        return Response(GradeExamScheduleEntrySerializer(existing, many=True).data)


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
    queryset = Timetable.objects.select_related(
        'school_class', 'section', 'subject', 'teacher', 'room',
    ).all()
    serializer_class = TimetableSerializer
    permission_classes = [IsStaffMemberOrPortalReadOnly]
    filterset_fields = ['school_class', 'section', 'subject', 'teacher', 'day_of_week', 'period_number']
    ordering_fields = ['day_of_week', 'period_number', 'start_time']

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        role = getattr(request.user, 'role', None)
        if role in ('TEACHER', 'STUDENT', 'PARENT') and request.method not in ('GET', 'HEAD', 'OPTIONS'):
            raise MethodNotAllowed(
                request.method,
                detail='Teachers have view-only access to class timetables.',
            )

    PERIOD_TIMES = {
        1: (time(8, 0), time(8, 45)),
        2: (time(8, 50), time(9, 35)),
        3: (time(9, 40), time(10, 25)),
        4: (time(10, 45), time(11, 30)),
        5: (time(11, 35), time(12, 20)),
        6: (time(13, 30), time(14, 15)),
        7: (time(14, 20), time(15, 5)),
    }

    @action(detail=False, methods=['get'], url_path='section-grid')
    def section_grid(self, request):
        section_id = request.query_params.get('section')
        if not section_id:
            return Response({'detail': 'section query parameter is required.'}, status=400)
        try:
            section = Section.objects.select_related('school_class').get(
                pk=section_id, is_deleted=False,
            )
        except Section.DoesNotExist:
            return Response({'detail': 'Section not found.'}, status=404)
        if section.school_class and not portal_may_access_class(
            request.user,
            section.school_class.grade_level,
            section.name,
        ):
            return Response({'detail': 'You may only view your own class timetable.'}, status=403)
        rows = self.get_queryset().filter(section_id=section_id).order_by('day_of_week', 'period_number')
        return Response(TimetableSerializer(rows, many=True).data)

    @action(detail=False, methods=['post'], url_path='save-section-grid')
    def save_section_grid(self, request):
        section_id = request.data.get('section')
        slots = request.data.get('slots', [])
        if not section_id:
            return Response({'detail': 'section is required.'}, status=400)
        try:
            section = Section.objects.select_related('school_class').get(pk=section_id, is_deleted=False)
        except Section.DoesNotExist:
            return Response({'detail': 'Section not found.'}, status=404)

        school_class = section.school_class
        default_teacher = school_class.class_teacher
        if not default_teacher:
            from apps.teachers.models import Teacher
            default_teacher = Teacher.objects.filter(is_deleted=False).first()

        existing = Timetable.all_objects.filter(section_id=section_id, is_deleted=False)
        for row in existing:
            row.soft_delete()

        user = request.user
        created = []
        for slot in slots:
            subject_id = slot.get('subject')
            day = slot.get('day_of_week')
            period = slot.get('period_number')
            if not subject_id or not day or not period:
                continue
            try:
                day = int(day)
                period = int(period)
            except (TypeError, ValueError):
                continue
            if period < 1 or period > 7 or day < 1 or day > 6:
                continue
            start_t, end_t = self.PERIOD_TIMES.get(period, (time(8, 0), time(8, 45)))
            teacher_id = slot.get('teacher') or (default_teacher.id if default_teacher else None)
            row = Timetable.objects.create(
                school_class=school_class,
                section=section,
                subject_id=subject_id,
                teacher_id=teacher_id,
                day_of_week=day,
                period_number=period,
                start_time=start_t,
                end_time=end_t,
                created_by=user,
                updated_by=user,
            )
            created.append(row)

        return Response(TimetableSerializer(created, many=True).data)


class AnnualScheduleViewSet(BaseModelViewSet):
    queryset = AnnualSchedule.objects.select_related('academic_year').filter(
        is_deleted=False,
    ).prefetch_related(
        Prefetch(
            'attachments',
            queryset=AnnualScheduleAttachment.objects.filter(is_deleted=False),
        ),
    )
    serializer_class = AnnualScheduleSerializer
    permission_classes = [IsStaffMemberOrPortalReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['academic_year', 'event_type', 'grade_level']
    search_fields = ['title', 'description']
    ordering_fields = ['start_date', 'title']

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        role = getattr(request.user, 'role', None)
        if role in ('TEACHER', 'STUDENT', 'PARENT') and request.method not in ('GET', 'HEAD', 'OPTIONS'):
            raise MethodNotAllowed(
                request.method,
                detail='Teachers have view-only access to the annual schedule.',
            )

    @action(detail=False, methods=['get'], url_path='year-options')
    def year_options(self, request):
        years = AcademicYear.objects.filter(
            is_deleted=False,
            name__endswith=' E.C.',
        ).annotate(
            event_count=Count(
                'annual_schedules',
                filter=Q(annual_schedules__is_deleted=False),
            ),
        ).order_by('-start_date')
        return Response([{
            'id': year.id,
            'name': year.name,
            'event_count': year.event_count,
            'start_date': year.start_date,
            'end_date': year.end_date,
        } for year in years])


class RoomViewSet(BaseModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['building', 'is_available']
    search_fields = ['name', 'building']


class GradeAcademicItemViewSet(BaseModelViewSet):
    queryset = GradeAcademicItem.objects.filter(is_deleted=False).select_related(
        'academic_year', 'subject', 'created_by',
    ).prefetch_related(
        Prefetch(
            'attachments',
            queryset=GradeAcademicItemAttachment.objects.filter(is_deleted=False),
        ),
    )
    serializer_class = GradeAcademicItemSerializer
    permission_classes = [IsStaffMemberOrPortalReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['item_type', 'grade_level', 'academic_year', 'subject']
    search_fields = ['title', 'description', 'subject__name', 'subject__code']
    ordering_fields = ['created_at', 'grade_level', 'title']

    @action(detail=False, methods=['get'], url_path='subject-options')
    def subject_options(self, request):
        item_type = request.query_params.get('item_type')
        valid_types = dict(GradeAcademicItem.ItemType.choices)
        if item_type not in valid_types:
            return Response(
                {'detail': 'item_type is required (ASSIGNMENT, MID_EXAM, FINAL_EXAM, or MATERIAL).'},
                status=400,
            )
        item_filter = Q(
            grade_academic_items__item_type=item_type,
            grade_academic_items__is_deleted=False,
        )
        subjects = Subject.objects.filter(is_deleted=False).annotate(
            item_count=Count(
                'grade_academic_items',
                filter=item_filter,
            ),
        ).order_by('name')
        portal = get_portal_grade_levels(request.user) is not None
        payload = [{
            'id': subject.id,
            'name': subject.name,
            'code': subject.code,
            'item_count': subject.item_count,
        } for subject in subjects if subject.item_count > 0 or portal]
        return Response(payload)
