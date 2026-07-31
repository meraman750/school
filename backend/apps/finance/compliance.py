import calendar
from datetime import date
from decimal import Decimal, InvalidOperation

from django.utils import timezone

from apps.teachers.models import TeacherSalaryInfo, TeacherSalaryPayment

from .models import StudentMonthlyFeeStatus, TeacherMonthlyPayrollStatus

SALARY_FIELD_NAMES = (
    'base_salary',
    'housing_allowance',
    'transport_allowance',
    'other_allowances',
    'tax_deduction',
    'pension_deduction',
    'other_deductions',
    'net_monthly_salary',
)


def _decimal_value(raw, field_name):
    if raw is None or raw == '':
        raise ValueError(f'{field_name.replace("_", " ").title()} is required.')
    try:
        value = Decimal(str(raw))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise ValueError(f'Invalid value for {field_name.replace("_", " ")}.') from exc
    if value < 0:
        raise ValueError(f'{field_name.replace("_", " ").title()} cannot be negative.')
    return value


def _payment_method_label(value):
    return dict(TeacherSalaryInfo.PaymentMethod.choices).get(value, value or '')


def _salary_breakdown_from_values(values):
    gross = (
        values['base_salary']
        + values['housing_allowance']
        + values['transport_allowance']
        + values['other_allowances']
    )
    total_deductions = (
        values['tax_deduction']
        + values['pension_deduction']
        + values['other_deductions']
    )
    computed_net = gross - total_deductions
    return {
        'base_salary': float(values['base_salary']),
        'housing_allowance': float(values['housing_allowance']),
        'transport_allowance': float(values['transport_allowance']),
        'other_allowances': float(values['other_allowances']),
        'gross_salary': float(gross),
        'tax_deduction': float(values['tax_deduction']),
        'pension_deduction': float(values['pension_deduction']),
        'other_deductions': float(values['other_deductions']),
        'total_deductions': float(total_deductions),
        'net_monthly_salary': float(values['net_monthly_salary']),
        'computed_net_salary': float(computed_net),
        'bank_name': values.get('bank_name', ''),
        'bank_account': values.get('bank_account', ''),
        'payment_method': values.get('payment_method', ''),
        'payment_method_label': _payment_method_label(values.get('payment_method', '')),
    }


def _teacher_salary_breakdown_dict(teacher):
    try:
        info = teacher.salary_info
    except TeacherSalaryInfo.DoesNotExist:
        return None

    values = {
        'base_salary': info.base_salary,
        'housing_allowance': info.housing_allowance,
        'transport_allowance': info.transport_allowance,
        'other_allowances': info.other_allowances,
        'tax_deduction': info.tax_deduction,
        'pension_deduction': info.pension_deduction,
        'other_deductions': info.other_deductions,
        'net_monthly_salary': info.net_monthly_salary,
        'bank_name': info.bank_name,
        'bank_account': info.bank_account,
        'payment_method': info.payment_method,
    }
    return _salary_breakdown_from_values(values)


def _payment_salary_breakdown_dict(payment):
    if not payment:
        return None
    values = {
        'base_salary': payment.basic_salary,
        'housing_allowance': payment.housing_allowance,
        'transport_allowance': payment.transport_allowance,
        'other_allowances': payment.other_allowances,
        'tax_deduction': payment.tax_deduction,
        'pension_deduction': payment.pension_deduction,
        'other_deductions': payment.other_deductions,
        'net_monthly_salary': payment.net_salary,
        'bank_name': payment.bank_name,
        'bank_account': payment.bank_account,
        'payment_method': payment.payment_method,
    }
    return _salary_breakdown_from_values(values)


def _teacher_payment_for_month(teacher, year, month):
    return TeacherSalaryPayment.objects.filter(
        teacher=teacher,
        pay_period_start__year=year,
        pay_period_start__month=month,
        is_deleted=False,
        status=TeacherSalaryPayment.Status.PAID,
    ).first()


def _parse_teacher_salary_data(raw_data):
    if not raw_data:
        raise ValueError('Salary breakdown is required.')

    values = {}
    for field in SALARY_FIELD_NAMES:
        values[field] = _decimal_value(raw_data.get(field), field)

    gross = (
        values['base_salary']
        + values['housing_allowance']
        + values['transport_allowance']
        + values['other_allowances']
    )
    total_deductions = (
        values['tax_deduction']
        + values['pension_deduction']
        + values['other_deductions']
    )
    computed_net = gross - total_deductions
    if values['net_monthly_salary'] != computed_net:
        raise ValueError('Net salary must equal gross salary minus total deductions.')

    values['bank_name'] = (raw_data.get('bank_name') or '').strip()
    values['bank_account'] = (raw_data.get('bank_account') or '').strip()
    values['payment_method'] = (raw_data.get('payment_method') or '').strip()
    values['allowances_total'] = (
        values['housing_allowance']
        + values['transport_allowance']
        + values['other_allowances']
    )
    values['deductions_total'] = total_deductions
    values['gross_salary'] = gross
    return values


def _mark_is_valid_paid(mark, require_payer=False):
    if not mark or not mark.is_paid:
        return False
    if not (
        mark.ticket_receipt
        and mark.approved_by_name
        and mark.beneficiary_name
        and mark.recorded_at
    ):
        return False
    if require_payer and not mark.payer_party_name:
        return False
    return True


def _normalize_invalid_mark(mark, user):
    if not mark or not mark.is_paid or _mark_is_valid_paid(mark):
        return mark
    mark.is_paid = False
    _clear_compliance_mark_fields(mark)
    if user:
        mark.updated_by = user
    mark.save()
    return mark


def student_month_paid(student, year, month):
    mark = StudentMonthlyFeeStatus.objects.filter(
        is_deleted=False,
        student=student,
        year=year,
        month=month,
    ).first()
    return _mark_is_valid_paid(mark, require_payer=True)


def teacher_month_paid(teacher, year, month):
    mark = TeacherMonthlyPayrollStatus.objects.filter(
        is_deleted=False,
        teacher=teacher,
        year=year,
        month=month,
    ).first()
    return _mark_is_valid_paid(mark, require_payer=False)


def serialize_compliance_mark(mark, require_payer=False, salary_breakdown=None):
    if not _mark_is_valid_paid(mark, require_payer=require_payer):
        return None
    ticket_url = mark.ticket_receipt.url if mark.ticket_receipt else None
    data = {
        'approved_by_name': mark.approved_by_name,
        'beneficiary_name': mark.beneficiary_name,
        'payer_party_name': mark.payer_party_name,
        'payment_method': mark.payment_method,
        'notes': mark.notes,
        'ticket_receipt_url': ticket_url,
        'recorded_at': mark.recorded_at.isoformat() if mark.recorded_at else None,
    }
    if salary_breakdown:
        data['salary_breakdown'] = salary_breakdown
    return data


def _clear_compliance_mark_fields(mark):
    mark.approved_by_name = ''
    mark.beneficiary_name = ''
    mark.payer_party_name = ''
    mark.payment_method = ''
    mark.transaction_reference = ''
    mark.notes = ''
    mark.ticket_receipt = None
    mark.recorded_at = None


def _apply_compliance_payment_fields(mark, payment_data):
    mark.approved_by_name = payment_data['approved_by_name']
    mark.beneficiary_name = payment_data['beneficiary_name']
    mark.payer_party_name = payment_data.get('payer_party_name', '')
    mark.payment_method = payment_data.get('payment_method', '')
    mark.notes = payment_data.get('notes', '')
    ticket = payment_data.get('ticket_receipt')
    if ticket:
        mark.ticket_receipt = ticket
    mark.recorded_at = timezone.now()


def _validate_payment_data(payment_data, require_payer=False, existing_mark=None):
    if not payment_data:
        raise ValueError('Payment confirmation details are required.')
    if not payment_data.get('approved_by_name'):
        raise ValueError('Approver name is required.')
    if not payment_data.get('beneficiary_name'):
        raise ValueError('Beneficiary name is required.')
    if require_payer and not payment_data.get('payer_party_name'):
        raise ValueError('Payer name is required.')
    has_ticket = payment_data.get('ticket_receipt') or (
        existing_mark and existing_mark.ticket_receipt
    )
    if not has_ticket:
        raise ValueError('Ticket or receipt image is required.')


def set_student_month_paid(student, year, month, is_paid, user, payment_data=None):
    mark, created = StudentMonthlyFeeStatus.objects.get_or_create(
        student=student,
        year=year,
        month=month,
        defaults={
            'is_paid': False,
            'created_by': user,
            'updated_by': user,
        },
    )
    if is_paid:
        _validate_payment_data(payment_data, require_payer=True, existing_mark=mark)
        _apply_compliance_payment_fields(mark, payment_data)
        mark.is_paid = True
    else:
        mark.is_paid = False
        _clear_compliance_mark_fields(mark)
    mark.updated_by = user
    mark.save()
    return mark


def sync_teacher_salary_payment(teacher, year, month, is_paid, user, payment_data=None):
    """Mirror finance payroll marks onto teacher salary payment records."""
    existing_qs = TeacherSalaryPayment.all_objects.filter(
        teacher=teacher,
        pay_period_start__year=year,
        pay_period_start__month=month,
    )

    if not is_paid:
        for payment in existing_qs.filter(is_deleted=False):
            payment.is_deleted = True
            payment.updated_by = user
            payment.save(update_fields=['is_deleted', 'updated_by', 'updated_at'])
        return None

    salary = payment_data.get('salary') if payment_data else None
    if not salary:
        raise ValueError('Salary breakdown is required.')

    last_day = calendar.monthrange(year, month)[1]
    pay_start = date(year, month, 1)
    pay_end = date(year, month, last_day)
    recorded_at = payment_data.get('recorded_at') if payment_data else timezone.now()
    if recorded_at and hasattr(recorded_at, 'date'):
        paid_on = recorded_at.date()
    else:
        paid_on = timezone.now().date()

    payment = existing_qs.first()
    common_fields = {
        'is_deleted': False,
        'pay_period_start': pay_start,
        'pay_period_end': pay_end,
        'basic_salary': salary['base_salary'],
        'housing_allowance': salary['housing_allowance'],
        'transport_allowance': salary['transport_allowance'],
        'other_allowances': salary['other_allowances'],
        'allowances': salary['allowances_total'],
        'tax_deduction': salary['tax_deduction'],
        'pension_deduction': salary['pension_deduction'],
        'other_deductions': salary['other_deductions'],
        'deductions': salary['deductions_total'],
        'net_salary': salary['net_monthly_salary'],
        'bank_name': salary.get('bank_name', ''),
        'bank_account': salary.get('bank_account', ''),
        'status': TeacherSalaryPayment.Status.PAID,
        'payment_date': paid_on,
        'updated_by': user,
        'approved_by_name': payment_data.get('approved_by_name', ''),
        'beneficiary_name': payment_data.get('beneficiary_name', ''),
        'payment_method': payment_data.get('payment_method', '') or salary.get('payment_method', ''),
        'recorded_at': recorded_at if recorded_at else timezone.now(),
        'notes': payment_data.get('notes', ''),
    }
    ticket = payment_data.get('ticket_receipt')
    if ticket:
        common_fields['ticket_receipt'] = ticket
    elif payment and payment.ticket_receipt:
        common_fields['ticket_receipt'] = payment.ticket_receipt

    if payment:
        for field, value in common_fields.items():
            setattr(payment, field, value)
        payment.save()
        return payment

    return TeacherSalaryPayment.objects.create(
        teacher=teacher,
        created_by=user,
        **common_fields,
    )


def set_teacher_month_paid(teacher, year, month, is_paid, user, payment_data=None):
    mark, created = TeacherMonthlyPayrollStatus.objects.get_or_create(
        teacher=teacher,
        year=year,
        month=month,
        defaults={
            'is_paid': False,
            'created_by': user,
            'updated_by': user,
        },
    )
    if is_paid:
        salary_raw = payment_data.get('salary_raw') if payment_data else None
        if not salary_raw:
            raise ValueError('Salary breakdown is required.')
        salary_raw = {
            **salary_raw,
            'payment_method': payment_data.get('payment_method', salary_raw.get('payment_method', '')),
        }
        payment_data['salary'] = _parse_teacher_salary_data(salary_raw)
        _validate_payment_data(payment_data, require_payer=False, existing_mark=mark)
        _apply_compliance_payment_fields(mark, payment_data)
        payment_data['recorded_at'] = mark.recorded_at
        mark.is_paid = True
    else:
        mark.is_paid = False
        _clear_compliance_mark_fields(mark)
    mark.updated_by = user
    mark.save()
    sync_teacher_salary_payment(teacher, year, month, is_paid, user, payment_data)
    return mark


def build_student_compliance_row(student, year, user=None):
    marks = {
        mark.month: mark
        for mark in StudentMonthlyFeeStatus.objects.filter(
            student=student,
            year=year,
            is_deleted=False,
        )
    }
    months = {}
    month_details = {}
    for month in range(1, 13):
        mark = marks.get(month)
        if mark and user:
            mark = _normalize_invalid_mark(mark, user)
        paid = _mark_is_valid_paid(mark, require_payer=True)
        months[str(month)] = paid
        if paid:
            month_details[str(month)] = serialize_compliance_mark(mark, require_payer=True)
    return {
        'student_id': student.id,
        'admission_number': student.admission_number,
        'name': f'{student.first_name} {student.last_name}'.strip(),
        'grade_level': student.grade_level,
        'section': student.section,
        'months': months,
        'month_details': month_details,
        'all_paid': all(months.values()),
    }


def build_teacher_compliance_row(teacher, year, user=None):
    marks = {
        mark.month: mark
        for mark in TeacherMonthlyPayrollStatus.objects.filter(
            teacher=teacher,
            year=year,
            is_deleted=False,
        )
    }
    salary_template = _teacher_salary_breakdown_dict(teacher)
    months = {}
    month_details = {}
    for month in range(1, 13):
        mark = marks.get(month)
        if mark and user:
            mark = _normalize_invalid_mark(mark, user)
            if not _mark_is_valid_paid(mark):
                sync_teacher_salary_payment(teacher, year, month, False, user)
        paid = _mark_is_valid_paid(mark, require_payer=False)
        months[str(month)] = paid
        if paid:
            payment = _teacher_payment_for_month(teacher, year, month)
            saved_breakdown = _payment_salary_breakdown_dict(payment) or salary_template
            month_details[str(month)] = serialize_compliance_mark(
                mark,
                salary_breakdown=saved_breakdown,
            )
    return {
        'teacher_id': teacher.id,
        'employee_id': teacher.employee_id,
        'name': f'{teacher.first_name} {teacher.last_name}'.strip(),
        'salary_breakdown': salary_template,
        'months': months,
        'month_details': month_details,
        'all_paid': all(months.values()),
    }
