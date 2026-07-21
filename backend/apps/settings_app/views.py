from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsPrincipal, IsSuperAdmin

from .models import SchoolProfile, AcademicSettings, GradingSettings, EmailSettings
from .serializers import (
    SchoolProfileSerializer, AcademicSettingsSerializer,
    GradingSettingsSerializer, EmailSettingsSerializer,
)


class SchoolProfileViewSet(BaseModelViewSet):
    queryset = SchoolProfile.objects.all()
    serializer_class = SchoolProfileSerializer
    permission_classes = [IsPrincipal]


class AcademicSettingsViewSet(BaseModelViewSet):
    queryset = AcademicSettings.objects.all()
    serializer_class = AcademicSettingsSerializer
    permission_classes = [IsPrincipal]


class GradingSettingsViewSet(BaseModelViewSet):
    queryset = GradingSettings.objects.all()
    serializer_class = GradingSettingsSerializer
    permission_classes = [IsPrincipal]
    filterset_fields = ['is_passing']
    ordering_fields = ['min_score']


class EmailSettingsViewSet(BaseModelViewSet):
    queryset = EmailSettings.objects.all()
    serializer_class = EmailSettingsSerializer
    permission_classes = [IsSuperAdmin]
