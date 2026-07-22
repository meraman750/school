import re
from datetime import date
from decimal import Decimal

from django.utils import timezone
from rest_framework import serializers

from apps.academics.models import SchoolClass

from .models import (
    Teacher, TeacherQualification, TeacherLeave, TeacherPerformance,
    TeacherSalaryInfo, TeacherSalaryPayment,
)


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
    full_name = serializers.SerializerMethodField()

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

    def get_full_name(self, obj):
        parts = [obj.first_name, obj.middle_name, obj.last_name]
        return ' '.join(p for p in parts if p)

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

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        validated_data.pop('created_by', None)
        validated_data.pop('updated_by', None)
        teacher = Teacher.objects.create(
            created_by=user,
            updated_by=user,
            **validated_data,
        )
        TeacherSalaryInfo.objects.create(
            teacher=teacher,
            created_by=user,
            updated_by=user,
            effective_from=teacher.hire_date,
        )
        return teacher

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
    leave_type_label = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = TeacherLeave
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')

    def get_leave_type_label(self, obj):
        return dict(TeacherLeave.LeaveType.choices).get(obj.leave_type, obj.leave_type)

    def get_status_label(self, obj):
        return dict(TeacherLeave.Status.choices).get(obj.status, obj.status)


class TeacherPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherPerformance
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class TeacherSalaryInfoSerializer(serializers.ModelSerializer):
    gross_salary = serializers.SerializerMethodField()
    total_deductions = serializers.SerializerMethodField()
    net_monthly_salary = serializers.SerializerMethodField()
    payment_method_label = serializers.SerializerMethodField()

    class Meta:
        model = TeacherSalaryInfo
        fields = (
            'id', 'teacher', 'base_salary', 'housing_allowance', 'transport_allowance',
            'other_allowances', 'tax_deduction', 'pension_deduction', 'other_deductions',
            'gross_salary', 'total_deductions', 'net_monthly_salary',
            'bank_name', 'bank_account', 'payment_method', 'payment_method_label',
            'effective_from', 'notes', 'created_at',
        )
        read_only_fields = ('created_at',)

    def get_gross_salary(self, obj):
        return obj.gross_salary

    def get_total_deductions(self, obj):
        return obj.total_deductions

    def get_net_monthly_salary(self, obj):
        return obj.net_monthly_salary

    def get_payment_method_label(self, obj):
        return dict(TeacherSalaryInfo.PaymentMethod.choices).get(obj.payment_method, obj.payment_method)

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data.pop('created_by', None)
        validated_data.pop('updated_by', None)
        return TeacherSalaryInfo.objects.create(
            created_by=user,
            updated_by=user,
            **validated_data,
        )

    def update(self, instance, validated_data):
        validated_data.pop('created_by', None)
        validated_data['updated_by'] = self.context['request'].user
        return super().update(instance, validated_data)


class TeacherSalaryPaymentSerializer(serializers.ModelSerializer):
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = TeacherSalaryPayment
        fields = (
            'id', 'teacher', 'pay_period_start', 'pay_period_end',
            'basic_salary', 'allowances', 'deductions', 'net_salary',
            'status', 'status_label', 'payment_date', 'notes', 'created_at',
        )
        read_only_fields = ('created_at',)

    def get_status_label(self, obj):
        return dict(TeacherSalaryPayment.Status.choices).get(obj.status, obj.status)

    def validate(self, attrs):
        basic = attrs.get('basic_salary', getattr(self.instance, 'basic_salary', 0))
        allowances = attrs.get('allowances', getattr(self.instance, 'allowances', 0))
        deductions = attrs.get('deductions', getattr(self.instance, 'deductions', 0))
        attrs['net_salary'] = Decimal(str(basic)) + Decimal(str(allowances)) - Decimal(str(deductions))
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data.pop('created_by', None)
        validated_data.pop('updated_by', None)
        return TeacherSalaryPayment.objects.create(
            created_by=user,
            updated_by=user,
            **validated_data,
        )


class TeacherProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    subject = serializers.CharField(source='specialization', read_only=True)
    qualifications = TeacherQualificationSerializer(many=True, read_only=True)
    leaves = TeacherLeaveSerializer(many=True, read_only=True)
    performance_reviews = TeacherPerformanceSerializer(many=True, read_only=True)
    salary_info = TeacherSalaryInfoSerializer(read_only=True)
    salary_payments = TeacherSalaryPaymentSerializer(many=True, read_only=True)
    classes_taught = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = (
            'id', 'employee_id', 'full_name', 'first_name', 'middle_name', 'last_name',
            'gender', 'date_of_birth', 'email', 'phone', 'address', 'photo',
            'hire_date', 'status', 'specialization', 'subject', 'years_of_experience',
            'bio', 'emergency_contact', 'emergency_phone', 'created_at',
            'qualifications', 'leaves', 'performance_reviews',
            'salary_info', 'salary_payments', 'classes_taught',
        )

    def get_full_name(self, obj):
        parts = [obj.first_name, obj.middle_name, obj.last_name]
        return ' '.join(p for p in parts if p)

    def get_classes_taught(self, obj):
        classes = SchoolClass.objects.filter(
            class_teacher=obj, is_deleted=False,
        ).select_related('academic_year').order_by('-academic_year__start_date', 'name')
        return [{
            'id': c.id,
            'name': c.name,
            'grade_level': c.grade_level,
            'academic_year_name': c.academic_year.name if c.academic_year else '',
        } for c in classes]
