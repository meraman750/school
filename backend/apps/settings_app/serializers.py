from rest_framework import serializers

from .models import SchoolProfile, AcademicSettings, GradingSettings, EmailSettings


class SchoolProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolProfile
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class AcademicSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSettings
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class GradingSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradingSettings
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class EmailSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailSettings
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')
        extra_kwargs = {'smtp_password': {'write_only': True}}
