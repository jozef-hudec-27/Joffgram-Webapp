# Generated by Django 4.0.4 on 2022-05-01 10:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('private_chat', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='privatechatmessage',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to=''),
        ),
    ]
