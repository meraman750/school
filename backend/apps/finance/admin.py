from django.contrib import admin

from apps.core.admin import BaseModelAdmin
from .models import FeeStructure, Invoice, Payment, Receipt, Scholarship, Discount

for model in [FeeStructure, Invoice, Payment, Receipt, Scholarship, Discount]:
    admin.site.register(model, BaseModelAdmin)
