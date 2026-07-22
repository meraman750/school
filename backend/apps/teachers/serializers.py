import re
from datetime import date

from django.utils import timezone
from rest_framework import serializers

from .models import Teacher, TeacherQualification, TeacherLeave, TeacherPerformance


def generate_employee_id():
    prefix = 'TCH'
    ids = Teacher.all_objects.filter(employee_id__startswith=prefix).values_list('employee_id', flat=True)
    max_num = 0
    for employee_id in ids:
        match = re.search(r'(\d+)$', employee_id)
        if match:
            max_num = max(max_num, int(match.group(1)))
    return f'{prefix}{max_num + 1:03d}'


def generate_teacher_email(first_name, last_name):
    base = re.sub(r'[^a-z0-9]', '', f'{first_name}.{last_name}'.lower()) or 'teacher'
    email = f'{base}@birukacademy.edu'
    counter = 1
    while Teacher.all_objects.filter(email=email).exists():
        email = f'{base}{counter}@birukacademy.edu'
        counter += 1
    return email


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'
        read_only_fields = (
            'employee_id',
            'email',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
            'is_deleted',
        )
        extra_kwargs = {
            'phone': {'required': False, 'allow_blank': True},
            'date_of_birth': {'required': False},
            'hire_date': {'required': False},
            'gender': {'required': True},
            'specialization': {'required': False, 'allow_blank': True},
        }

    def validate(self, attrs):
        if self.instance is None:
            first_name = attrs.get('first_name', '')
            last_name = attrs.get('last_name', '')
            attrs['employee_id'] = generate_employee_id()
            attrs['email'] = generate_teacher_email(first_name, last_name)
            attrs.setdefault('phone', '')
            attrs.setdefault('date_of_birth', date(1990, 1, 1))
            attrs.setdefault('hire_date', timezone.now().date())
            attrs.setdefault('status', Teacher.Status.ACTIVE)
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['subject'] = instance.specialization
        return data


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
