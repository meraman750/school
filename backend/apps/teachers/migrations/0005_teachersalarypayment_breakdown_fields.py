from decimal import Decimal

from django.db import migrations, models


def backfill_payment_breakdown(apps, schema_editor):
    TeacherSalaryPayment = apps.get_model('teachers', 'TeacherSalaryPayment')
    TeacherSalaryInfo = apps.get_model('teachers', 'TeacherSalaryInfo')

    for payment in TeacherSalaryPayment.objects.filter(is_deleted=False):
        try:
            info = TeacherSalaryInfo.objects.get(teacher_id=payment.teacher_id, is_deleted=False)
        except TeacherSalaryInfo.DoesNotExist:
            continue
        payment.housing_allowance = info.housing_allowance
        payment.transport_allowance = info.transport_allowance
        payment.other_allowances = info.other_allowances
        payment.tax_deduction = info.tax_deduction
        payment.pension_deduction = info.pension_deduction
        payment.other_deductions = info.other_deductions
        payment.bank_name = info.bank_name
        payment.bank_account = info.bank_account
        if not payment.payment_method:
            payment.payment_method = info.payment_method
        if payment.allowances and payment.allowances != (
            info.housing_allowance + info.transport_allowance + info.other_allowances
        ):
            pass
        elif not payment.housing_allowance and not payment.transport_allowance and not payment.other_allowances:
            payment.housing_allowance = info.housing_allowance
            payment.transport_allowance = info.transport_allowance
            payment.other_allowances = info.other_allowances
        if payment.deductions and not payment.tax_deduction and not payment.pension_deduction:
            payment.tax_deduction = info.tax_deduction
            payment.pension_deduction = info.pension_deduction
            payment.other_deductions = info.other_deductions
        if payment.basic_salary == Decimal('0') and info.base_salary:
            payment.basic_salary = info.base_salary
        gross = (
            payment.basic_salary
            + payment.housing_allowance
            + payment.transport_allowance
            + payment.other_allowances
        )
        total_deductions = (
            payment.tax_deduction
            + payment.pension_deduction
            + payment.other_deductions
        )
        if payment.net_salary == Decimal('0'):
            payment.net_salary = gross - total_deductions
        payment.allowances = (
            payment.housing_allowance
            + payment.transport_allowance
            + payment.other_allowances
        )
        payment.deductions = total_deductions
        payment.save()


class Migration(migrations.Migration):

    dependencies = [
        ('teachers', '0004_teachersalarypayment_confirmation_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='teachersalarypayment',
            name='housing_allowance',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name='teachersalarypayment',
            name='transport_allowance',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name='teachersalarypayment',
            name='other_allowances',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name='teachersalarypayment',
            name='tax_deduction',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name='teachersalarypayment',
            name='pension_deduction',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name='teachersalarypayment',
            name='other_deductions',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name='teachersalarypayment',
            name='bank_name',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='teachersalarypayment',
            name='bank_account',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.RunPython(backfill_payment_breakdown, migrations.RunPython.noop),
    ]
