from django.db import migrations, models
import django.db.models.deletion
from django.db.models import Q


class Migration(migrations.Migration):

    dependencies = [
        ('academics', '0006_annualscheduleattachment'),
    ]

    operations = [
        migrations.AddField(
            model_name='timetable',
            name='period_number',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='timetable',
            name='section',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='timetables',
                to='academics.section',
            ),
        ),
        migrations.AlterField(
            model_name='timetable',
            name='teacher',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='timetables',
                to='teachers.teacher',
            ),
        ),
        migrations.AddConstraint(
            model_name='timetable',
            constraint=models.UniqueConstraint(
                condition=Q(is_deleted=False) & Q(section__isnull=False),
                fields=('section', 'day_of_week', 'period_number'),
                name='unique_section_day_period',
            ),
        ),
    ]
