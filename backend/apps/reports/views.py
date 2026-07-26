import io
from collections import OrderedDict
from decimal import Decimal

from django.http import HttpResponse
from openpyxl import Workbook
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsStaffMember
from apps.core.teacher_scope import teacher_can_access_class
from apps.students.models import Student, StudentGradeReport


class ClassStudentMarksReportView(APIView):
    """Export class marks: dynamic subject columns, sum, average, rank."""
    permission_classes = [IsStaffMember]

    def get(self, request):
        export_format = request.query_params.get('export_as', 'excel')
        grade_level = request.query_params.get('grade_level')
        section = (request.query_params.get('section') or '').strip()
        academic_year = request.query_params.get('academic_year')
        quarter = request.query_params.get('quarter')

        missing = [
            name for name, val in (
                ('grade_level', grade_level),
                ('section', section),
                ('academic_year', academic_year),
                ('quarter', quarter),
            ) if not val
        ]
        if missing:
            return Response(
                {'detail': f"Required query params: {', '.join(missing)}."},
                status=400,
            )

        try:
            grade_level = int(grade_level)
            academic_year = int(academic_year)
            quarter = int(quarter)
        except ValueError:
            return Response({'detail': 'grade_level, academic_year, and quarter must be numbers.'}, status=400)

        if not teacher_can_access_class(request.user, grade_level, section):
            return Response({'detail': 'You are not assigned to this class.'}, status=403)

        students = Student.objects.filter(
            grade_level=grade_level,
            section=section,
            is_deleted=False,
        ).order_by('last_name', 'first_name')

        reports = StudentGradeReport.objects.filter(
            academic_year_id=academic_year,
            grade_level=grade_level,
            quarter=quarter,
            student__in=students,
        ).prefetch_related('entries__subject', 'student')

        report_by_student = {r.student_id: r for r in reports}

        subject_names = OrderedDict()
        for report in reports:
            for entry in report.entries.all():
                name = entry.subject.name
                subject_names[name] = True
        subject_columns = list(subject_names.keys())

        rows = []
        for student in students:
            report = report_by_student.get(student.id)
            scores_by_subject = {}
            total = Decimal('0')
            count = 0
            if report:
                for entry in report.entries.all():
                    scores_by_subject[entry.subject.name] = float(entry.score)
                    total += entry.score
                    count += 1
            average = float(report.overall_average) if report else None
            rank = report.class_rank if report else None
            row = {
                'student_name': f'{student.first_name} {student.last_name}'.strip(),
                'admission_number': student.admission_number or '',
                'scores': scores_by_subject,
                'sum': float(total) if count else None,
                'average': average,
                'rank': rank,
            }
            rows.append(row)

        if export_format == 'json':
            return Response({
                'grade_level': grade_level,
                'section': section,
                'academic_year': academic_year,
                'quarter': quarter,
                'subjects': subject_columns,
                'students': rows,
            })

        if export_format != 'excel':
            return Response({'detail': 'Supported formats: excel, json.'}, status=400)

        wb = Workbook()
        ws = wb.active
        ws.title = f'G{grade_level}{section}'[:31]
        header = ['Student Name', 'Admission #', *subject_columns, 'Sum', 'Average', 'Rank']
        ws.append(header)
        for row in rows:
            line = [
                row['student_name'],
                row['admission_number'],
            ]
            for subj in subject_columns:
                val = row['scores'].get(subj)
                line.append(val if val is not None else '')
            line.append(row['sum'] if row['sum'] is not None else '')
            line.append(row['average'] if row['average'] is not None else '')
            line.append(row['rank'] if row['rank'] is not None else '')
            ws.append(line)

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        filename = f'grade_{grade_level}_section_{section}_report.xlsx'
        response = HttpResponse(
            buffer.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
