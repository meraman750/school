from django.db import models
from django.conf import settings


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_created',
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_updated',
    )
    is_deleted = models.BooleanField(default=False)

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def soft_delete(self):
        self.is_deleted = True
        self.save(update_fields=['is_deleted', 'updated_at'])

    def restore(self):
        self.is_deleted = False
        self.save(update_fields=['is_deleted', 'updated_at'])


class DashboardActivity(models.Model):
    """Audit trail of dashboard actions by finance, teachers, and portal users."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dashboard_activities',
    )
    actor_name = models.CharField(max_length=255)
    actor_role = models.CharField(max_length=32)
    actor_email = models.EmailField(blank=True)
    module = models.CharField(max_length=64)
    action = models.CharField(max_length=32)
    summary = models.CharField(max_length=512)
    detail = models.TextField(blank=True)
    http_method = models.CharField(max_length=16, blank=True)
    path = models.CharField(max_length=512, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['actor_role', '-created_at']),
        ]

    def __str__(self):
        return f'{self.actor_name}: {self.summary}'
