from rest_framework import serializers

from .models import Teacher, TeacherQualification, TeacherLeave, TeacherPerformance


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class TeacherQualificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherQualification
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class TeacherLeaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherLeave
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class TeacherPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherPerformance
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')
