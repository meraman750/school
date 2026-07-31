from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='blogpost',
            name='category',
            field=models.CharField(
                choices=[('NEWS', 'News'), ('ANNOUNCEMENT', 'Announcement')],
                default='NEWS',
                max_length=20,
            ),
        ),
    ]
