from django.shortcuts import render

def index(request):
    return render(request,'summarizer/index.html')

def login_view(request):
    return render(request,'summarizer/login.html')
def register_view(request):
    return render(request,'summarizer/register.html')
def upload_view(request):
    return render(request,'summarizer/upload.html')