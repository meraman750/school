from rest_framework import serializers

from .models import (
    AcademicYear, Term, Semester, Department, Subject, SchoolClass, Section,
    Curriculum, LessonPlan, Assignment, Homework, Examination, ExamSchedule,
    Grade, ReportCard, Transcript, Timetable, Room,
    GradeAcademicItem, GradeAcademicItemAttachment,
)

ALLOWED_ACADEMIC_UPLOAD_TYPES = {
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
}
ALLOWED_ACADEMIC_UPLOAD_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif'}


def validate_academic_upload_file(uploaded_file):
    ext = ('.' + uploaded_file.name.rsplit('.', 1)[-1].lower()) if '.' in uploaded_file.name else ''
    content_type = (uploaded_file.content_type or '').lower()
    if ext not in ALLOWED_ACADEMIC_UPLOAD_EXTENSIONS and content_type not in ALLOWED_ACADEMIC_UPLOAD_TYPES:
        raise serializers.ValidationError(
            'Each file must be a PDF or an image (JPG, PNG, WEBP, or GIF).',
        )
    if uploaded_file.size > 15 * 1024 * 1024:
        raise serializers.ValidationError('Each file must be 15 MB or smaller.')


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
    class Meta:
        model = Section
        fields = '__all__'
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
    class Meta:
        model = Timetable
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted')


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

    class Meta:
        model = GradeAcademicItem
        fields = (
            'id', 'item_type', 'item_type_label', 'subject', 'subject_name', 'subject_code',
            'title', 'grade_level', 'academic_year', 'academic_year_name', 'description',
            'attachments', 'attachment_count', 'created_at',
        )
        read_only_fields = ('created_at',)

    def get_item_type_label(self, obj):
        return dict(GradeAcademicItem.ItemType.choices).get(obj.item_type, obj.item_type)

    def get_attachment_count(self, obj):
        return obj.attachments.filter(is_deleted=False).count()

    def validate_grade_level(self, value):
        if value < 1 or value > 8:
            raise serializers.ValidationError('Grade level must be between 1 and 8.')
        return value

    def validate(self, attrs):
        request = self.context.get('request')
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
