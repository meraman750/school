from django.db import models

from apps.core.models import BaseModel


class SchoolProfile(BaseModel):
    school_name = models.CharField(max_length=200, default='Biruk Academy Primary School')
    school_code = models.CharField(max_length=20, unique=True, default='BAPS')
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='settings/', blank=True, null=True)
    motto = models.CharField(max_length=255, blank=True)
    principal_name = models.CharField(max_length=100, blank=True)
    established_year = models.PositiveIntegerField(null=True, blank=True)
    timezone = models.CharField(max_length=50, default='Africa/Addis_Ababa')
    currency = models.CharField(max_length=10, default='ETB')

    class Meta:
        verbose_name = 'School Profile'
        verbose_name_plural = 'School Profiles'

    def __str__(self):
        return self.school_name


class AcademicSettings(BaseModel):
    current_academic_year = models.CharField(max_length=50, blank=True)
    current_term = models.CharField(max_length=50, blank=True)
    grading_system = models.CharField(max_length=50, default='LETTER')
    passing_grade = models.DecimalField(max_digits=5, decimal_places=2, default=40)
    max_absences_allowed = models.PositiveIntegerField(default=25)
    school_start_time = models.TimeField(null=True, blank=True)
    school_end_time = models.TimeField(null=True, blank=True)
    class_duration_minutes = models.PositiveIntegerField(default=45)

    class Meta:
        verbose_name = 'Academic Settings'
        verbose_name_plural = 'Academic Settings'

    def __str__(self):
        return f'Academic Settings - {self.current_academic_year}'


class GradingSettings(BaseModel):
    grade_letter = models.CharField(max_length=5)
    min_score = models.DecimalField(max_digits=5, decimal_places=2)
    max_score = models.DecimalField(max_digits=5, decimal_places=2)
    grade_point = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    description = models.CharField(max_length=100, blank=True)
    is_passing = models.BooleanField(default=True)

    class Meta:
        ordering = ['-min_score']
        verbose_name = 'Grading Setting'
        verbose_name_plural = 'Grading Settings'

    def __str__(self):
        return f'{self.grade_letter} ({self.min_score}-{self.max_score})'


class EmailSettings(BaseModel):
    smtp_host = models.CharField(max_length=100, default='smtp.gmail.com')
    smtp_port = models.PositiveIntegerField(default=587)
    smtp_user = models.EmailField(blank=True)
    smtp_password = models.CharField(max_length=255, blank=True)
    use_tls = models.BooleanField(default=True)
    default_from_email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Email Settings'
        verbose_name_plural = 'Email Settings'

    def __str__(self):
        return f'Email Settings ({self.smtp_host})'
