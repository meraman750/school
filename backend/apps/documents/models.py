from django.conf import settings
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from apps.core.models import BaseModel


class Document(BaseModel):
    class DocumentType(models.TextChoices):
        CERTIFICATE = 'CERTIFICATE', 'Certificate'
        TRANSCRIPT = 'TRANSCRIPT', 'Transcript'
        ID = 'ID', 'Identification'
        CONTRACT = 'CONTRACT', 'Contract'
        REPORT = 'REPORT', 'Report'
        OTHER = 'OTHER', 'Other'

    class OwnerType(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        TEACHER = 'TEACHER', 'Teacher'
        EMPLOYEE = 'EMPLOYEE', 'Employee'
        SCHOOL = 'SCHOOL', 'School'

    title = models.CharField(max_length=200)
    document_type = models.CharField(max_length=20, choices=DocumentType.choices)
    owner_type = models.CharField(max_length=20, choices=OwnerType.choices)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    owner = GenericForeignKey('content_type', 'object_id')
    file = models.FileField(upload_to='documents/')
    description = models.TextField(blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='verified_documents',
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} ({self.document_type})'
