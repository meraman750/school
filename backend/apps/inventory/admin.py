from django.contrib import admin

from apps.core.admin import BaseModelAdmin
from .models import AssetCategory, Asset, Supply, StockTransaction

for model in [AssetCategory, Asset, Supply, StockTransaction]:
    admin.site.register(model, BaseModelAdmin)
