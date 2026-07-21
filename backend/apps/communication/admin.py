from django.contrib import admin

from apps.core.admin import BaseModelAdmin
from .models import Announcement, Notification, EmailLog

for model in [Announcement, Notification, EmailLog]:
    admin.site.register(model, BaseModelAdmin)
