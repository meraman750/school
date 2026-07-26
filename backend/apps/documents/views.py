from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsStaffMember

from .models import Document
from .serializers import DocumentSerializer, resolve_document_type
    queryset = Document.objects.filter(is_deleted=False)
    serializer_class = DocumentSerializer
    permission_classes = [IsStaffMember]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['document_type', 'owner_type', 'is_verified']
    search_fields = ['title', 'description']
    ordering_fields = ['issue_date', 'created_at']

    def create(self, request, *args, **kwargs):
        files = request.FILES.getlist('files')
        if not files and request.FILES.get('file'):
            files = [request.FILES.get('file')]
        if not files:
            return Response({'detail': 'Upload at least one file.'}, status=400)

        title = (request.data.get('title') or '').strip()
        if not title:
            return Response({'detail': 'Document title is required.'}, status=400)

        document_type = resolve_document_type(
            request.data.get('category') or request.data.get('document_type'),
        )
        description = (request.data.get('description') or '').strip()
        owner_type = request.data.get('owner_type') or Document.OwnerType.SCHOOL
        if owner_type not in Document.OwnerType.values:
            owner_type = Document.OwnerType.SCHOOL

        user = request.user
        created = []
        for upload in files:
            doc_title = title if len(files) == 1 else f'{title} — {upload.name}'
            doc = Document.objects.create(
                title=doc_title,
                document_type=document_type,
                owner_type=owner_type,
                file=upload,
                description=description,
                created_by=user,
                updated_by=user,
            )
            created.append(doc)

        serializer = DocumentSerializer(created, many=True, context={'request': request})
        return Response(serializer.data, status=201)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        patch = {}
        if request.data.get('title') is not None:
            patch['title'] = request.data.get('title')
        if request.data.get('description') is not None:
            patch['description'] = request.data.get('description')
        if request.data.get('category') is not None:
            patch['document_type'] = resolve_document_type(request.data.get('category'))

        if patch:
            serializer = self.get_serializer(instance, data=patch, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save(updated_by=request.user)
            instance.refresh_from_db()

        extra_files = request.FILES.getlist('files')
        if extra_files:
            user = request.user
            extras = []
            for upload in extra_files:
                doc = Document.objects.create(
                    title=f'{instance.title} — {upload.name}',
                    document_type=instance.document_type,
                    owner_type=instance.owner_type,
                    file=upload,
                    description=instance.description,
                    created_by=user,
                    updated_by=user,
                )
                extras.append(doc)
            return Response({
                'updated': DocumentSerializer(instance, context={'request': request}).data,
                'added': DocumentSerializer(extras, many=True, context={'request': request}).data,
            })

        return Response(DocumentSerializer(instance, context={'request': request}).data)
