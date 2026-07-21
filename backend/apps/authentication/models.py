from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'
        PRINCIPAL = 'PRINCIPAL', 'Principal'
        VICE_PRINCIPAL = 'VICE_PRINCIPAL', 'Vice Principal'
        REGISTRAR = 'REGISTRAR', 'Registrar'
        FINANCE = 'FINANCE', 'Finance'
        TEACHER = 'TEACHER', 'Teacher'
        STUDENT = 'STUDENT', 'Student'
        PARENT = 'PARENT', 'Parent'
        RECEPTIONIST = 'RECEPTIONIST', 'Receptionist'
        LIBRARIAN = 'LIBRARIAN', 'Librarian'
        ACCOUNTANT = 'ACCOUNTANT', 'Accountant'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
    )
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    must_change_password = models.BooleanField(default=False)

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return f'{self.get_full_name() or self.username} ({self.role})'

    @property
    def is_staff_member(self):
        return self.role in (
            self.Role.SUPER_ADMIN, self.Role.PRINCIPAL, self.Role.VICE_PRINCIPAL,
            self.Role.REGISTRAR, self.Role.FINANCE, self.Role.TEACHER,
            self.Role.RECEPTIONIST, self.Role.LIBRARIAN, self.Role.ACCOUNTANT,
        )

    @property
    def is_admin(self):
        return self.role in (self.Role.SUPER_ADMIN, self.Role.PRINCIPAL, self.Role.VICE_PRINCIPAL)
