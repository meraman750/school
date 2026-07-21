from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsStaffMember

from .models import BookCategory, Book, BorrowRecord, LibraryFine
from .serializers import BookCategorySerializer, BookSerializer, BorrowRecordSerializer, LibraryFineSerializer


class BookCategoryViewSet(BaseModelViewSet):
    queryset = BookCategory.objects.all()
    serializer_class = BookCategorySerializer
    permission_classes = [IsStaffMember]
    search_fields = ['name']


class BookViewSet(BaseModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['category']
    search_fields = ['title', 'author', 'isbn']


class BorrowRecordViewSet(BaseModelViewSet):
    queryset = BorrowRecord.objects.all()
    serializer_class = BorrowRecordSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['book', 'student', 'status']
    ordering_fields = ['borrow_date', 'due_date']


class LibraryFineViewSet(BaseModelViewSet):
    queryset = LibraryFine.objects.all()
    serializer_class = LibraryFineSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['borrow_record', 'status']
