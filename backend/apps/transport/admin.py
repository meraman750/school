from django.contrib import admin

from apps.core.admin import BaseModelAdmin
from .models import Route, Driver, Vehicle, StudentTransportAssignment

for model in [Route, Driver, Vehicle, StudentTransportAssignment]:
    admin.site.register(model, BaseModelAdmin)
