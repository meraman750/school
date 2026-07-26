from django.conf import settings
from django.db import models
from django.db.models import Q

from apps.core.models import BaseModel
from apps.students.models import Student
from apps.teachers.models import Teacher


class AcademicYear(BaseModel):
    name = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ['-start_date']
        verbose_name_plural = 'Academic years'

    def __str__(self):
        return self.name


class Term(BaseModel):
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='terms')
    name = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ['start_date']

    def __str__(self):
        return f'{self.name} - {self.academic_year}'


class Semester(BaseModel):
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='semesters')
    name = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ['start_date']

    def __str__(self):
        return f'{self.name} - {self.academic_year}'


class Department(BaseModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    head = models.ForeignKey(
        Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_departments',
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Subject(BaseModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='subjects')
    description = models.TextField(blank=True)
    credit_hours = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.code} - {self.name}'


class SchoolClass(BaseModel):
    name = models.CharField(max_length=50)
    grade_level = models.PositiveIntegerField()
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='classes')
    class_teacher = models.ForeignKey(
        Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='classes_taught',
    )
    capacity = models.PositiveIntegerField(default=40)
    room = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ['grade_level', 'name']
        verbose_name_plural = 'School classes'

    def __str__(self):
        return f'{self.name} ({self.academic_year})'


class Section(BaseModel):
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=10)
    capacity = models.PositiveIntegerField(default=40)

    class Meta:
        ordering = ['school_class', 'name']
        unique_together = ['school_class', 'name']

    def __str__(self):
        return f'{self.school_class.name} - Section {self.name}'


class Curriculum(BaseModel):
    name = models.CharField(max_length=100)
    grade_level = models.PositiveIntegerField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='curricula')
    description = models.TextField(blank=True)
    objectives = models.TextField(blank=True)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='curricula')

    class Meta:
        ordering = ['grade_level', 'subject']
        verbose_name_plural = 'Curricula'

    def __str__(self):
        return f'{self.name} - Grade {self.grade_level}'


class LessonPlan(BaseModel):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='lesson_plans')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='lesson_plans')
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name='lesson_plans')
    title = models.CharField(max_length=200)
    date = models.DateField()
    objectives = models.TextField()
    materials = models.TextField(blank=True)
    activities = models.TextField()
    assessment = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f'{self.title} - {self.date}'


class Assignment(BaseModel):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PUBLISHED = 'PUBLISHED', 'Published'
        CLOSED = 'CLOSED', 'Closed'

    title = models.CharField(max_length=200)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='assignments')
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name='assignments')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='assignments')
    description = models.TextField()
    due_date = models.DateTimeField()
    max_score = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    attachment = models.FileField(upload_to='assignments/', blank=True, null=True)

    class Meta:
        ordering = ['-due_date']

    def __str__(self):
        return self.title


class Homework(BaseModel):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='homework_submissions')
    submission_file = models.FileField(upload_to='homework/', blank=True, null=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    is_late = models.BooleanField(default=False)

    class Meta:
        ordering = ['-submitted_at']
        verbose_name_plural = 'Homework'

    def __str__(self):
        return f'{self.student} - {self.assignment.title}'


class Examination(BaseModel):
    name = models.CharField(max_length=100)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='examinations')
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='examinations')
    exam_type = models.CharField(max_length=50)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    passing_marks = models.DecimalField(max_digits=5, decimal_places=2, default=40)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-term__start_date', 'name']

    def __str__(self):
        return f'{self.name} - {self.subject}'


class ExamSchedule(BaseModel):
    examination = models.ForeignKey(Examination, on_delete=models.CASCADE, related_name='schedules')
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name='exam_schedules')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.ForeignKey('Room', on_delete=models.SET_NULL, null=True, blank=True, related_name='exam_schedules')
    invigilator = models.ForeignKey(
        Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='invigilated_exams',
    )

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f'{self.examination} - {self.date}'


class Grade(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='grades')
    examination = models.ForeignKey(Examination, on_delete=models.CASCADE, related_name='grades')
    score = models.DecimalField(max_digits=5, decimal_places=2)
    grade_letter = models.CharField(max_length=5, blank=True)
    remarks = models.TextField(blank=True)
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='grades_given',
    )

    class Meta:
        ordering = ['-examination__term__start_date']
        unique_together = ['student', 'subject', 'examination']

    def __str__(self):
        return f'{self.student} - {self.subject}: {self.score}'


class ReportCard(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='report_cards')
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='report_cards')
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name='report_cards')
    total_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    average_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    rank = models.PositiveIntegerField(null=True, blank=True)
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    conduct_grade = models.CharField(max_length=5, blank=True)
    teacher_remarks = models.TextField(blank=True)
    principal_remarks = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ['-term__start_date']
        unique_together = ['student', 'term']

    def __str__(self):
        return f'{self.student} - {self.term}'


class Transcript(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='transcripts')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='transcripts')
    cumulative_gpa = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    total_credits = models.PositiveIntegerField(default=0)
    remarks = models.TextField(blank=True)
    issued_date = models.DateField(null=True, blank=True)
    is_official = models.BooleanField(default=False)

    class Meta:
        ordering = ['-academic_year__start_date']
        unique_together = ['student', 'academic_year']

    def __str__(self):
        return f'{self.student} - {self.academic_year}'


class Timetable(BaseModel):
    class DayOfWeek(models.IntegerChoices):
        MONDAY = 1, 'Monday'
        TUESDAY = 2, 'Tuesday'
        WEDNESDAY = 3, 'Wednesday'
        THURSDAY = 4, 'Thursday'
        FRIDAY = 5, 'Friday'
        SATURDAY = 6, 'Saturday'

    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name='timetables')
    section = models.ForeignKey(
        Section, on_delete=models.CASCADE, related_name='timetables', null=True, blank=True,
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='timetables')
    teacher = models.ForeignKey(
        Teacher, on_delete=models.CASCADE, related_name='timetables', null=True, blank=True,
    )
    day_of_week = models.IntegerField(choices=DayOfWeek.choices)
    period_number = models.PositiveIntegerField(null=True, blank=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.ForeignKey('Room', on_delete=models.SET_NULL, null=True, blank=True, related_name='timetables')

    class Meta:
        ordering = ['day_of_week', 'period_number', 'start_time']
        constraints = [
            models.UniqueConstraint(
                fields=['section', 'day_of_week', 'period_number'],
                condition=Q(is_deleted=False) & Q(section__isnull=False),
                name='unique_section_day_period',
            ),
        ]

    def __str__(self):
        return f'{self.school_class} - {self.subject} ({self.get_day_of_week_display()})'


class AnnualSchedule(BaseModel):
    class EventType(models.TextChoices):
        TERM = 'TERM', 'Term / Semester'
        HOLIDAY = 'HOLIDAY', 'Holiday / Break'
        EXAM = 'EXAM', 'Exam Period'
        EVENT = 'EVENT', 'School Event'
        OTHER = 'OTHER', 'Other'

    academic_year = models.ForeignKey(
        AcademicYear, on_delete=models.CASCADE, related_name='annual_schedules',
    )
    title = models.CharField(max_length=200)
    event_type = models.CharField(max_length=20, choices=EventType.choices, default=EventType.EVENT)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    grade_level = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='Leave empty for whole-school events.',
    )
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['start_date', 'title']

    def __str__(self):
        return f'{self.title} ({self.academic_year})'


class AnnualScheduleAttachment(BaseModel):
    schedule = models.ForeignKey(
        AnnualSchedule, on_delete=models.CASCADE, related_name='attachments',
    )
    file = models.FileField(upload_to='annual-schedule/%Y/%m/')
    original_filename = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return self.original_filename or str(self.file)


class Room(BaseModel):
    name = models.CharField(max_length=50)
    building = models.CharField(max_length=50, blank=True)
    floor = models.CharField(max_length=10, blank=True)
    capacity = models.PositiveIntegerField(default=40)
    room_type = models.CharField(max_length=50, blank=True)
    is_available = models.BooleanField(default=True)

    class Meta:
        ordering = ['building', 'name']

    def __str__(self):
        return f'{self.building} - {self.name}' if self.building else self.name


class GradeAcademicItem(BaseModel):
    class ItemType(models.TextChoices):
        ASSIGNMENT = 'ASSIGNMENT', 'Assignment'
        MID_EXAM = 'MID_EXAM', 'Mid Exam'
        FINAL_EXAM = 'FINAL_EXAM', 'Final Exam'
        MATERIAL = 'MATERIAL', 'Material'

    item_type = models.CharField(max_length=20, choices=ItemType.choices)
    subject = models.ForeignKey(
        Subject,
        on_delete=models.PROTECT,
        related_name='grade_academic_items',
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=200)
    grade_level = models.PositiveIntegerField()
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.PROTECT,
        related_name='grade_academic_items',
        null=True,
        blank=True,
        help_text='Ethiopian calendar year when this item was first added (not used for materials).',
    )
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at', 'grade_level', 'title']
        indexes = [
            models.Index(fields=['item_type', 'grade_level']),
            models.Index(fields=['academic_year']),
            models.Index(fields=['subject', 'item_type']),
        ]

    def __str__(self):
        return f'{self.title} · Grade {self.grade_level}'


class GradeAcademicItemAttachment(BaseModel):
    item = models.ForeignKey(
        GradeAcademicItem, on_delete=models.CASCADE, related_name='attachments',
    )
    file = models.FileField(upload_to='academics/grade-items/%Y/%m/')
    original_filename = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return self.original_filename or str(self.file)


class GradeExamScheduleEntry(BaseModel):
    grade_level = models.PositiveIntegerField()
    subject = models.ForeignKey(
        Subject, on_delete=models.PROTECT, related_name='grade_exam_schedule_entries',
    )
    exam_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ['grade_level', 'exam_date', 'start_time']
        verbose_name = 'Grade exam schedule entry'
        verbose_name_plural = 'Grade exam schedule entries'

    def __str__(self):
        return f'Grade {self.grade_level} · {self.subject} · {self.exam_date}'


class GradeExamSchedulePlan(BaseModel):
    grade_level = models.PositiveIntegerField(unique=True)
    title = models.CharField(max_length=200, default='Exam Schedule')
    week_start_date = models.DateField(
        null=True,
        blank=True,
        help_text='Monday of the exam week (maps weekday rows to calendar dates).',
    )
    subjects_per_day = models.PositiveIntegerField(
        default=1,
        help_text='Legacy planning hint; exam rows are stored per weekday slot.',
    )

    class Meta:
        verbose_name = 'Grade exam schedule plan'
        verbose_name_plural = 'Grade exam schedule plans'

    def __str__(self):
        return f'Grade {self.grade_level} · {self.title}'
