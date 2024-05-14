from django import forms
from .models import Car, Log


# from .forms import MyCarForm

# class CarForm(forms.ModelForm):
#     class Meta:
#         model = Car
#         fields = ['car_number', 'predict', 'blocked', 'pay_pass']  # Перерахуйте всі поля, які ви хочете відображати у формі

#         widgets = {
#             'car_number': forms.TextInput(attrs={'class': 'form-control'}),
#             'photo_car': forms.FileInput(attrs={'class': 'form-control'}),
#             'predict': forms.NumberInput(attrs={'class': 'form-control'}),
#             'blocked': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
#             'pay_pass': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
#             # 'user': forms.Select(attrs={'class': 'form-select'})
#         }


class MyCarForm(forms.ModelForm):  # додано другий такий самий клас
    class Meta:
        model = Car
        fields = [
            "car_number",
            "predict",
            "blocked",
            "PayPass",
        ]  # Перерахуйте всі поля, які ви хочете відображати у формі

        widgets = {
            "car_number": forms.TextInput(attrs={"class": "form-control"}),
            "photo_car": forms.FileInput(attrs={"class": "form-control"}),
            "predict": forms.NumberInput(attrs={"class": "form-control"}),
            "blocked": forms.CheckboxInput(attrs={"class": "form-check-input"}),
            "pay_pass": forms.CheckboxInput(attrs={"class": "form-check-input"}),
            # 'user': forms.Select(attrs={'class': 'form-select'})
        }


class LogsForm(forms.ModelForm):  # додано другий такий самий клас
    class Meta:
        model = Log
        fields = [
            "number",
            "status",
            "comment",
            "location",
        ]

        widgets = {
            "number": forms.TextInput(
                attrs={"class": "form-control", "readonly": True, "disabled": True}
            ),
            "status": forms.TextInput(
                attrs={
                    "class": "form-control text-center",
                    "readonly": True,
                    "disabled": True,
                }
            ),
            "comment": forms.TextInput(attrs={"class": "form-control"}),
            "location": forms.TextInput(
                attrs={"class": "form-control", "required": False}
            ),
        }
