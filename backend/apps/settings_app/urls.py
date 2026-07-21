from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    SchoolProfileViewSet, AcademicSettingsViewSet,
    GradingSettingsViewSet, EmailSettingsViewSet,
)

router = DefaultRouter()
router.register(r'school-profile', SchoolProfileViewSet, basename='school-profile')
router.register(r'academic', AcademicSettingsViewSet, basename='academic-settings')
router.register(r'grading', GradingSettingsViewSet, basename='grading-settings')
router.register(r'email', EmailSettingsViewSet, basename='email-settings')

urlpatterns = [
    path('', include(router.urls)),
]
