from django.conf import settings
from django.db import models

from apps.core.models import BaseModel


class AssetCategory(BaseModel):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Asset categories'

    def __str__(self):
        return self.name


class Asset(BaseModel):
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        IN_USE = 'IN_USE', 'In Use'
        MAINTENANCE = 'MAINTENANCE', 'Under Maintenance'
        DISPOSED = 'DISPOSED', 'Disposed'

    name = models.CharField(max_length=200)
    asset_tag = models.CharField(max_length=50, unique=True)
    category = models.ForeignKey(AssetCategory, on_delete=models.SET_NULL, null=True, related_name='assets')
    description = models.TextField(blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    purchase_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    location = models.CharField(max_length=100, blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_assets',
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    warranty_expiry = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.asset_tag} - {self.name}'


class Supply(BaseModel):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=20, default='piece')
    quantity_in_stock = models.PositiveIntegerField(default=0)
    minimum_stock = models.PositiveIntegerField(default=10)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    supplier = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['name']

    @property
    def is_low_stock(self):
        return self.quantity_in_stock <= self.minimum_stock

    def __str__(self):
        return f'{self.sku} - {self.name}'


class StockTransaction(BaseModel):
    class Type(models.TextChoices):
        IN = 'IN', 'Stock In'
        OUT = 'OUT', 'Stock Out'
        ADJUSTMENT = 'ADJUSTMENT', 'Adjustment'

    supply = models.ForeignKey(Supply, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=Type.choices)
    quantity = models.PositiveIntegerField()
    reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='stock_transactions',
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.transaction_type} {self.quantity} x {self.supply}'
