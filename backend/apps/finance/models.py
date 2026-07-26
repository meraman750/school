from django.conf import settings
from django.db import models

from apps.core.models import BaseModel
from apps.students.models import Student
from apps.academics.models import AcademicYear, SchoolClass


class FeeStructure(BaseModel):
    name = models.CharField(max_length=100)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='fee_structures')
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name='fee_structures')
    tuition_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    transport_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    library_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-academic_year__start_date', 'school_class']

    @property
    def total_amount(self):
        return (
            self.tuition_fee + self.registration_fee + self.transport_fee
            + self.library_fee + self.other_fees
        )

    def __str__(self):
        return f'{self.name} - {self.school_class}'


class Invoice(BaseModel):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PENDING = 'PENDING', 'Pending'
        PARTIAL = 'PARTIAL', 'Partially Paid'
        PAID = 'PAID', 'Paid'
        OVERDUE = 'OVERDUE', 'Overdue'
        CANCELLED = 'CANCELLED', 'Cancelled'

    invoice_number = models.CharField(max_length=50, unique=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='invoices')
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.SET_NULL, null=True, related_name='invoices')
    issue_date = models.DateField()
    due_date = models.DateField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-issue_date']

    @property
    def balance(self):
        return self.total_amount - self.amount_paid

    def __str__(self):
        return f'{self.invoice_number} - {self.student}'


class Payment(BaseModel):
    class Method(models.TextChoices):
        CASH = 'CASH', 'Cash'
        BANK_TRANSFER = 'BANK_TRANSFER', 'Bank Transfer'
        MOBILE_MONEY = 'MOBILE_MONEY', 'Mobile Money'
        CHEQUE = 'CHEQUE', 'Cheque'
        CARD = 'CARD', 'Card'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'
        REFUNDED = 'REFUNDED', 'Refunded'

    payment_reference = models.CharField(max_length=50, unique=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=Method.choices)
    payment_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.COMPLETED)
    transaction_id = models.CharField(max_length=100, blank=True)
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='payments_received',
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-payment_date']

    def __str__(self):
        return f'{self.payment_reference} - {self.amount}'


class Receipt(BaseModel):
    receipt_number = models.CharField(max_length=50, unique=True)
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='receipt')
    issued_date = models.DateField(auto_now_add=True)
    issued_to = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-issued_date']

    def __str__(self):
        return self.receipt_number


class Scholarship(BaseModel):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        EXPIRED = 'EXPIRED', 'Expired'
        REVOKED = 'REVOKED', 'Revoked'

    name = models.CharField(max_length=100)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='scholarships')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    criteria = models.TextField(blank=True)
    sponsor = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f'{self.name} - {self.student}'


class Discount(BaseModel):
    class Type(models.TextChoices):
        PERCENTAGE = 'PERCENTAGE', 'Percentage'
        FIXED = 'FIXED', 'Fixed Amount'

    name = models.CharField(max_length=100)
    discount_type = models.CharField(max_length=20, choices=Type.choices)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='discounts', null=True, blank=True,
    )
    fee_structure = models.ForeignKey(
        FeeStructure, on_delete=models.CASCADE, related_name='discounts', null=True, blank=True,
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return self.name


class StudentMonthlyFeeStatus(BaseModel):
    """Finance manual confirmation of student fee payment per calendar month."""

    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='monthly_fee_statuses',
    )
    year = models.PositiveIntegerField()
    month = models.PositiveSmallIntegerField()
    is_paid = models.BooleanField(default=False)

    class Meta:
        ordering = ['year', 'month']
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'year', 'month'],
                name='uniq_student_fee_status_month',
            ),
        ]

    def __str__(self):
        return f'{self.student_id} {self.year}-{self.month:02d} paid={self.is_paid}'


class TeacherMonthlyPayrollStatus(BaseModel):
    """Finance manual confirmation of teacher salary payment per calendar month."""

    teacher = models.ForeignKey(
        'teachers.Teacher', on_delete=models.CASCADE, related_name='monthly_payroll_statuses',
    )
    year = models.PositiveIntegerField()
    month = models.PositiveSmallIntegerField()
    is_paid = models.BooleanField(default=False)

    class Meta:
        ordering = ['year', 'month']
        constraints = [
            models.UniqueConstraint(
                fields=['teacher', 'year', 'month'],
                name='uniq_teacher_payroll_status_month',
            ),
        ]

    def __str__(self):
        return f'{self.teacher_id} {self.year}-{self.month:02d} paid={self.is_paid}'
