from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import RouteViewSet, DriverViewSet, VehicleViewSet, StudentTransportAssignmentViewSet

router = DefaultRouter()
router.register(r'routes', RouteViewSet, basename='route')
router.register(r'drivers', DriverViewSet, basename='driver')
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'assignments', StudentTransportAssignmentViewSet, basename='transport-assignment')

urlpatterns = [
    path('', include(router.urls)),
]
