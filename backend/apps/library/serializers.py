from rest_framework import serializers

from .models import BookCategory, Book, BorrowRecord, LibraryFine


class BookCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookCategory
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Book
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted', 'available_copies')

    def validate_isbn(self, value):
        if value is None:
            return None
        cleaned = str(value).strip()
        return cleaned or None

    def validate(self, attrs):
        shelf_number = attrs.get('shelf_number')
        shelf_row = attrs.get('shelf_row')
        if shelf_number is not None and shelf_number < 1:
            raise serializers.ValidationError({'shelf_number': 'Must be at least 1.'})
        if shelf_row is not None and shelf_row < 1:
            raise serializers.ValidationError({'shelf_row': 'Must be at least 1.'})
        return attrs


class BorrowRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BorrowRecord
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class LibraryFineSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibraryFine
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')
