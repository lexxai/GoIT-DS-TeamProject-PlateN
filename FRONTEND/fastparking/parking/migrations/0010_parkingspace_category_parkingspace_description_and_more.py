# Generated by Django 5.0.6 on 2024-05-27 16:28

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("parking", "0009_alter_registration_tariff_in"),
    ]

    operations = [
        migrations.AddField(
            model_name="parkingspace",
            name="category",
            field=models.SmallIntegerField(
                blank=True,
                help_text="The smallest number is filled in first",
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="parkingspace",
            name="description",
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
        migrations.AlterField(
            model_name="parkingspace",
            name="car_num",
            field=models.CharField(blank=True, max_length=16, null=True),
        ),
        migrations.AlterField(
            model_name="parkingspace",
            name="status",
            field=models.BooleanField(default=False, help_text="False is free"),
        ),
    ]
