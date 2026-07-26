from django.urls import path

from .views import DashboardStatsView, PortalContextView, DashboardActivityListView

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/activities/', DashboardActivityListView.as_view(), name='dashboard-activities'),
    path('portal/context/', PortalContextView.as_view(), name='portal-context'),
]