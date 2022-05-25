# Generated by Django 4.0.4 on 2022-05-07 05:18

from django.db import migrations, models
import private_chat.models


class Migration(migrations.Migration):

    dependencies = [
        ('private_chat', '0003_alter_privatechatmessage_image'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='privatechatmessage',
            name='image',
        ),
        migrations.AddField(
            model_name='privatechatmessage',
            name='file',
            field=models.FileField(blank=True, max_length=255, null=True, upload_to=private_chat.models.get_message_file_filepath),
        ),
    ]
