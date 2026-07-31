from rest_framework import permissions
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsSchoolAdmin, IsStaffMember

from .models import (
    SchoolInfo, BlogPost, Event, GalleryItem, ContactSubmission,
    JobOpening, Download, FAQ, NewsletterSubscription,
)
from .serializers import (
    SchoolInfoSerializer, BlogPostSerializer, EventSerializer, GalleryItemSerializer,
    ContactSubmissionSerializer, JobOpeningSerializer, DownloadSerializer,
    FAQSerializer, NewsletterSubscriptionSerializer,
)


def _is_school_admin(user):
    return user.is_authenticated and user.role in IsSchoolAdmin.ADMIN_ROLES


class PublicReadMixin:
    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [IsStaffMember()]


class PublicReadAdminWriteMixin:
    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [IsSchoolAdmin()]


class SchoolInfoViewSet(PublicReadMixin, BaseModelViewSet):
    queryset = SchoolInfo.objects.all()
    serializer_class = SchoolInfoSerializer


class BlogPostViewSet(PublicReadAdminWriteMixin, BaseModelViewSet):
    queryset = BlogPost.objects.filter(is_published=True)
    serializer_class = BlogPostSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['tags', 'category', 'is_published']
    search_fields = ['title', 'content', 'tags']
    lookup_field = 'slug'

    def get_queryset(self):
        if _is_school_admin(self.request.user):
            return BlogPost.objects.all()
        return BlogPost.objects.filter(is_published=True)


class EventViewSet(PublicReadAdminWriteMixin, BaseModelViewSet):
    queryset = Event.objects.filter(is_published=True)
    serializer_class = EventSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['is_published']
    search_fields = ['title', 'description']

    def get_queryset(self):
        if _is_school_admin(self.request.user):
            return Event.objects.all()
        return Event.objects.filter(is_published=True)


class GalleryItemViewSet(PublicReadAdminWriteMixin, BaseModelViewSet):
    queryset = GalleryItem.objects.filter(is_published=True)
    serializer_class = GalleryItemSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['category', 'is_published']

    def get_queryset(self):
        if _is_school_admin(self.request.user):
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
