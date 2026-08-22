from django.contrib import admin

from .models import LoginActivity, NoteSummary


@admin.register(NoteSummary)
class NoteSummaryAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "created_at")
    search_fields = ("title", "original_text", "summary", "user__username", "user__email")
    list_filter = ("created_at",)


@admin.register(LoginActivity)
class LoginActivityAdmin(admin.ModelAdmin):
    list_display = ("email", "user", "ip_address", "logged_in_at")
    search_fields = ("email", "user__first_name", "user__email")
    list_filter = ("logged_in_at",)
