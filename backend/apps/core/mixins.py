from rest_framework import viewsets


class SoftDeleteViewSetMixin:
    def perform_destroy(self, instance):
        instance.soft_delete()

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('include_deleted') == 'true':
            if hasattr(queryset.model, 'all_objects'):
                return queryset.model.all_objects.all()
        return queryset


class AuditViewSetMixin:
    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
        )

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class BaseModelViewSet(SoftDeleteViewSetMixin, AuditViewSetMixin, viewsets.ModelViewSet):
    pass
