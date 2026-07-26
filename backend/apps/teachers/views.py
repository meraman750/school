from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import MethodNotAllowed, PermissionDenied

from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsStaffMember, IsSchoolAdmin
from apps.core.teacher_scope import get_teacher_for_user, get_teacher_assigned_sections

from .models import (
    Teacher, TeacherQualification, TeacherLeave, TeacherPerformance,
    TeacherSalaryInfo, TeacherSalaryPayment,
)
from .serializers import (
    TeacherSerializer, TeacherProfileSerializer, TeacherQualificationSerializer,
    TeacherLeaveSerializer, TeacherPerformanceSerializer,
    TeacherSalaryInfoSerializer, TeacherSalaryPaymentSerializer,
)


class TeacherViewSet(BaseModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['status', 'gender', 'specialization']
    search_fields = ['employee_id', 'first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['hire_date', 'last_name']

    def get_queryset(self):
        qs = Teacher.objects.filter(is_deleted=False)
        if self.request.user.role == 'TEACHER':
            teacher = get_teacher_for_user(self.request.user)
            if not teacher:
                return qs.none()
            return qs.filter(pk=teacher.pk)
        return qs

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if request.user.role in ('FINANCE', 'ACCOUNTANT') and request.method not in ('GET', 'HEAD', 'OPTIONS'):
            raise MethodNotAllowed(
                request.method,
                detail='Finance staff have read-only access to teacher records.',
            )

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        teacher = get_teacher_for_user(request.user)
        if not teacher:
            return Response({'detail': 'No teacher profile linked.'}, status=404)
        return Response(TeacherSerializer(teacher).data)

    @action(detail=False, methods=['get'], url_path='assigned-sections')
    def assigned_sections(self, request):
        teacher = get_teacher_for_user(request.user)
        if not teacher:
            return Response({'sections': []})
        pairs = get_teacher_assigned_sections(teacher)
        sections = [
            {'grade_level': grade, 'section': name}
            for grade, name in sorted(pairs, key=lambda x: (x[0], x[1]))
        ]
        return Response({'sections': sections})

    @action(detail=True, methods=['post'], url_path='assign-class-teacher')
    def assign_class_teacher(self, request, pk=None):
        if not IsSchoolAdmin().has_permission(request, self):
            raise PermissionDenied('Only administrators can assign class teachers.')
        teacher = self.get_object()
        try:
            grade_level = int(request.data.get('grade_level'))
        except (TypeError, ValueError):
            return Response({'detail': 'grade_level is required.'}, status=400)
        section_name = (request.data.get('section') or 'A').strip()
        if grade_level < 1 or grade_level > 8:
            return Response({'detail': 'grade_level must be between 1 and 8.'}, status=400)

        from apps.academics.models import AcademicYear, SchoolClass
        academic_year = AcademicYear.objects.filter(is_current=True).first()
        if not academic_year:
            academic_year = AcademicYear.objects.order_by('-start_date').first()
        if not academic_year:
            return Response({'detail': 'No academic year configured.'}, status=400)

        school_class = SchoolClass.objects.filter(
            academic_year=academic_year,
            grade_level=grade_level,
            is_deleted=False,
        ).first()
        if not school_class:
            return Response({'detail': f'No class found for grade {grade_level}.'}, status=404)

        school_class.class_teacher = teacher
        school_class.updated_by = request.user
        school_class.save(update_fields=['class_teacher', 'updated_by', 'updated_at'])

        return Response({
            'detail': f'{teacher.first_name} assigned as class teacher for Grade {grade_level}.',
            'school_class_id': school_class.id,
            'grade_level': grade_level,
            'section': section_name,
        })

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        teacher = self.get_object()
        if request.user.role == 'TEACHER':
            own = get_teacher_for_user(request.user)
            if not own or own.pk != teacher.pk:
                raise PermissionDenied('You can only view your own profile.')
        teacher = Teacher.objects.prefetch_related(
            'qualifications',
            'leaves',
            'performance_reviews',
            'salary_payments',
        ).select_related('salary_info').get(pk=teacher.pk)
        serializer = TeacherProfileSerializer(teacher)
        return Response(serializer.data)


class TeacherQualificationViewSet(BaseModelViewSet):
    queryset = TeacherQualification.objects.select_related('teacher')
    serializer_class = TeacherQualificationSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['teacher']
    ordering_fields = ['graduation_year']


class TeacherLeaveViewSet(BaseModelViewSet):
    queryset = TeacherLeave.objects.select_related('teacher')
    serializer_class = TeacherLeaveSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['teacher', 'leave_type', 'status']
    ordering_fields = ['start_date']


class TeacherPerformanceViewSet(BaseModelViewSet):
    queryset = TeacherPerformance.objects.select_related('teacher')
    serializer_class = TeacherPerformanceSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['teacher', 'review_period']
    ordering_fields = ['review_date', 'rating']


class TeacherSalaryInfoViewSet(BaseModelViewSet):
    queryset = TeacherSalaryInfo.objects.select_related('teacher')
    serializer_class = TeacherSalaryInfoSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['teacher']


class TeacherSalaryPaymentViewSet(BaseModelViewSet):
    queryset = TeacherSalaryPayment.objects.select_related('teacher')
    serializer_class = TeacherSalaryPaymentSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['teacher', 'status']
    ordering_fields = ['pay_period_start', 'payment_date']
