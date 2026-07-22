import csv
import io
from datetime import date

from django.http import HttpResponse
from openpyxl import Workbook
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsStaffMember
from apps.students.models import Student
from apps.teachers.models import Teacher


class StudentReportView(APIView):
    permission_classes = [IsStaffMember]

    def get(self, request):
        export_format = request.query_params.get('format', 'json')
        students = Student.objects.all().values(
            'admission_number', 'first_name', 'last_name', 'gender',
            'status', 'enrollment_date', 'email', 'phone',
        )

        if export_format == 'csv':
            return self._export_csv(students, 'students_report.csv')
        if export_format == 'excel':
            return self._export_excel(students, 'Students Report')
        if export_format == 'pdf':
            return self._export_pdf(students, 'Students Report')

        return Response({'success': True, 'data': list(students)})

    def _export_csv(self, data, filename):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        if not data:
            return response
        writer = csv.DictWriter(response, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
        return response

    def _export_excel(self, data, title):
        wb = Workbook()
        ws = wb.active
        ws.title = title[:31]
        rows = list(data)
        if rows:
            ws.append(list(rows[0].keys()))
            for row in rows:
                ws.append(list(row.values()))
        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        response = HttpResponse(
            buffer.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = f'attachment; filename="{title.lower().replace(" ", "_")}.xlsx"'
        return response

    def _export_pdf(self, data, title):
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        p.setFont('Helvetica-Bold', 16)
        p.drawString(50, 750, title)
        p.setFont('Helvetica', 10)
        y = 720
        for item in data[:50]:
            line = ' | '.join(str(v) for v in item.values())
            p.drawString(50, y, line[:100])
            y -= 15
            if y < 50:
                p.showPage()
                y = 750
        p.save()
        buffer.seek(0)
        response = HttpResponse(buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{title.lower().replace(" ", "_")}.pdf"'
        return response


class TeacherReportView(APIView):
    permission_classes = [IsStaffMember]

    def get(self, request):
        export_format = request.query_params.get('format', 'json')
        teachers = Teacher.objects.all().values(
            'employee_id', 'first_name', 'last_name', 'email',
            'phone', 'status', 'hire_date', 'specialization',
        )
        view = StudentReportView()
        if export_format == 'csv':
            return view._export_csv(teachers, 'teachers_report.csv')
        if export_format == 'excel':
            return view._export_excel(teachers, 'Teachers Report')
        if export_format == 'pdf':
            return view._export_pdf(teachers, 'Teachers Report')
        return Response({'success': True, 'data': list(teachers)})
