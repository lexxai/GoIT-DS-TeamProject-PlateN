from django.shortcuts import render

def main(request):
    # ваш код для обробки запиту тут
    return render(request, 'communications/main.html')  # або інша логіка відповідно до вашого проекту