from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0002_studentmonthlyfeestatus_teachermonthlypayrollstatus'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentmonthlyfeestatus',
            name='approved_by_name',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='studentmonthlyfeestatus',
            name='beneficiary_name',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='studentmonthlyfeestatus',
            name='payer_party_name',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='studentmonthlyfeestatus',
            name='payment_method',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='studentmonthlyfeestatus',
            name='transaction_reference',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='studentmonthlyfeestatus',
            name='notes',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='studentmonthlyfeestatus',
            name='ticket_receipt',
            field=models.ImageField(blank=True, null=True, upload_to='finance/compliance-receipts/'),
        ),
        migrations.AddField(
            model_name='studentmonthlyfeestatus',
            name='recorded_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='teachermonthlypayrollstatus',
            name='approved_by_name',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='teachermonthlypayrollstatus',
            name='beneficiary_name',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='teachermonthlypayrollstatus',
            name='payer_party_name',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='teachermonthlypayrollstatus',
            name='payment_method',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='teachermonthlypayrollstatus',
            name='transaction_reference',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='teachermonthlypayrollstatus',
            name='notes',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='teachermonthlypayrollstatus',
            name='ticket_receipt',
            field=models.ImageField(blank=True, null=True, upload_to='finance/compliance-receipts/'),
        ),
        migrations.AddField(
            model_name='teachermonthlypayrollstatus',
            name='recorded_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
