from rest_framework import serializers

from apps.core.grade_levels import GRADE_LEVEL_RANGE_MSG, is_valid_grade_level

from .models import (
    AcademicYear, Term, Semester, Department, Subject, SchoolClass, Section,
    Curriculum, LessonPlan, Assignment, Homework, Examination, ExamSchedule,
    Grade, ReportCard, Transcript, Timetable, Room,
    GradeAcademicItem, GradeAcademicItemAttachment, AnnualSchedule, AnnualScheduleAttachment,
    GradeExamScheduleEntry,
    GradeExamSchedulePlan,
)

ALLOWED_ACADEMIC_UPLOAD_TYPES = {
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
}
ALLOWED_ACADEMIC_UPLOAD_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif'}


ALLOWED_ANNUAL_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}


def validate_academic_upload_file(uploaded_file):
    ext = ('.' + uploaded_file.name.rsplit('.', 1)[-1].lower()) if '.' in uploaded_file.name else ''
    content_type = (uploaded_file.content_type or '').lower()
    if ext not in ALLOWED_ACADEMIC_UPLOAD_EXTENSIONS and content_type not in ALLOWED_ACADEMIC_UPLOAD_TYPES:
        raise serializers.ValidationError(
            'Each file must be a PDF or an image (JPG, PNG, WEBP, or GIF).',
        )
    if uploaded_file.size > 15 * 1024 * 1024:
        raise serializers.ValidationError('Each file must be 15 MB or smaller.')


def validate_annual_image_file(uploaded_file):
    ext = ('.' + uploaded_file.name.rsplit('.', 1)[-1].lower()) if '.' in uploaded_file.name else ''
    content_type = (uploaded_file.content_type or '').lower()
    if not content_type.startswith('image/') and ext not in ALLOWED_ANNUAL_IMAGE_EXTENSIONS:
        raise serializers.ValidationError('Each file must be an image (JPG, PNG, WEBP, or GIF).')
    if uploaded_file.size > 10 * 1024 * 1024:
        raise serializers.ValidationError('Each image must be 10 MB or smaller.')


class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class TermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Term
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class SchoolClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolClass
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class SectionSerializer(serializers.ModelSerializer):
    school_class_name = serializers.CharField(source='school_class.name', read_only=True)
    grade_level = serializers.IntegerField(source='school_class.grade_level', read_only=True)

    class Meta:
        model = Section
        fields = (
            'id', 'school_class', 'school_class_name', 'grade_level', 'name', 'capacity',
            'created_at', 'updated_at',
        )
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class CurriculumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curriculum
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class LessonPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonPlan
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class HomeworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Homework
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class ExaminationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Examination
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class ExamScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamSchedule
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class ReportCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportCard
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class TranscriptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transcript
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class TimetableSerializer(serializers.ModelSerializer):
    day_label = serializers.CharField(source='get_day_of_week_display', read_only=True)
    school_class_name = serializers.CharField(source='school_class.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True, allow_null=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    room_name = serializers.CharField(source='room.name', read_only=True, allow_null=True)

    class Meta:
        model = Timetable
        fields = (
            'id', 'school_class', 'school_class_name', 'section', 'section_name',
            'subject', 'subject_name', 'teacher', 'teacher_name',
            'day_of_week', 'day_label', 'period_number',
            'start_time', 'end_time', 'room', 'room_name',
            'created_at', 'updated_at',
        )
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')

    def get_teacher_name(self, obj):
        if not obj.teacher_id:
            return ''
        parts = [obj.teacher.first_name, obj.teacher.last_name]
        return ' '.join(p for p in parts if p)

    def validate_period_number(self, value):
        if value is not None and (value < 1 or value > 7):
            raise serializers.ValidationError('Period must be between 1 and 7.')
        return value

    def validate(self, attrs):
        start = attrs.get('start_time', getattr(self.instance, 'start_time', None))
        end = attrs.get('end_time', getattr(self.instance, 'end_time', None))
        if start and end and end <= start:
            raise serializers.ValidationError({'end_time': 'End time must be after start time.'})
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data.pop('created_by', None)
        validated_data.pop('updated_by', None)
        return Timetable.objects.create(
            created_by=user,
            updated_by=user,
            **validated_data,
        )


class AnnualScheduleAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = AnnualScheduleAttachment
        fields = ('id', 'file', 'file_url', 'original_filename', 'created_at')
        read_only_fields = fields

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        if obj.file:
            return obj.file.url
        return None


class AnnualScheduleSerializer(serializers.ModelSerializer):
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    event_type_label = serializers.SerializerMethodField()
    grade_display = serializers.SerializerMethodField()
    attachments = AnnualScheduleAttachmentSerializer(many=True, read_only=True)
    image_count = serializers.SerializerMethodField()

    class Meta:
        model = AnnualSchedule
        fields = (
            'id', 'academic_year', 'academic_year_name', 'title', 'event_type', 'event_type_label',
            'start_date', 'end_date', 'grade_level', 'grade_display', 'description',
            'attachments', 'image_count', 'created_at',
        )
        read_only_fields = ('created_at',)

    def get_event_type_label(self, obj):
        return dict(AnnualSchedule.EventType.choices).get(obj.event_type, obj.event_type)

    def get_grade_display(self, obj):
        if obj.grade_level:
            return f'Grade {obj.grade_level}'
        return 'All grades'

    def get_image_count(self, obj):
        return obj.attachments.filter(is_deleted=False).count()

    def to_internal_value(self, data):
        if hasattr(data, 'get'):
            mutable = data.copy() if hasattr(data, 'copy') else dict(data)
            if mutable.get('grade_level') == '':
                mutable['grade_level'] = None
            data = mutable
        return super().to_internal_value(data)

    def validate(self, attrs):
        start = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end = attrs.get('end_date', attrs.get('start_date', getattr(self.instance, 'end_date', None)))
        if end and start and end < start:
            raise serializers.ValidationError({'end_date': 'End date cannot be before start date.'})
        grade = attrs.get('grade_level')
        if grade is not None and not is_valid_grade_level(grade):
            raise serializers.ValidationError({'grade_level': GRADE_LEVEL_RANGE_MSG})
        request = self.context.get('request')
        if request and request.FILES.getlist('files'):
            for uploaded in request.FILES.getlist('files'):
                validate_annual_image_file(uploaded)
        return attrs

    def _save_attachments(self, schedule, request):
        user = request.user
        for uploaded in request.FILES.getlist('files'):
            AnnualScheduleAttachment.objects.create(
                schedule=schedule,
                file=uploaded,
                original_filename=uploaded.name,
                created_by=user,
                updated_by=user,
            )

    def create(self, validated_data):
        user = self.context['request'].user
        request = self.context['request']
        validated_data.pop('created_by', None)
        validated_data.pop('updated_by', None)
        if not validated_data.get('end_date'):
            validated_data['end_date'] = validated_data['start_date']
        schedule = AnnualSchedule.objects.create(
            created_by=user,
            updated_by=user,
            **validated_data,
        )
        self._save_attachments(schedule, request)
        return schedule

    def update(self, instance, validated_data):
        request = self.context['request']
        validated_data.pop('academic_year', None)
        validated_data.pop('created_by', None)
        validated_data['updated_by'] = request.user
        schedule = super().update(instance, validated_data)
        if request.FILES.getlist('files'):
            self._save_attachments(schedule, request)
        return schedule


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


class GradeAcademicItemAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = GradeAcademicItemAttachment
        fields = ('id', 'file', 'file_url', 'original_filename', 'created_at')
        read_only_fields = fields

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        if obj.file:
            return obj.file.url
        return None


class GradeAcademicItemSerializer(serializers.ModelSerializer):
    attachments = GradeAcademicItemAttachmentSerializer(many=True, read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    item_type_label = serializers.SerializerMethodField()
    attachment_count = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = GradeAcademicItem
        fields = (
            'id', 'item_type', 'item_type_label', 'subject', 'subject_name', 'subject_code',
            'title', 'grade_level', 'academic_year', 'academic_year_name', 'description',
            'attachments', 'attachment_count', 'uploaded_by_name', 'created_at',
        )
        read_only_fields = ('created_at',)

    def get_uploaded_by_name(self, obj):
        user = getattr(obj, 'created_by', None)
        if not user:
            return None
        full = user.get_full_name()
        return full.strip() if full and full.strip() else user.email

    def get_item_type_label(self, obj):
        return dict(GradeAcademicItem.ItemType.choices).get(obj.item_type, obj.item_type)

    def get_attachment_count(self, obj):
        return obj.attachments.filter(is_deleted=False).count()

    def validate_grade_level(self, value):
        if not is_valid_grade_level(value):
            raise serializers.ValidationError(GRADE_LEVEL_RANGE_MSG)
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        item_type = attrs.get('item_type')
        if self.instance is not None:
            item_type = item_type or self.instance.item_type
        if item_type != GradeAcademicItem.ItemType.MATERIAL:
            if self.instance is None and not attrs.get('academic_year'):
                raise serializers.ValidationError(
                    {'academic_year': 'Academic year is required for this item type.'},
                )
        else:
            attrs['academic_year'] = None

        if self.instance is None:
            if not attrs.get('subject'):
                raise serializers.ValidationError({'subject': 'Subject is required.'})
            if request:
                files = request.FILES.getlist('files')
                if not files:
                    raise serializers.ValidationError({'files': 'Upload at least one PDF or image file.'})
                for uploaded in files:
                    validate_academic_upload_file(uploaded)
        elif request and request.FILES.getlist('files'):
            for uploaded in request.FILES.getlist('files'):
                validate_academic_upload_file(uploaded)
        return attrs

    def to_internal_value(self, data):
        if hasattr(data, 'get'):
            mutable = data.copy() if hasattr(data, 'copy') else dict(data)
            for key in ('grade_level', 'subject', 'academic_year'):
                if key in mutable and mutable.get(key) == '':
                    mutable.pop(key, None)
            data = mutable
        return super().to_internal_value(data)

    def _save_attachments(self, item, request):
        user = request.user
        for uploaded in request.FILES.getlist('files'):
            GradeAcademicItemAttachment.objects.create(
                item=item,
                file=uploaded,
                original_filename=uploaded.name,
                created_by=user,
                updated_by=user,
            )

    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        validated_data.pop('created_by', None)
        validated_data.pop('updated_by', None)
        item = GradeAcademicItem.objects.create(
            created_by=user,
            updated_by=user,
            **validated_data,
        )
        self._save_attachments(item, request)
        return item

    def update(self, instance, validated_data):
        request = self.context['request']
        validated_data.pop('academic_year', None)
        validated_data.pop('item_type', None)
        validated_data.pop('subject', None)
        validated_data.pop('created_by', None)
        validated_data['updated_by'] = request.user
        item = super().update(instance, validated_data)
        if request.FILES.getlist('files'):
            self._save_attachments(item, request)
        return item


class GradeExamScheduleEntrySerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    day_label = serializers.SerializerMethodField()

    class Meta:
        model = GradeExamScheduleEntry
        fields = (
            'id', 'grade_level', 'subject', 'subject_name', 'exam_date', 'day_label',
            'start_time', 'end_time', 'schedule_slot_index', 'created_at', 'updated_at',
        )
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')

    def get_day_label(self, obj):
        return obj.exam_date.strftime('%A') if obj.exam_date else ''

    def validate_grade_level(self, value):
        if not is_valid_grade_level(value):
            raise serializers.ValidationError(GRADE_LEVEL_RANGE_MSG)
        return value

    def validate(self, attrs):
        start = attrs.get('start_time', getattr(self.instance, 'start_time', None))
        end = attrs.get('end_time', getattr(self.instance, 'end_time', None))
        if start and end and end <= start:
            raise serializers.ValidationError({'end_time': 'End time must be after start time.'})
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data.pop('created_by', None)
        validated_data.pop('updated_by', None)
        return GradeExamScheduleEntry.objects.create(
            created_by=user,
            updated_by=user,
            **validated_data,
        )

    def update(self, instance, validated_data):
        validated_data.pop('created_by', None)
        validated_data['updated_by'] = self.context['request'].user
        return super().update(instance, validated_data)


class GradeExamSchedulePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeExamSchedulePlan
        fields = (
            'id', 'grade_level', 'title', 'week_start_date', 'scheduled_weekdays',
            'subjects_per_day', 'created_at', 'updated_at',
        )
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')

    def validate_grade_level(self, value):
        if not is_valid_grade_level(value):
            raise serializers.ValidationError(GRADE_LEVEL_RANGE_MSG)
        return value

    def validate_subjects_per_day(self, value):
        if value < 1 or value > 8:
            raise serializers.ValidationError('Subjects per day must be between 1 and 8.')
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data.pop('created_by', None)
        validated_data.pop('updated_by', None)
        return GradeExamSchedulePlan.objects.create(
            created_by=user,
            updated_by=user,
            **validated_data,
        )

    def update(self, instance, validated_data):
        validated_data.pop('created_by', None)
        validated_data['updated_by'] = self.context['request'].user
        return super().update(instance, validated_data)
