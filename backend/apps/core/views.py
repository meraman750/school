from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, F, DecimalField, ExpressionWrapper
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.students.models import Student, Admission
from apps.teachers.models import Teacher
from apps.academics.models import SchoolClass, Section
from apps.finance.models import Invoice, Payment
from apps.attendance.models import StudentAttendance

User = get_user_model()


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()

        total_students = Student.objects.filter(is_deleted=False, status='ACTIVE').count()
        total_teachers = Teacher.objects.filter(is_deleted=False, status='ACTIVE').count()
        total_classes = SchoolClass.objects.filter(is_deleted=False).count()
        total_sections = Section.objects.filter(is_deleted=False).count()

        revenue = Payment.objects.filter(is_deleted=False, status='COMPLETED').aggregate(
            total=Sum('amount')
        )['total'] or 0

        balance_expr = ExpressionWrapper(
            F('total_amount') - F('amount_paid'),
            output_field=DecimalField(max_digits=10, decimal_places=2),
        )
        pending_fees = Invoice.objects.filter(
            is_deleted=False,
            status__in=['PENDING', 'PARTIAL', 'OVERDUE'],
        ).aggregate(total=Sum(balance_expr))['total'] or 0

        attendance_today = StudentAttendance.objects.filter(date=today, is_deleted=False)
        present_today = attendance_today.filter(status='PRESENT').count()
        total_attendance = attendance_today.count()
        attendance_rate = round((present_today / total_attendance * 100), 1) if total_attendance else 0

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
            'revenue': float(revenue),
            'pending_fees': float(pending_fees),
            'attendance_today': attendance_rate,
            'present_today': present_today,
            'gender_distribution': list(gender_dist),
            'recent_admissions': recent_admissions,
            'student_growth': student_growth,
        })
