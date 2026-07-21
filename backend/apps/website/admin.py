from django.contrib import admin

from apps.core.admin import BaseModelAdmin
from .models import (
    SchoolInfo, BlogPost, Event, GalleryItem, ContactSubmission,
    JobOpening, Download, FAQ, NewsletterSubscription,
)

for model in [
    SchoolInfo, BlogPost, Event, GalleryItem, ContactSubmission,
    JobOpening, Download, FAQ, NewsletterSubscription,
]:
    admin.site.register(model, BaseModelAdmin)
