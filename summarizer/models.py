from django.conf import settings
from django.db import models


class NoteSummary(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="note_summaries",
    )
    title = models.CharField(max_length=180)
    original_text = models.TextField()
    summary = models.TextField()
    uploaded_file = models.FileField(upload_to="notes/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.user}"


class LoginActivity(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="login_activities",
    )
    email = models.EmailField()
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    logged_in_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-logged_in_at"]
        verbose_name_plural = "login activities"

    def __str__(self):
        return f"{self.email} logged in at {self.logged_in_at:%Y-%m-%d %H:%M}"
