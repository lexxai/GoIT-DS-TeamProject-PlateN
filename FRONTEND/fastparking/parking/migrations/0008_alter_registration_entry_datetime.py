# Generated by Django 5.0.4 on 2024-05-12 18:46

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("parking", "0007_remove_parkingspace_registration_id_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="registration",
            name="entry_datetime",
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
