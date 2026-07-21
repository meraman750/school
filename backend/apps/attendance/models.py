from django.conf import settings
from django.db import models

from apps.core.models import BaseModel
from apps.students.models import Student
from apps.teachers.models import Teacher
from apps.academics.models import SchoolClass


class AttendanceStatus(models.TextChoices):
    PRESENT = 'PRESENT', 'Present'
    ABSENT = 'ABSENT', 'Absent'
    LATE = 'LATE', 'Late'
    EXCUSED = 'EXCUSED', 'Excused'


class StudentAttendance(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name='student_attendance')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=AttendanceStatus.choices, default=AttendanceStatus.PRESENT)
    check_in_time = models.TimeField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='student_attendance_marked',
    )

    class Meta:
        ordering = ['-date']
        unique_together = ['student', 'date']

    def __str__(self):
        return f'{self.student} - {self.date} ({self.status})'


class TeacherAttendance(BaseModel):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=AttendanceStatus.choices, default=AttendanceStatus.PRESENT)
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    remarks = models.TextField(blank=True)

    class Meta:
        ordering = ['-date']
        unique_together = ['teacher', 'date']

    def __str__(self):
        return f'{self.teacher} - {self.date} ({self.status})'
