from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.models import DashboardActivity
from apps.core.pagination import StandardResultsSetPagination
from apps.core.permissions import IsSchoolAdmin
from apps.students.models import Student, Admission
from apps.teachers.models import Teacher, TeacherSalaryPayment
from apps.academics.models import SchoolClass, Section
from apps.finance.models import Invoice, Payment

User = get_user_model()


ADMIN_ROLES = ('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'REGISTRAR')
FINANCE_ROLES = ('FINANCE', 'ACCOUNTANT')


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = getattr(request.user, 'role', None)

        if role in FINANCE_ROLES:
            total_invoiced = Invoice.objects.filter(is_deleted=False).aggregate(
                total=Sum('total_amount'),
            )['total'] or 0
            total_collected = Payment.objects.filter(
                is_deleted=False, status='COMPLETED',
            ).aggregate(total=Sum('amount'))['total'] or 0
            pending = Invoice.objects.filter(
                is_deleted=False, status__in=['PENDING', 'PARTIAL', 'OVERDUE'],
            ).count()
            overdue = Invoice.objects.filter(is_deleted=False, status='OVERDUE').count()
            return Response({
                'finance_mode': True,
                'total_collected': float(total_collected),
                'outstanding': float(total_invoiced - total_collected),
                'pending_invoices': pending,
                'overdue_invoices': overdue,
            })

        if role not in ADMIN_ROLES and role != 'SUPER_ADMIN':
            return Response({'detail': 'Not available for this role.'}, status=403)

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


class PortalContextView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.core.permissions import IsPortalUser
        if not IsPortalUser().has_permission(request, self):
            return Response({'detail': 'Portal access only.'}, status=403)

        student = Student.objects.filter(user=request.user, is_deleted=False).first()
        if student:
            return Response({
                'role': 'STUDENT',
                'portal_label': 'Student / Parent',
                'students': [{
                    'id': student.id,
                    'name': f'{student.first_name} {student.last_name}'.strip(),
                    'grade_level': student.grade_level,
                    'section': student.section,
                }],
            })

        from apps.parents.models import ParentProfile
        profile = ParentProfile.objects.filter(user=request.user).prefetch_related('students').first()
        if not profile:
            return Response({'detail': 'No student or parent profile linked.'}, status=404)
        children = profile.students.filter(is_deleted=False)
        return Response({
            'role': 'PARENT',
            'portal_label': 'Student / Parent',
            'students': [{
                'id': s.id,
                'name': f'{s.first_name} {s.last_name}'.strip(),
                'grade_level': s.grade_level,
                'section': s.section,
            } for s in children],
        })


def _serialize_activity(row, *, full=False):
    data = {
        'id': row.id,
        'created_at': row.created_at.isoformat(),
        'actor_name': row.actor_name,
        'actor_role': row.actor_role,
        'actor_email': row.actor_email,
        'module': row.module,
        'action': row.action,
        'summary': row.summary,
        'detail_preview': (row.detail[:160] + '…') if len(row.detail or '') > 160 else (row.detail or ''),
        'http_method': row.http_method,
        'path': row.path,
    }
    if full:
        data['detail'] = row.detail
        data['metadata'] = row.metadata or {}
    return data


class DashboardActivityListView(APIView):
    """Admin-only feed of finance, teacher, and portal user actions."""
    permission_classes = [IsSchoolAdmin]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        qs = DashboardActivity.objects.exclude(module='auth').order_by('-created_at')
        role = request.query_params.get('role')
        if role:
            qs = qs.filter(actor_role=role.upper())
        module = request.query_params.get('module')
        if module:
            qs = qs.filter(module=module)
        search = (request.query_params.get('search') or '').strip()
        if search:
            qs = qs.filter(
                Q(summary__icontains=search)
                | Q(detail__icontains=search)
                | Q(actor_name__icontains=search)
                | Q(actor_email__icontains=search),
            )
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request)
        results = [_serialize_activity(row) for row in page]
        return paginator.get_paginated_response(results)


class DashboardActivityDetailView(APIView):
    permission_classes = [IsSchoolAdmin]

    def get(self, request, activity_id):
        row = DashboardActivity.objects.exclude(module='auth').filter(pk=activity_id).first()
        if not row:
            return Response({'detail': 'Activity not found.'}, status=404)
        return Response(_serialize_activity(row, full=True))
