from datetime import date
from decimal import Decimal

from django.utils import timezone
from rest_framework import serializers

from apps.academics.models import Curriculum, Subject

from .models import (
    Student, Guardian, MedicalInfo, EmergencyContact, StudentDocument, Admission,
    StudentGradeReport, StudentGradeReportEntry,
)


def score_to_letter(score):
    score = float(score)
    if score >= 90:
        return 'A'
    if score >= 80:
        return 'B'
    if score >= 70:
        return 'C'
    if score >= 60:
        return 'D'
    return 'F'


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


class StudentGradeReportEntrySerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)

    class Meta:
        model = StudentGradeReportEntry
        fields = ('id', 'subject', 'subject_name', 'subject_code', 'score', 'grade_letter', 'remarks')
        read_only_fields = ('grade_letter',)


class StudentGradeReportEntryWriteSerializer(serializers.Serializer):
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())
    score = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=0, max_value=100)
    remarks = serializers.CharField(required=False, allow_blank=True, default='')


class StudentGradeReportSerializer(serializers.ModelSerializer):
    entries = StudentGradeReportEntrySerializer(many=True, read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    quarter_label = serializers.SerializerMethodField()

    class Meta:
        model = StudentGradeReport
        fields = (
            'id', 'student', 'academic_year', 'academic_year_name', 'grade_level',
            'quarter', 'quarter_label', 'overall_average', 'teacher_remarks',
            'principal_remarks', 'entries', 'created_at',
        )
        read_only_fields = ('overall_average', 'created_at')

    def get_quarter_label(self, obj):
        return dict(StudentGradeReport.Quarter.choices).get(obj.quarter, f'Q{obj.quarter}')


class StudentGradeReportWriteSerializer(serializers.ModelSerializer):
    entries = StudentGradeReportEntryWriteSerializer(many=True)

    class Meta:
        model = StudentGradeReport
        fields = (
            'student', 'academic_year', 'grade_level', 'quarter',
            'teacher_remarks', 'principal_remarks', 'entries',
        )

    def validate_grade_level(self, value):
        if value < 1 or value > 8:
            raise serializers.ValidationError('Grade must be between 1 and 8.')
        return value

    def validate_entries(self, value):
        if not value:
            raise serializers.ValidationError('At least one subject score is required.')
        return value

    def create(self, validated_data):
        entries_data = validated_data.pop('entries')
        user = self.context['request'].user
        report = StudentGradeReport.objects.create(
            created_by=user,
            updated_by=user,
            **validated_data,
        )
        total = Decimal('0')
        for entry_data in entries_data:
            score = entry_data['score']
            StudentGradeReportEntry.objects.create(
                report=report,
                subject=entry_data['subject'],
                score=score,
                grade_letter=score_to_letter(score),
                remarks=entry_data.get('remarks', ''),
            )
            total += score
        report.overall_average = total / len(entries_data)
        report.save(update_fields=['overall_average'])
        return report


class StudentProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    guardians = GuardianSerializer(many=True, read_only=True)
    medical_info = MedicalInfoSerializer(read_only=True)
    emergency_contacts = EmergencyContactSerializer(many=True, read_only=True)
    documents = StudentDocumentSerializer(many=True, read_only=True)
    grade_reports = StudentGradeReportSerializer(many=True, read_only=True)
    subjects = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = (
            'id', 'admission_number', 'full_name', 'first_name', 'middle_name', 'last_name',
            'gender', 'date_of_birth', 'nationality', 'religion', 'blood_group', 'photo',
            'email', 'phone', 'address', 'city', 'region', 'status', 'grade_level', 'section',
            'enrollment_date', 'previous_school', 'notes', 'created_at',
            'guardians', 'medical_info', 'emergency_contacts', 'documents',
            'grade_reports', 'subjects',
        )

    def get_subjects(self, obj):
        if not obj.grade_level:
            return []
        curricula = Curriculum.objects.filter(
            grade_level=obj.grade_level,
            is_deleted=False,
        ).select_related('subject').order_by('subject__name')
        seen = set()
        subjects = []
        for item in curricula:
            if item.subject_id in seen:
                continue
            seen.add(item.subject_id)
            subjects.append({
                'id': item.subject_id,
                'name': item.subject.name,
                'code': item.subject.code,
            })
        if not subjects:
            for subject in Subject.objects.filter(is_deleted=False).order_by('name')[:8]:
                subjects.append({'id': subject.id, 'name': subject.name, 'code': subject.code})
        return subjects
