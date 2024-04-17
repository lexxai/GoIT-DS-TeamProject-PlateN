from django.db import models
from cars.models import Car
from photos.models import Photo


class ParkingSpace(models.Model):
    number = models.CharField(max_length=10, unique=True)
    status = models.BooleanField(default=False)  # False - вільно, True - зайнято
    car_num = models.CharField(max_length=16, default='')


    def __str__(self):
        return self.number

class Registration(models.Model):
    parking = models.ForeignKey(ParkingSpace, on_delete=models.CASCADE)
    entry_datetime = models.DateTimeField(auto_now_add=True)
    car_number_in = models.CharField(max_length=16)
    tariff_in = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Змінено поле на DecimalField
    exit_datetime = models.DateTimeField(null=True, blank=True)
    invoice = models.CharField(max_length=255, null=True, blank=True)
    car_number_out = models.CharField(max_length=16, null=True, blank=True)
    photo_in = models.ForeignKey(
        Photo,
        on_delete=models.SET_NULL,
        related_name="registration_photo_in",
        null=True,
        blank=True,
    )
    photo_out = models.ForeignKey(
        Photo,
        on_delete=models.SET_NULL,
        related_name="registration_photo_out",
        null=True,
        blank=True,
    )
    car = models.ForeignKey(Car, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        if self.invoice:
            invoice_predict = self.invoice
        else:
            invoice_predict = "Calc..."  # calculate_current_invoice(self.id)
            # invoice_predict = finance_repo.calculate_current_invoice(self.id)
        e_date = self.entry_datetime.strftime("%Y-%m-%d %H:%M")
        return f"Registration ID: {self.id:06} - Parking Number: {self.parking.number} - Entry: {e_date} - Invoice*: {invoice_predict}"
    
    