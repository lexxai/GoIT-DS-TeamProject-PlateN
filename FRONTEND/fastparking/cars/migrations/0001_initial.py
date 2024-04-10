# Generated by Django 5.0.4 on 2024-04-10 09:20

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Car',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('photo_car', models.ImageField(blank=True, null=True, upload_to='car_photos/')),
                ('car_number', models.CharField(max_length=20)),
                ('predict', models.FloatField(blank=True, null=True)),
                ('blocked', models.BooleanField(default=False)),
                ('pay_pass', models.BooleanField(default=False)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
