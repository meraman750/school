from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('apps.core.urls')),
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/students/', include('apps.students.urls')),
    path('api/v1/teachers/', include('apps.teachers.urls')),
    path('api/v1/academics/', include('apps.academics.urls')),
    path('api/v1/library/', include('apps.library.urls')),
    path('api/v1/website/', include('apps.website.urls')),
    path('api/v1/transport/', include('apps.transport.urls')),
    path('api/v1/documents/', include('apps.documents.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
    path('api/v1/settings/', include('apps.settings_app.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
