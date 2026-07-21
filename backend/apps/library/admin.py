from django.contrib import admin

from apps.core.admin import BaseModelAdmin
from .models import BookCategory, Book, BorrowRecord, LibraryFine

for model in [BookCategory, Book, BorrowRecord, LibraryFine]:
    admin.site.register(model, BaseModelAdmin)
