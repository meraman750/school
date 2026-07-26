from django.urls import path

from .views import DashboardStatsView, PortalContextView, DashboardActivityListView, DashboardActivityDetailView

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/activities/', DashboardActivityListView.as_view(), name='dashboard-activities'),
    path('dashboard/activities/<int:activity_id>/', DashboardActivityDetailView.as_view(), name='dashboard-activity-detail'),
    path('portal/context/', PortalContextView.as_view(), name='portal-context'),
]