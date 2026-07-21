from django.conf import settings
from django.db import models

from apps.core.models import BaseModel


class Announcement(BaseModel):
    class Audience(models.TextChoices):
        ALL = 'ALL', 'All'
        STUDENTS = 'STUDENTS', 'Students'
        TEACHERS = 'TEACHERS', 'Teachers'
        PARENTS = 'PARENTS', 'Parents'
        STAFF = 'STAFF', 'Staff'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        NORMAL = 'NORMAL', 'Normal'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'

    title = models.CharField(max_length=200)
    content = models.TextField()
    audience = models.CharField(max_length=20, choices=Audience.choices, default=Audience.ALL)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.NORMAL)
    publish_date = models.DateTimeField()
    expiry_date = models.DateTimeField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    attachment = models.FileField(upload_to='announcements/', blank=True, null=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='announcements',
    )

    class Meta:
        ordering = ['-publish_date']

    def __str__(self):
        return self.title


class Notification(BaseModel):
    class Type(models.TextChoices):
        INFO = 'INFO', 'Info'
        WARNING = 'WARNING', 'Warning'
        SUCCESS = 'SUCCESS', 'Success'
        ERROR = 'ERROR', 'Error'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications',
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=10, choices=Type.choices, default=Type.INFO)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    link = models.URLField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} -> {self.recipient}'


class EmailLog(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SENT = 'SENT', 'Sent'
        FAILED = 'FAILED', 'Failed'

    recipient = models.EmailField()
    subject = models.CharField(max_length=200)
    body = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='emails_sent',
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.subject} -> {self.recipient}'
