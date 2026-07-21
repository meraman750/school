from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AssetCategoryViewSet, AssetViewSet, SupplyViewSet, StockTransactionViewSet

router = DefaultRouter()
router.register(r'asset-categories', AssetCategoryViewSet, basename='asset-category')
router.register(r'assets', AssetViewSet, basename='asset')
router.register(r'supplies', SupplyViewSet, basename='supply')
router.register(r'transactions', StockTransactionViewSet, basename='stock-transaction')

urlpatterns = [
    path('', include(router.urls)),
]
