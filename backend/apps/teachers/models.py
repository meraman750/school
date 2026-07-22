from django.conf import settings
from django.db import models

from apps.core.models import BaseModel


class Teacher(BaseModel):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        ON_LEAVE = 'ON_LEAVE', 'On Leave'
        INACTIVE = 'INACTIVE', 'Inactive'
        TERMINATED = 'TERMINATED', 'Terminated'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='teacher_profile',
        null=True,
        blank=True,
    )
    employee_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=1, choices=[('M', 'Male'), ('F', 'Female')])
    date_of_birth = models.DateField()
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    photo = models.ImageField(upload_to='teachers/photos/', blank=True, null=True)
    hire_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    specialization = models.CharField(max_length=100, blank=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=200, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)

    class Meta:
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f'{self.employee_id} - {self.first_name} {self.last_name}'


class TeacherQualification(BaseModel):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='qualifications')
    degree = models.CharField(max_length=100)
    institution = models.CharField(max_length=200)
    field_of_study = models.CharField(max_length=100)
    graduation_year = models.PositiveIntegerField()
    certificate = models.FileField(upload_to='teachers/certificates/', blank=True, null=True)

    class Meta:
        ordering = ['-graduation_year']

    def __str__(self):
        return f'{self.degree} - {self.teacher}'


class TeacherLeave(BaseModel):
    class LeaveType(models.TextChoices):
        ANNUAL = 'ANNUAL', 'Annual Leave'
        SICK = 'SICK', 'Sick Leave'
        MATERNITY = 'MATERNITY', 'Maternity Leave'
        EMERGENCY = 'EMERGENCY', 'Emergency Leave'
        UNPAID = 'UNPAID', 'Unpaid Leave'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='leaves')
    leave_type = models.CharField(max_length=20, choices=LeaveType.choices)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_teacher_leaves',
    )

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f'{self.teacher} - {self.leave_type} ({self.start_date})'


class TeacherPerformance(BaseModel):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='performance_reviews')
    review_period = models.CharField(max_length=50)
    review_date = models.DateField()
    rating = models.DecimalField(max_digits=3, decimal_places=1)
    strengths = models.TextField(blank=True)
    areas_for_improvement = models.TextField(blank=True)
    goals = models.TextField(blank=True)
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='teacher_reviews_conducted',
    )
    comments = models.TextField(blank=True)

    class Meta:
        ordering = ['-review_date']

    def __str__(self):
        return f'{self.teacher} - {self.review_period}'
