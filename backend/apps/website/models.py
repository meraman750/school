from django.db import models

from apps.core.models import BaseModel


class SchoolInfo(BaseModel):
    name = models.CharField(max_length=200, default='Biruk Academy Primary School')
    motto = models.CharField(max_length=255, blank=True)
    mission = models.TextField(blank=True)
    vision = models.TextField(blank=True)
    about = models.TextField(blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='website/', blank=True, null=True)
    established_year = models.PositiveIntegerField(null=True, blank=True)
    facebook = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    instagram = models.URLField(blank=True)
    youtube = models.URLField(blank=True)

    class Meta:
        verbose_name_plural = 'School info'

    def __str__(self):
        return self.name


class BlogPost(BaseModel):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    excerpt = models.TextField(blank=True)
    featured_image = models.ImageField(upload_to='website/blog/', blank=True, null=True)
    author_name = models.CharField(max_length=100)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    tags = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-published_at']

    def __str__(self):
        return self.title


class Event(BaseModel):
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=200, blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    image = models.ImageField(upload_to='website/events/', blank=True, null=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return self.title


class GalleryItem(BaseModel):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='website/gallery/')
    category = models.CharField(max_length=50, blank=True)
    is_published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name_plural = 'Gallery items'

    def __str__(self):
        return self.title


class ContactSubmission(BaseModel):
    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        READ = 'READ', 'Read'
        REPLIED = 'REPLIED', 'Replied'
        ARCHIVED = 'ARCHIVED', 'Archived'

    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} - {self.subject}'


class JobOpening(BaseModel):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        CLOSED = 'CLOSED', 'Closed'
        FILLED = 'FILLED', 'Filled'

    title = models.CharField(max_length=200)
    department = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    requirements = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    employment_type = models.CharField(max_length=50, blank=True)
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Download(BaseModel):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='website/downloads/')
    category = models.CharField(max_length=50, blank=True)
    download_count = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class FAQ(BaseModel):
    question = models.CharField(max_length=300)
    answer = models.TextField()
    category = models.CharField(max_length=50, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'question']
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'

    def __str__(self):
        return self.question


class NewsletterSubscription(BaseModel):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-subscribed_at']

    def __str__(self):
        return self.email
