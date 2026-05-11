from django.urls import path
from . import views

urlpatterns = [
    path('',views.index,name='index'),
    path('login/',views.login_view,name='login'),
    path('register/',views.register_view,name='register'),
    path('upload/',views.upload_view,name='upload'),
]