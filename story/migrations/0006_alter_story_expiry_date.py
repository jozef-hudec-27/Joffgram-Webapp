# Generated by Django 4.0.4 on 2022-05-21 16:56

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('story', '0005_alter_story_expiry_date_delete_storycomment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='story',
            name='expiry_date',
            field=models.DateTimeField(default=datetime.datetime(2022, 5, 22, 16, 56, 58, 251966, tzinfo=utc)),
        ),
    ]
