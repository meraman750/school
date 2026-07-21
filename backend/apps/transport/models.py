from django.db import models

from apps.core.models import BaseModel
from apps.students.models import Student


class Route(BaseModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    start_point = models.CharField(max_length=200)
    end_point = models.CharField(max_length=200)
    stops = models.TextField(blank=True, help_text='Comma-separated list of stops')
    distance_km = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    estimated_duration = models.DurationField(null=True, blank=True)
    fare = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.code} - {self.name}'


class Driver(BaseModel):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        ON_LEAVE = 'ON_LEAVE', 'On Leave'
        INACTIVE = 'INACTIVE', 'Inactive'

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    license_number = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    hire_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    photo = models.ImageField(upload_to='transport/drivers/', blank=True, null=True)

    class Meta:
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f'{self.first_name} {self.last_name}'


class Vehicle(BaseModel):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        MAINTENANCE = 'MAINTENANCE', 'Under Maintenance'
        INACTIVE = 'INACTIVE', 'Inactive'

    registration_number = models.CharField(max_length=20, unique=True)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.PositiveIntegerField()
    capacity = models.PositiveIntegerField()
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehicles')
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehicles')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    last_service_date = models.DateField(null=True, blank=True)
    insurance_expiry = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['registration_number']

    def __str__(self):
        return f'{self.registration_number} ({self.make} {self.model})'


class StudentTransportAssignment(BaseModel):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        CANCELLED = 'CANCELLED', 'Cancelled'

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='transport_assignments')
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='student_assignments')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='student_assignments')
    pickup_point = models.CharField(max_length=200)
    dropoff_point = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    monthly_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f'{self.student} - {self.route}'
