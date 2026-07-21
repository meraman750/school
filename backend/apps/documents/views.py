from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsStaffMember

from .models import Document
from .serializers import DocumentSerializer


class DocumentViewSet(BaseModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['document_type', 'owner_type', 'is_verified']
    search_fields = ['title', 'description']
    ordering_fields = ['issue_date', 'created_at']
