from django.urls import path

from . import views


urlpatterns = [
    path("", views.index, name="index"),

    path("login/", views.login_view, name="login"),
    path("register/", views.register_view, name="register"),
    path("logout/", views.logout_view, name="logout"),

    path("upload/", views.upload_view, name="upload"),
    path("dashboard/", views.dashboard_view, name="dashboard"),
    path(
        "result/<int:summary_id>/",
        views.result_view,
        name="result",
    ),

    path(
        "api/register/",
        views.RegisterAPIView.as_view(),
        name="api-register",
    ),

    path(
        "api/login/",
        views.LoginAPIView.as_view(),
        name="api-login",
    ),

    path(
        "api/protected/",
        views.ProtectedAPIView.as_view(),
        name="api-protected",
    ),
]