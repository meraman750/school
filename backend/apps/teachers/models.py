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


class TeacherSalaryInfo(BaseModel):
    class PaymentMethod(models.TextChoices):
        BANK = 'BANK', 'Bank Transfer'
        CASH = 'CASH', 'Cash'
        MOBILE = 'MOBILE', 'Mobile Money'

    teacher = models.OneToOneField(Teacher, on_delete=models.CASCADE, related_name='salary_info')
    base_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    housing_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transport_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    pension_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account = models.CharField(max_length=50, blank=True)
    payment_method = models.CharField(
        max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.BANK,
    )
    effective_from = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    @property
    def gross_salary(self):
        return (
            self.base_salary + self.housing_allowance
            + self.transport_allowance + self.other_allowances
        )

    @property
    def total_deductions(self):
        return self.tax_deduction + self.pension_deduction + self.other_deductions

    @property
    def net_monthly_salary(self):
        return self.gross_salary - self.total_deductions

    def __str__(self):
        return f'Salary Info - {self.teacher}'


class TeacherSalaryPayment(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PAID = 'PAID', 'Paid'

    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='salary_payments')
    pay_period_start = models.DateField()
    pay_period_end = models.DateField()
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2)
    housing_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transport_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    pension_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_date = models.DateField(null=True, blank=True)
    approved_by_name = models.CharField(max_length=200, blank=True)
    beneficiary_name = models.CharField(max_length=200, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    ticket_receipt = models.ImageField(upload_to='finance/payroll-receipts/', blank=True, null=True)
    recorded_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-pay_period_start']

    @property
    def gross_salary(self):
        return (
            self.basic_salary + self.housing_allowance
            + self.transport_allowance + self.other_allowances
        )

    @property
    def total_deductions(self):
        return self.tax_deduction + self.pension_deduction + self.other_deductions

    def __str__(self):
        return f'{self.teacher} - {self.pay_period_start}'
