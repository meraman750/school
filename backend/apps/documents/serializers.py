from rest_framework import serializers

from .models import Document

CATEGORY_TO_TYPE = {
    'policy': Document.DocumentType.OTHER,
    'form': Document.DocumentType.OTHER,
    'report': Document.DocumentType.REPORT,
    'certificate': Document.DocumentType.CERTIFICATE,
    'contract': Document.DocumentType.CONTRACT,
    'other': Document.DocumentType.OTHER,
}


def resolve_document_type(raw):
    if not raw:
        return Document.DocumentType.OTHER
    key = str(raw).strip().lower()
    if key in CATEGORY_TO_TYPE:
        return CATEGORY_TO_TYPE[key]
    upper = str(raw).strip().upper()
    if upper in Document.DocumentType.values:
        return upper
    return Document.DocumentType.OTHER


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    original_filename = serializers.SerializerMethodField()
    category = serializers.CharField(source='document_type', required=False)

    class Meta:
        model = Document
        fields = (
            'id', 'title', 'document_type', 'category', 'owner_type', 'description',
            'file', 'file_url', 'file_size', 'original_filename',
            'issue_date', 'expiry_date', 'is_verified',
            'uploaded_by_name', 'created_at', 'updated_at',
        )
        read_only_fields = (
            'created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted',
            'is_verified', 'verified_by', 'file_url', 'file_size', 'uploaded_by_name',
        )
        extra_kwargs = {
            'file': {'required': False, 'write_only': True},
            'document_type': {'required': False},
            'owner_type': {'required': False},
        }

    def get_uploaded_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return ''

    def get_file_url(self, obj):
        if not obj.file:
            return None
        request = self.context.get('request')
        url = obj.file.url
        if request and url:
            return request.build_absolute_uri(url)
        return url

    def get_file_size(self, obj):
        try:
            size = obj.file.size
        except (OSError, ValueError, TypeError):
            return None
        if size is None:
            return None
        if size < 1024:
            return f'{size} B'
        if size < 1024 * 1024:
            return f'{round(size / 1024, 1)} KB'
        return f'{round(size / (1024 * 1024), 1)} MB'

    def get_original_filename(self, obj):
        if not obj.file:
            return ''
        return obj.file.name.split('/')[-1] if obj.file.name else ''

    def validate(self, attrs):
        category = self.initial_data.get('category')
        if category:
            attrs['document_type'] = resolve_document_type(category)
        return attrs
