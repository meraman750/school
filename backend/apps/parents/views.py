from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsStaffMember

from .models import ParentProfile
from .serializers import ParentProfileSerializer


class ParentProfileViewSet(BaseModelViewSet):
    queryset = ParentProfile.objects.all()
    serializer_class = ParentProfileSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['relationship', 'is_primary_contact']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'occupation']
    ordering_fields = ['created_at']
