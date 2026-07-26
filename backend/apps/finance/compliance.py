from apps.teachers.models import TeacherSalaryPayment

from .models import Invoice, Payment, StudentMonthlyFeeStatus, TeacherMonthlyPayrollStatus


def _auto_student_month_paid(student, year, month):
    if Invoice.objects.filter(
        is_deleted=False,
        student=student,
        issue_date__year=year,
        issue_date__month=month,
        status__in=['PAID', 'PARTIAL'],
    ).exists():
        return True
    return Payment.objects.filter(
        is_deleted=False,
        status='COMPLETED',
        invoice__student=student,
        payment_date__year=year,
        payment_date__month=month,
    ).exists()


def _auto_teacher_month_paid(teacher, year, month):
    return TeacherSalaryPayment.objects.filter(
        is_deleted=False,
        teacher=teacher,
        status='PAID',
        pay_period_start__year=year,
        pay_period_start__month=month,
    ).exists()


def student_month_paid(student, year, month):
    mark = StudentMonthlyFeeStatus.objects.filter(
        is_deleted=False,
        student=student,
        year=year,
        month=month,
    ).first()
    if mark is not None:
        return mark.is_paid
    return _auto_student_month_paid(student, year, month)


def teacher_month_paid(teacher, year, month):
    mark = TeacherMonthlyPayrollStatus.objects.filter(
        is_deleted=False,
        teacher=teacher,
        year=year,
        month=month,
    ).first()
    if mark is not None:
        return mark.is_paid
    return _auto_teacher_month_paid(teacher, year, month)


def set_student_month_paid(student, year, month, is_paid, user):
    mark, created = StudentMonthlyFeeStatus.objects.get_or_create(
        student=student,
        year=year,
        month=month,
        defaults={
            'is_paid': is_paid,
            'created_by': user,
            'updated_by': user,
        },
    )
    if not created:
        mark.is_paid = is_paid
        mark.updated_by = user
        mark.save(update_fields=['is_paid', 'updated_by', 'updated_at'])
    return mark


def set_teacher_month_paid(teacher, year, month, is_paid, user):
    mark, created = TeacherMonthlyPayrollStatus.objects.get_or_create(
        teacher=teacher,
        year=year,
        month=month,
        defaults={
            'is_paid': is_paid,
            'created_by': user,
            'updated_by': user,
        },
    )
    if not created:
        mark.is_paid = is_paid
        mark.updated_by = user
        mark.save(update_fields=['is_paid', 'updated_by', 'updated_at'])
    return mark


def build_student_compliance_row(student, year):
    months = {}
    for month in range(1, 13):
        months[str(month)] = student_month_paid(student, year, month)
    return {
        'student_id': student.id,
        'admission_number': student.admission_number,
        'name': f'{student.first_name} {student.last_name}'.strip(),
        'grade_level': student.grade_level,
        'section': student.section,
        'months': months,
        'all_paid': all(months.values()),
    }


def build_teacher_compliance_row(teacher, year):
    months = {}
    for month in range(1, 13):
        months[str(month)] = teacher_month_paid(teacher, year, month)
    return {
        'teacher_id': teacher.id,
        'employee_id': teacher.employee_id,
        'name': f'{teacher.first_name} {teacher.last_name}'.strip(),
        'months': months,
        'all_paid': all(months.values()),
    }
