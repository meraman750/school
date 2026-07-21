from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import User


@receiver(post_save, sender=User)
def set_staff_flag(sender, instance, created, **kwargs):
    if created and instance.role == User.Role.SUPER_ADMIN:
        User.objects.filter(pk=instance.pk).update(is_staff=True, is_superuser=True)
