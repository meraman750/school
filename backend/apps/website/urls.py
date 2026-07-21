from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    SchoolInfoViewSet, BlogPostViewSet, EventViewSet, GalleryItemViewSet,
    ContactSubmissionViewSet, JobOpeningViewSet, DownloadViewSet,
    FAQViewSet, NewsletterSubscriptionViewSet,
)

router = DefaultRouter()
router.register(r'school-info', SchoolInfoViewSet, basename='school-info')
router.register(r'blog', BlogPostViewSet, basename='blog-post')
router.register(r'events', EventViewSet, basename='event')
router.register(r'gallery', GalleryItemViewSet, basename='gallery-item')
router.register(r'contact', ContactSubmissionViewSet, basename='contact-submission')
router.register(r'jobs', JobOpeningViewSet, basename='job-opening')
router.register(r'downloads', DownloadViewSet, basename='download')
router.register(r'faqs', FAQViewSet, basename='faq')
router.register(r'newsletter', NewsletterSubscriptionViewSet, basename='newsletter')

urlpatterns = [
    path('', include(router.urls)),
]
