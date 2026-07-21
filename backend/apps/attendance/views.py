from django.db.models import Count, Q
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.mixins import BaseModelViewSet
from apps.core.permissions import IsStaffMember

from .models import StudentAttendance, TeacherAttendance, AttendanceStatus
from .serializers import StudentAttendanceSerializer, TeacherAttendanceSerializer


class StudentAttendanceViewSet(BaseModelViewSet):
    queryset = StudentAttendance.objects.all()
    serializer_class = StudentAttendanceSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['student', 'school_class', 'date', 'status']
    ordering_fields = ['date']


class TeacherAttendanceViewSet(BaseModelViewSet):
    queryset = TeacherAttendance.objects.all()
    serializer_class = TeacherAttendanceSerializer
    permission_classes = [IsStaffMember]
    filterset_fields = ['teacher', 'date', 'status']
    ordering_fields = ['date']


class AttendanceAnalyticsView(APIView):
    permission_classes = [IsStaffMember]

    def get(self, request):
        date = request.query_params.get('date')
        school_class = request.query_params.get('school_class')

        student_qs = StudentAttendance.objects.all()
        teacher_qs = TeacherAttendance.objects.all()

        if date:
            student_qs = student_qs.filter(date=date)
            teacher_qs = teacher_qs.filter(date=date)
        if school_class:
            student_qs = student_qs.filter(school_class_id=school_class)

        student_stats = student_qs.values('status').annotate(count=Count('id'))
        teacher_stats = teacher_qs.values('status').annotate(count=Count('id'))

        student_total = student_qs.count()
        student_present = student_qs.filter(
            status__in=[AttendanceStatus.PRESENT, AttendanceStatus.LATE],
        ).count()

        return Response({
            'success': True,
            'data': {
                'student_attendance': {
                    'total': student_total,
                    'present_count': student_present,
                    'attendance_rate': round((student_present / student_total * 100), 2) if student_total else 0,
                    'by_status': {item['status']: item['count'] for item in student_stats},
                },
                'teacher_attendance': {
                    'total': teacher_qs.count(),
                    'by_status': {item['status']: item['count'] for item in teacher_stats},
                },
            },
        })
