from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsStaffMember

from .models import Route, Driver, Vehicle, StudentTransportAssignment
from .serializers import RouteSerializer, DriverSerializer, VehicleSerializer, StudentTransportAssignmentSerializer


class RouteViewSet(BaseModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['is_active']
    search_fields = ['name', 'code', 'start_point', 'end_point']


class DriverViewSet(BaseModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['status']
    search_fields = ['first_name', 'last_name', 'license_number', 'phone']


class VehicleViewSet(BaseModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['status', 'route', 'driver']
    search_fields = ['registration_number', 'make', 'model']


class StudentTransportAssignmentViewSet(BaseModelViewSet):
    queryset = StudentTransportAssignment.objects.all()
    serializer_class = StudentTransportAssignmentSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['student', 'route', 'vehicle', 'status']
    ordering_fields = ['start_date']
