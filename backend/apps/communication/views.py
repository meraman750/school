from django.utils import timezone
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsStaffMember

from .models import Announcement, Notification, EmailLog
from .serializers import AnnouncementSerializer, NotificationSerializer, EmailLogSerializer


class AnnouncementViewSet(BaseModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['audience', 'priority', 'is_published']
    search_fields = ['title', 'content']
    ordering_fields = ['publish_date']


class NotificationViewSet(BaseModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['is_read', 'notification_type']
    search_fields = ['title', 'message']

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(
            is_read=True, read_at=timezone.now(),
        )
        return Response({'success': True, 'message': 'All notifications marked as read.'})


class EmailLogViewSet(BaseModelViewSet):
    queryset = EmailLog.objects.all()
    serializer_class = EmailLogSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['status', 'recipient']
    search_fields = ['subject', 'recipient']
    ordering_fields = ['created_at', 'sent_at']
