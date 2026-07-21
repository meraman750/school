from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AnnouncementViewSet, NotificationViewSet, EmailLogViewSet

router = DefaultRouter()
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'email-logs', EmailLogViewSet, basename='email-log')

urlpatterns = [
    path('', include(router.urls)),
]
