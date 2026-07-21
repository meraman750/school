from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import BookCategoryViewSet, BookViewSet, BorrowRecordViewSet, LibraryFineViewSet

router = DefaultRouter()
router.register(r'categories', BookCategoryViewSet, basename='book-category')
router.register(r'books', BookViewSet, basename='book')
router.register(r'borrow-records', BorrowRecordViewSet, basename='borrow-record')
router.register(r'fines', LibraryFineViewSet, basename='library-fine')

urlpatterns = [
    path('', include(router.urls)),
]
