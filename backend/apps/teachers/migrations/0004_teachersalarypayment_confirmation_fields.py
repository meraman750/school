from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('teachers', '0003_teachersalaryinfo_teachersalarypayment'),
    ]

    operations = [
        migrations.AddField(
            model_name='teachersalarypayment',
            name='approved_by_name',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='teachersalarypayment',
            name='beneficiary_name',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='teachersalarypayment',
            name='payment_method',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='teachersalarypayment',
            name='ticket_receipt',
            field=models.ImageField(blank=True, null=True, upload_to='finance/payroll-receipts/'),
        ),
        migrations.AddField(
            model_name='teachersalarypayment',
            name='recorded_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
