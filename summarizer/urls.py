from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views


urlpatterns = [

    path(
        "",
        views.index,
        name="index",
    ),

    path(
        "login/",
        views.login_view,
        name="login",
    ),

    path(
        "register/",
        views.register_view,
        name="register",
    ),

    path(
        "logout/",
        views.logout_view,
        name="logout",
    ),

    path(
        "upload/",
        views.upload_view,
        name="upload",
    ),

    path(
        "dashboard/",
        views.dashboard_view,
        name="dashboard",
    ),

    path(
        "result/",
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

    path("api/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),

    path("api/me/", views.current_user_api, name="api-current-user"),
    path("api/password/forgot/", views.forgot_password_api, name="forgot-password"),
    path("api/password/verify-otp/", views.verify_otp_api, name="verify-otp"),
    path("api/password/reset/", views.reset_password_api, name="reset-password"),
    path("api/password/change/", views.change_password_api, name="change-password"),

    path(
        "generate-summary/",
        views.generate_summary_api,
        name="generate-summary",
    ),

    path(
        "summaries/",
        views.summaries_api,
        name="summaries",
    ),

    path(
        "summaries/<int:summary_id>/delete/",
        views.delete_summary_api,
        name="delete-summary",
    ),

    path("summaries/<int:summary_id>/", views.summary_detail_api, name="summary-detail"),
    path("summaries/<int:summary_id>/key-points/", views.key_points_api, name="summary-key-points"),
]
