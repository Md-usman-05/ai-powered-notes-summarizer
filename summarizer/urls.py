from django.urls import path
from . import views

urlpatterns = [
    path('',views.index,name='index'),
    path('api/register/',views.RegisterAPIView.as_view(),name='api_register'),
    path('api/login/',views.LoginAPIView.as_view(),name='api_login'),
    path('login/',views.login_view,name='login'),
    path('logout/',views.logout_view,name='logout'),
    path('register/',views.register_view,name='register'),
    path('upload/',views.upload_view,name='upload'),
    path('dashboard/',views.dashboard_view,name='dashboard'),
    path('summary/<int:summary_id>/',views.result_view,name='result'),
]
