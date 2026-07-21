from django.contrib import admin

from apps.core.admin import BaseModelAdmin
from .models import Document

admin.site.register(Document, BaseModelAdmin)
