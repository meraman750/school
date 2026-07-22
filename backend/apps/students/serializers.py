from datetime import date
from decimal import Decimal

from django.utils import timezone
from rest_framework import serializers

from apps.academics.models import AcademicYear, Curriculum, Subject

from .models import (
    Student, Guardian, MedicalInfo, EmergencyContact, StudentDocument, Admission,
    StudentGradeReport, StudentGradeReportEntry,
    StudentEnrollmentRecord, StudentNote, StudentEnrollmentSubject,
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


def get_report_section(report):
    enrollment = StudentEnrollmentRecord.objects.filter(
        student=report.student,
        academic_year=report.academic_year,
        grade_level=report.grade_level,
    ).first()
    if enrollment and enrollment.section:
        return enrollment.section
    return report.student.section or ''


def update_class_ranks_for_report(report):
    section = get_report_section(report)
    peers = StudentGradeReport.objects.filter(
        academic_year=report.academic_year,
        grade_level=report.grade_level,
        quarter=report.quarter,
    ).select_related('student')

    class_reports = [p for p in peers if get_report_section(p) == section]
    class_reports.sort(key=lambda r: float(r.overall_average), reverse=True)

    class_size = len(class_reports)
    for index, peer in enumerate(class_reports, start=1):
        StudentGradeReport.objects.filter(pk=peer.pk).update(
            class_rank=index,
            class_size=class_size,
        )


def sync_student_from_current_enrollment(student):
    current = StudentEnrollmentRecord.objects.filter(
        student=student, is_current=True,
    ).select_related('academic_year').first()
    if not current:
        return
    student.grade_level = current.grade_level
    student.section = current.section or ''
    student.save(update_fields=['grade_level', 'section', 'updated_at'])


def get_subjects_for_grade(grade_level):
    if not grade_level:
        return []
    curricula = Curriculum.objects.filter(
        grade_level=grade_level,
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
            'religion': {'required': False, 'allow_blank': True},
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
    rank_display = serializers.SerializerMethodField()

    class Meta:
        model = StudentGradeReport
        fields = (
            'id', 'student', 'academic_year', 'academic_year_name', 'grade_level',
            'quarter', 'quarter_label', 'overall_average', 'class_rank', 'class_size',
            'rank_display', 'teacher_remarks', 'principal_remarks', 'entries', 'created_at',
        )
        read_only_fields = ('overall_average', 'class_rank', 'class_size', 'created_at')

    def get_quarter_label(self, obj):
        return dict(StudentGradeReport.Quarter.choices).get(obj.quarter, f'Q{obj.quarter}')

    def get_rank_display(self, obj):
        if obj.class_rank and obj.class_size:
            return f'{obj.class_rank} of {obj.class_size}'
        return None


class StudentGradeReportWriteSerializer(serializers.ModelSerializer):
    entries = StudentGradeReportEntryWriteSerializer(many=True)

    class Meta:
        model = StudentGradeReport
        fields = (
            'student', 'academic_year', 'grade_level', 'quarter',
            'teacher_remarks', 'principal_remarks', 'entries',
        )
        validators = []

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
        request = self.context.get('request')
        user = request.user if request else None

        report, created = StudentGradeReport.objects.update_or_create(
            student=validated_data['student'],
            academic_year=validated_data['academic_year'],
            grade_level=validated_data['grade_level'],
            quarter=validated_data['quarter'],
            defaults={
                'teacher_remarks': validated_data.get('teacher_remarks', ''),
                'principal_remarks': validated_data.get('principal_remarks', ''),
                'updated_by': user,
            },
        )
        if created:
            report.created_by = user
            report.save(update_fields=['created_by'])

        report.entries.all().delete()
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
        update_class_ranks_for_report(report)
        return report


def get_subjects_for_enrollment(enrollment):
    enrolled = enrollment.enrolled_subjects.select_related('subject').all()
    if enrolled.exists():
        return [{
            'id': item.subject_id,
            'name': item.subject.name,
            'code': item.subject.code,
        } for item in enrolled]
    return get_subjects_for_grade(enrollment.grade_level)


class StudentEnrollmentRecordSerializer(serializers.ModelSerializer):
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    subjects = serializers.SerializerMethodField()
    subject_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True,
    )

    class Meta:
        model = StudentEnrollmentRecord
        fields = (
            'id', 'student', 'academic_year', 'academic_year_name',
            'grade_level', 'section', 'start_date', 'end_date',
            'is_current', 'remarks', 'subjects', 'subject_ids', 'created_at',
        )
        read_only_fields = ('created_at',)
        validators = []

    def validate_is_current(self, value):
        if isinstance(value, str):
            return value.lower() in ('true', '1', 'on', 'yes')
        return bool(value)

    def get_subjects(self, obj):
        return get_subjects_for_enrollment(obj)

    def validate_grade_level(self, value):
        if value < 1 or value > 8:
            raise serializers.ValidationError('Grade must be between 1 and 8.')
        return value

    def validate(self, attrs):
        for field in ('start_date', 'end_date'):
            if attrs.get(field) == '':
                attrs[field] = None
        return attrs

    def _sync_subjects(self, record, subject_ids):
        if subject_ids is None:
            return
        record.enrolled_subjects.all().delete()
        for subject_id in subject_ids:
            StudentEnrollmentSubject.objects.create(
                enrollment=record,
                subject_id=subject_id,
            )

    def create(self, validated_data):
        user = self.context['request'].user
        subject_ids = validated_data.pop('subject_ids', None)
        student = validated_data.pop('student')
        academic_year = validated_data.pop('academic_year')
        validated_data.pop('created_by', None)
        validated_data.pop('updated_by', None)

        if StudentEnrollmentRecord.objects.filter(
            student=student, academic_year=academic_year,
        ).exists():
            raise serializers.ValidationError({
                'academic_year': 'Student already has an enrollment for this year. Edit that record instead.',
            })

        if validated_data.get('is_current'):
            StudentEnrollmentRecord.objects.filter(
                student=student, is_current=True,
            ).update(is_current=False)

        record = StudentEnrollmentRecord.objects.create(
            created_by=user,
            updated_by=user,
            student=student,
            academic_year=academic_year,
            **validated_data,
        )
        self._sync_subjects(record, subject_ids)
        if record.is_current:
            sync_student_from_current_enrollment(student)
        return record

    def update(self, instance, validated_data):
        user = self.context['request'].user
        subject_ids = validated_data.pop('subject_ids', None)
        validated_data.pop('created_by', None)
        is_current = validated_data.get('is_current', instance.is_current)

        if is_current:
            StudentEnrollmentRecord.objects.filter(
                student=instance.student, is_current=True,
            ).exclude(pk=instance.pk).update(is_current=False)

        validated_data['updated_by'] = user
        record = super().update(instance, validated_data)
        self._sync_subjects(record, subject_ids)
        if record.is_current:
            sync_student_from_current_enrollment(instance.student)
        return record


class StudentNoteSerializer(serializers.ModelSerializer):
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    note_type_label = serializers.SerializerMethodField()

    class Meta:
        model = StudentNote
        fields = (
            'id', 'student', 'academic_year', 'academic_year_name',
            'note_type', 'note_type_label', 'title', 'content',
            'event_date', 'created_at',
        )
        read_only_fields = ('created_at',)

    def get_note_type_label(self, obj):
        return dict(StudentNote.NoteType.choices).get(obj.note_type, obj.note_type)


class StudentProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    guardians = GuardianSerializer(many=True, read_only=True)
    medical_info = MedicalInfoSerializer(read_only=True)
    documents = StudentDocumentSerializer(many=True, read_only=True)
    grade_reports = StudentGradeReportSerializer(many=True, read_only=True)
    enrollment_records = StudentEnrollmentRecordSerializer(many=True, read_only=True)
    student_notes = StudentNoteSerializer(many=True, read_only=True)
    current_enrollment = serializers.SerializerMethodField()
    subjects = serializers.SerializerMethodField()
    subject_history = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = (
            'id', 'admission_number', 'full_name', 'first_name', 'middle_name', 'last_name',
            'gender', 'date_of_birth', 'nationality', 'blood_group', 'photo',
            'email', 'phone', 'address', 'city', 'region', 'status', 'grade_level', 'section',
            'enrollment_date', 'previous_school', 'notes', 'created_at',
            'guardians', 'medical_info', 'documents', 'grade_reports', 'enrollment_records',
            'student_notes', 'current_enrollment', 'subjects', 'subject_history',
        )

    def get_current_enrollment(self, obj):
        current = obj.enrollment_records.filter(is_current=True).select_related(
            'academic_year',
        ).prefetch_related('enrolled_subjects__subject').first()
        if not current:
            return None
        return {
            'id': current.id,
            'academic_year_id': current.academic_year_id,
            'academic_year_name': current.academic_year.name,
            'grade_level': current.grade_level,
            'section': current.section,
            'start_date': current.start_date,
            'subjects': get_subjects_for_enrollment(current),
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        current = self.get_current_enrollment(instance)
        if current:
            data['grade_level'] = current['grade_level']
            data['section'] = current['section']
        return data

    def get_subjects(self, obj):
        current = obj.enrollment_records.filter(is_current=True).prefetch_related(
            'enrolled_subjects__subject',
        ).first()
        if current:
            return get_subjects_for_enrollment(current)
        return get_subjects_for_grade(obj.grade_level)

    def get_subject_history(self, obj):
        records = obj.enrollment_records.select_related('academic_year').prefetch_related(
            'enrolled_subjects__subject',
        ).all()
        history = []
        for rec in records:
            history.append({
                'enrollment_id': rec.id,
                'academic_year_id': rec.academic_year_id,
                'academic_year_name': rec.academic_year.name,
                'grade_level': rec.grade_level,
                'section': rec.section,
                'is_current': rec.is_current,
                'subjects': get_subjects_for_enrollment(rec),
            })
        if not history and obj.grade_level:
            history.append({
                'enrollment_id': None,
                'academic_year_id': None,
                'academic_year_name': 'Current enrollment',
                'grade_level': obj.grade_level,
                'section': obj.section,
                'is_current': True,
                'subjects': get_subjects_for_grade(obj.grade_level),
            })
        report_years = {}
        for report in obj.grade_reports.select_related('academic_year').all():
            key = (report.academic_year_id, report.grade_level)
            if key not in report_years:
                report_years[key] = {
                    'enrollment_id': None,
                    'academic_year_id': report.academic_year_id,
                    'academic_year_name': report.academic_year.name,
                    'grade_level': report.grade_level,
                    'section': '',
                    'is_current': False,
                    'subjects': get_subjects_for_grade(report.grade_level),
                }
        existing_keys = {(h['academic_year_id'], h['grade_level']) for h in history if h['academic_year_id']}
        for key, entry in report_years.items():
            if key not in existing_keys:
                history.append(entry)
        history.sort(key=lambda h: (not h['is_current'], h.get('academic_year_name', '')), reverse=True)
        return history
