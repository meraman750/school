from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.students.models import Student, Admission
from apps.teachers.models import Teacher
from apps.academics.models import SchoolClass, Section

User = get_user_model()


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()

        total_students = Student.objects.filter(is_deleted=False, status='ACTIVE').count()
        total_teachers = Teacher.objects.filter(is_deleted=False, status='ACTIVE').count()
        total_classes = SchoolClass.objects.filter(is_deleted=False).count()
        total_sections = Section.objects.filter(is_deleted=False).count()

        gender_dist = Student.objects.filter(is_deleted=False, status='ACTIVE').values('gender').annotate(
            count=Count('id')
        )

        recent_admissions = list(
            Admission.objects.filter(is_deleted=False)
            .order_by('-application_date')[:5]
            .values('id', 'applicant_first_name', 'applicant_last_name', 'application_date', 'status')
        )

        student_growth = []
        for i in range(5, -1, -1):
            month_start = today.replace(day=1)
            month = month_start.month - i
            year = month_start.year
            while month <= 0:
                month += 12
                year -= 1
            count = Student.objects.filter(
                is_deleted=False,
                enrollment_date__year=year,
                enrollment_date__month=month,
            ).count()
            student_growth.append({'month': f'{year}-{month:02d}', 'count': count})

        return Response({
            'total_students': total_students,
            'total_teachers': total_teachers,
            'total_classes': total_classes,
            'total_sections': total_sections,
            'gender_distribution': list(gender_dist),
            'recent_admissions': recent_admissions,
            'student_growth': student_growth,
        })
