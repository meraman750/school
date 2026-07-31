from django.utils import timezone
from django.utils.text import slugify
from rest_framework import serializers

from .models import (
    SchoolInfo, BlogPost, Event, GalleryItem, ContactSubmission,
    JobOpening, Download, FAQ, NewsletterSubscription,
)


class SchoolInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolInfo
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class BlogPostSerializer(serializers.ModelSerializer):
    featured_image_url = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    category_label = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = (
            'id', 'title', 'slug', 'content', 'excerpt', 'featured_image', 'featured_image_url',
            'author_name', 'category', 'category_label', 'is_published', 'published_at', 'date',
            'tags', 'created_at', 'updated_at',
        )
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')
        extra_kwargs = {'slug': {'required': False, 'allow_blank': True}}

    def _generate_slug(self, title):
        base = slugify(title) or 'post'
        slug = base
        counter = 1
        while BlogPost.objects.filter(slug=slug).exists():
            slug = f'{base}-{counter}'
            counter += 1
        return slug

    def get_featured_image_url(self, obj):
        request = self.context.get('request')
        if not obj.featured_image:
            return None
        try:
            url = obj.featured_image.url
        except (ValueError, AttributeError):
            return None
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_date(self, obj):
        value = obj.published_at or obj.created_at
        return value.isoformat() if value else None

    def get_category_label(self, obj):
        if obj.category == BlogPost.Category.ANNOUNCEMENT:
            return 'Announcement'
        return 'News'

    def validate_is_published(self, value):
        if isinstance(value, str):
            return value.lower() in ('true', '1', 'yes', 'on')
        return bool(value)

    def validate(self, attrs):
        title = attrs.get('title', getattr(self.instance, 'title', None))
        if not attrs.get('slug') and title:
            attrs['slug'] = self._generate_slug(title)
        is_published = attrs.get('is_published', getattr(self.instance, 'is_published', False))
        if is_published and not attrs.get('published_at') and not getattr(self.instance, 'published_at', None):
            attrs['published_at'] = timezone.now()
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        if not validated_data.get('slug') and validated_data.get('title'):
            validated_data['slug'] = self._generate_slug(validated_data['title'])
        validated_data.setdefault('author_name', user.get_full_name() or user.email)
        validated_data['created_by'] = user
        validated_data['updated_by'] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data['updated_by'] = self.context['request'].user
        return super().update(instance, validated_data)


class EventSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = (
            'id', 'title', 'description', 'location', 'start_date', 'end_date',
            'image', 'image_url', 'date', 'is_published', 'created_at', 'updated_at',
        )
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')

    def get_image_url(self, obj):
        request = self.context.get('request')
        if not obj.image:
            return None
        try:
            url = obj.image.url
        except (ValueError, AttributeError):
            return None
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_date(self, obj):
        return obj.start_date.isoformat() if obj.start_date else None

    def validate_is_published(self, value):
        if isinstance(value, str):
            return value.lower() in ('true', '1', 'yes', 'on')
        return bool(value)

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        validated_data['updated_by'] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data['updated_by'] = self.context['request'].user
        return super().update(instance, validated_data)


class GalleryItemSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()

    class Meta:
        model = GalleryItem
        fields = (
            'id', 'title', 'description', 'image', 'image_url', 'url', 'type',
            'category', 'is_published', 'order', 'created_at', 'updated_at',
        )
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')

    def get_image_url(self, obj):
        request = self.context.get('request')
        if not obj.image:
            return None
        try:
            url = obj.image.url
        except (ValueError, AttributeError):
            return None
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_url(self, obj):
        return self.get_image_url(obj)

    def get_type(self, obj):
        return 'image'

    def validate_is_published(self, value):
        if isinstance(value, str):
            return value.lower() in ('true', '1', 'yes', 'on')
        return bool(value)

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        validated_data['updated_by'] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data['updated_by'] = self.context['request'].user
        return super().update(instance, validated_data)


class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted', 'status')


class JobOpeningSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobOpening
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class DownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Download
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted', 'download_count')


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ('id', 'email', 'name', 'is_active', 'subscribed_at')
        read_only_fields = ('id', 'is_active', 'subscribed_at')
