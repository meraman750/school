from datetime import date

from django.utils import timezone
from rest_framework import serializers

from .models import Student, Guardian, MedicalInfo, EmergencyContact, StudentDocument, Admission


def generate_admission_number():
    year = timezone.now().year
    prefix = f'STU{year}'
    ids = Student.all_objects.filter(admission_number__startswith=prefix).values_list('admission_number', flat=True)
    max_num = 0
    for admission_number in ids:
        suffix = admission_number.replace(prefix, '')
        if suffix.isdigit():
            max_num = max(max_num, int(suffix))
    return f'{prefix}{max_num + 1:04d}'


class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = (
            'admission_number',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
            'is_deleted',
        )
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
            'date_of_birth': {'required': False},
            'enrollment_date': {'required': False},
            'gender': {'required': True},
            'grade_level': {'required': True},
        }

    def validate_grade_level(self, value):
        if value is not None and (value < 1 or value > 8):
            raise serializers.ValidationError('Grade must be between 1 and 8.')
        return value

    def validate_status(self, value):
        allowed = {Student.Status.ACTIVE, Student.Status.INACTIVE}
        if value not in allowed:
            raise serializers.ValidationError('Status must be Active or Inactive.')
        return value

    def validate(self, attrs):
        if self.instance is None:
            if not attrs.get('date_of_birth'):
                attrs['date_of_birth'] = date(2015, 1, 1)
            if not attrs.get('enrollment_date'):
                attrs['enrollment_date'] = timezone.now().date()
            attrs['admission_number'] = generate_admission_number()
            if not attrs.get('status'):
                attrs['status'] = Student.Status.ACTIVE
            attrs.setdefault('email', '')
        return attrs


class GuardianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guardian
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class MedicalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalInfo
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class StudentDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentDocument
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted', 'uploaded_at')


class AdmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admission
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted', 'application_date')
