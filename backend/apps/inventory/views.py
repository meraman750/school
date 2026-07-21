from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsStaffMember

from .models import AssetCategory, Asset, Supply, StockTransaction
from .serializers import AssetCategorySerializer, AssetSerializer, SupplySerializer, StockTransactionSerializer


class AssetCategoryViewSet(BaseModelViewSet):
    queryset = AssetCategory.objects.all()
    serializer_class = AssetCategorySerializer
    permission_classes = [IsStaffMember]
    search_fields = ['name']


class AssetViewSet(BaseModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['category', 'status', 'assigned_to']
    search_fields = ['name', 'asset_tag', 'location']


class SupplyViewSet(BaseModelViewSet):
    queryset = Supply.objects.all()
    serializer_class = SupplySerializer
    permission_classes = [IsStaffMember]
    search_fields = ['name', 'sku', 'supplier']


class StockTransactionViewSet(BaseModelViewSet):
    queryset = StockTransaction.objects.all()
    serializer_class = StockTransactionSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['supply', 'transaction_type']
    ordering_fields = ['created_at']
