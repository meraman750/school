from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.core.models import BaseModel
from apps.students.models import Student


class BookCategory(BaseModel):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Book categories'

    def __str__(self):
        return self.name


class Book(BaseModel):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    isbn = models.CharField(max_length=20, unique=True, blank=True)
    category = models.ForeignKey(BookCategory, on_delete=models.SET_NULL, null=True, related_name='books')
    publisher = models.CharField(max_length=100, blank=True)
    publication_year = models.PositiveIntegerField(null=True, blank=True)
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    shelf_location = models.CharField(max_length=50, blank=True)
    cover_image = models.ImageField(upload_to='library/covers/', blank=True, null=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return f'{self.title} by {self.author}'


class BorrowRecord(BaseModel):
    class Status(models.TextChoices):
        BORROWED = 'BORROWED', 'Borrowed'
        RETURNED = 'RETURNED', 'Returned'
        OVERDUE = 'OVERDUE', 'Overdue'
        LOST = 'LOST', 'Lost'

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrow_records')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='borrow_records')
    borrow_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.BORROWED)
    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='books_issued',
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-borrow_date']

    def __str__(self):
        return f'{self.book} - {self.student}'


class LibraryFine(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PAID = 'PAID', 'Paid'
        WAIVED = 'WAIVED', 'Waived'

    borrow_record = models.ForeignKey(BorrowRecord, on_delete=models.CASCADE, related_name='fines')
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    reason = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    paid_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Fine {self.amount} - {self.borrow_record}'
