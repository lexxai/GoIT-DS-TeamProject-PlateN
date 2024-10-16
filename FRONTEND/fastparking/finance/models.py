from datetime import datetime
from django.db import models
from django.urls import reverse
from parking.models import Registration

end_date_default = "2999-12-31 23:59:59"


class Tariff(models.Model):
    description = models.CharField(max_length=255)
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(
        default=datetime.strptime(end_date_default, "%Y-%m-%d %H:%M:%S")
    )

    def __str__(self):
        return f"{self.description}: {self.price_per_hour}"

    def get_absolute_url(self):
        return reverse("tariff-detail", kwargs={"pk": self.pk})


class Payment(models.Model):
    # user_id = models.IntegerField(blank=True, null=True)  # ID користувача, який здійснив оплату (не обов'язкове)
    registration_id = models.ForeignKey(
        Registration, on_delete=models.SET_NULL, null=True, blank=True
    )  # ID реєстрації, за яку здійснюється оплата
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    datetime = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.id} on {self.datetime} for {self.registration_id} by {self.amount}"

    def get_absolute_url(self):
        return reverse("post", kwargs={"post_slug": self.id})
