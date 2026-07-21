from django.conf import settings
from django.db import models

from apps.core.models import BaseModel
from apps.students.models import Student


class ParentProfile(BaseModel):
    class Relationship(models.TextChoices):
        FATHER = 'FATHER', 'Father'
        MOTHER = 'MOTHER', 'Mother'
        GUARDIAN = 'GUARDIAN', 'Guardian'
        OTHER = 'OTHER', 'Other'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='parent_profile',
    )
    students = models.ManyToManyField(Student, related_name='parents', blank=True)
    relationship = models.CharField(max_length=20, choices=Relationship.choices, default=Relationship.GUARDIAN)
    occupation = models.CharField(max_length=100, blank=True)
    workplace = models.CharField(max_length=200, blank=True)
    address = models.TextField(blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    is_primary_contact = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.get_full_name()} ({self.relationship})'
