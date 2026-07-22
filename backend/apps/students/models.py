from django.conf import settings
from django.db import models

from apps.core.models import BaseModel


class Student(BaseModel):
    class Gender(models.TextChoices):
        MALE = 'M', 'Male'
        FEMALE = 'F', 'Female'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile',
        null=True,
        blank=True,
    )
    admission_number = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=1, choices=Gender.choices)
    date_of_birth = models.DateField()
    nationality = models.CharField(max_length=100, default='Ethiopian')
    religion = models.CharField(max_length=50, blank=True)
    blood_group = models.CharField(max_length=5, blank=True)
    photo = models.ImageField(upload_to='students/photos/', blank=True, null=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    region = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    grade_level = models.PositiveSmallIntegerField(null=True, blank=True)
    section = models.CharField(max_length=10, blank=True)
    enrollment_date = models.DateField()
    previous_school = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-enrollment_date', 'last_name', 'first_name']

    def __str__(self):
        return f'{self.admission_number} - {self.first_name} {self.last_name}'

    @property
    def full_name(self):
        parts = [self.first_name, self.middle_name, self.last_name]
        return ' '.join(p for p in parts if p)


class Guardian(BaseModel):
    class Relationship(models.TextChoices):
        FATHER = 'FATHER', 'Father'
        MOTHER = 'MOTHER', 'Mother'
        GUARDIAN = 'GUARDIAN', 'Guardian'
        OTHER = 'OTHER', 'Other'

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='guardians')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=20, choices=Relationship.choices)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ['-is_primary', 'last_name']

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.relationship})'


class MedicalInfo(BaseModel):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='medical_info')
    allergies = models.TextField(blank=True)
    chronic_conditions = models.TextField(blank=True)
    medications = models.TextField(blank=True)
    doctor_name = models.CharField(max_length=100, blank=True)
    doctor_phone = models.CharField(max_length=20, blank=True)
    insurance_provider = models.CharField(max_length=100, blank=True)
    insurance_number = models.CharField(max_length=50, blank=True)
    special_needs = models.TextField(blank=True)
    vaccination_records = models.TextField(blank=True)

    def __str__(self):
        return f'Medical Info - {self.student}'


class EmergencyContact(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='emergency_contacts')
    name = models.CharField(max_length=200)
    relationship = models.CharField(max_length=50)
    phone = models.CharField(max_length=20)
    phone_alt = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ['-is_primary', 'name']

    def __str__(self):
        return f'{self.name} - {self.student}'


class StudentDocument(BaseModel):
    class DocumentType(models.TextChoices):
        BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE', 'Birth Certificate'
        TRANSFER_LETTER = 'TRANSFER_LETTER', 'Transfer Letter'
        REPORT_CARD = 'REPORT_CARD', 'Report Card'
        ID_PHOTO = 'ID_PHOTO', 'ID Photo'
        MEDICAL = 'MEDICAL', 'Medical Document'
        OTHER = 'OTHER', 'Other'

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=30, choices=DocumentType.choices)
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='students/documents/')
    description = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f'{self.title} - {self.student}'


class Admission(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        ENROLLED = 'ENROLLED', 'Enrolled'

    student = models.OneToOneField(
        Student,
        on_delete=models.CASCADE,
        related_name='admission',
        null=True,
        blank=True,
    )
    application_number = models.CharField(max_length=50, unique=True)
    applicant_first_name = models.CharField(max_length=100)
    applicant_last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=Student.Gender.choices)
    grade_applied = models.CharField(max_length=50)
    guardian_name = models.CharField(max_length=200)
    guardian_phone = models.CharField(max_length=20)
    guardian_email = models.EmailField(blank=True)
    previous_school = models.CharField(max_length=255, blank=True)
    application_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    interview_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-application_date']

    def __str__(self):
        return f'{self.application_number} - {self.applicant_first_name} {self.applicant_last_name}'


class StudentGradeReport(BaseModel):
    class Quarter(models.IntegerChoices):
        Q1 = 1, 'Quarter 1'
        Q2 = 2, 'Quarter 2'
        Q3 = 3, 'Quarter 3'
        Q4 = 4, 'Quarter 4'

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grade_reports')
    academic_year = models.ForeignKey(
        'academics.AcademicYear',
        on_delete=models.CASCADE,
        related_name='student_grade_reports',
    )
    grade_level = models.PositiveSmallIntegerField()
    quarter = models.PositiveSmallIntegerField(choices=Quarter.choices)
    overall_average = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    teacher_remarks = models.TextField(blank=True)
    principal_remarks = models.TextField(blank=True)

    class Meta:
        ordering = ['-academic_year__start_date', '-quarter']
        unique_together = ['student', 'academic_year', 'grade_level', 'quarter']

    def __str__(self):
        return f'{self.student} - {self.academic_year} Q{self.quarter}'


class StudentGradeReportEntry(BaseModel):
    report = models.ForeignKey(StudentGradeReport, on_delete=models.CASCADE, related_name='entries')
    subject = models.ForeignKey(
        'academics.Subject',
        on_delete=models.CASCADE,
        related_name='grade_report_entries',
    )
    score = models.DecimalField(max_digits=5, decimal_places=2)
    grade_letter = models.CharField(max_length=5, blank=True)
    remarks = models.TextField(blank=True)

    class Meta:
        ordering = ['subject__name']
        unique_together = ['report', 'subject']

    def __str__(self):
        return f'{self.subject} - {self.score}'
