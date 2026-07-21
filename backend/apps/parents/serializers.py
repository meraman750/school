from rest_framework import serializers

from apps.authentication.serializers import UserSerializer
from apps.students.serializers import StudentSerializer
from .models import ParentProfile


class ParentProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    students_details = StudentSerializer(source='students', many=True, read_only=True)

    class Meta:
        model = ParentProfile
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')
