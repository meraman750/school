from rest_framework import permissions

from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsAdminOrReadOnly, IsStaffMember

from .models import (
    SchoolInfo, BlogPost, Event, GalleryItem, ContactSubmission,
    JobOpening, Download, FAQ, NewsletterSubscription,
)
from .serializers import (
    SchoolInfoSerializer, BlogPostSerializer, EventSerializer, GalleryItemSerializer,
    ContactSubmissionSerializer, JobOpeningSerializer, DownloadSerializer,
    FAQSerializer, NewsletterSubscriptionSerializer,
)


class PublicReadMixin:
    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [IsStaffMember()]


class SchoolInfoViewSet(PublicReadMixin, BaseModelViewSet):
    queryset = SchoolInfo.objects.all()
    serializer_class = SchoolInfoSerializer


class BlogPostViewSet(PublicReadMixin, BaseModelViewSet):
    queryset = BlogPost.objects.filter(is_published=True)
    serializer_class = BlogPostSerializer
    filterset_fields = ['tags']
    search_fields = ['title', 'content', 'tags']
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff_member:
            return BlogPost.objects.all()
        return BlogPost.objects.filter(is_published=True)


class EventViewSet(PublicReadMixin, BaseModelViewSet):
    queryset = Event.objects.filter(is_published=True)
    serializer_class = EventSerializer
    search_fields = ['title', 'description']

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff_member:
            return Event.objects.all()
        return Event.objects.filter(is_published=True)


class GalleryItemViewSet(PublicReadMixin, BaseModelViewSet):
    queryset = GalleryItem.objects.filter(is_published=True)
    serializer_class = GalleryItemSerializer
    filterset_fields = ['category']

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff_member:
            return GalleryItem.objects.all()
        return GalleryItem.objects.filter(is_published=True)


class ContactSubmissionViewSet(BaseModelViewSet):
    queryset = ContactSubmission.objects.all()
    serializer_class = ContactSubmissionSerializer
    filterset_fields = ['status']
    search_fields = ['name', 'email', 'subject']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsStaffMember()]


class JobOpeningViewSet(PublicReadMixin, BaseModelViewSet):
    queryset = JobOpening.objects.filter(is_published=True, status='OPEN')
    serializer_class = JobOpeningSerializer
    filterset_fields = ['department', 'employment_type']
    search_fields = ['title', 'description']

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff_member:
            return JobOpening.objects.all()
        return JobOpening.objects.filter(is_published=True, status='OPEN')


class DownloadViewSet(PublicReadMixin, BaseModelViewSet):
    queryset = Download.objects.filter(is_published=True)
    serializer_class = DownloadSerializer
    filterset_fields = ['category']
    search_fields = ['title']

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff_member:
            return Download.objects.all()
        return Download.objects.filter(is_published=True)


class FAQViewSet(PublicReadMixin, BaseModelViewSet):
    queryset = FAQ.objects.filter(is_published=True)
    serializer_class = FAQSerializer
    filterset_fields = ['category']

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff_member:
            return FAQ.objects.all()
        return FAQ.objects.filter(is_published=True)


class NewsletterSubscriptionViewSet(BaseModelViewSet):
    queryset = NewsletterSubscription.objects.all()
    serializer_class = NewsletterSubscriptionSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsStaffMember()]
