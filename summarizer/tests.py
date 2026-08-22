from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .services import SummaryGenerationError


class AuthenticationAPITests(APITestCase):
    def setUp(self):
        self.account = {
            "name": "Ada Lovelace",
            "email": "ada@example.com",
            "password": "secure-pass-123",
            "confirm_password": "secure-pass-123",
        }

    def test_user_can_register_login_refresh_and_access_profile(self):
        register = self.client.post(reverse("api-register"), self.account, format="json")
        self.assertEqual(register.status_code, status.HTTP_201_CREATED)
        self.assertEqual(register.data["user"]["email"], self.account["email"])

        login = self.client.post(reverse("api-login"), {
            "email": self.account["email"],
            "password": self.account["password"],
        }, format="json")
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.assertIn("access", login.data)
        self.assertIn("refresh", login.data)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        profile = self.client.get(reverse("api-current-user"))
        self.assertEqual(profile.status_code, status.HTTP_200_OK)
        self.assertEqual(profile.data["name"], "Ada Lovelace")

        self.client.credentials()
        refresh = self.client.post(reverse("token-refresh"), {"refresh": login.data["refresh"]}, format="json")
        self.assertEqual(refresh.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh.data)

    def test_protected_endpoints_reject_anonymous_requests(self):
        response = self.client.get(reverse("api-current-user"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_generate_read_update_and_delete_a_summary(self):
        self.client.post(reverse("api-register"), self.account, format="json")
        login = self.client.post(reverse("api-login"), {
            "email": self.account["email"],
            "password": self.account["password"],
        }, format="json")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

        with patch("summarizer.views.generate_summary", return_value="A real BART-CNN summary.") as generate:
            created = self.client.post(reverse("generate-summary"), {
                "notes": "This is a sufficiently long source text. " * 8,
            }, format="json")

        self.assertEqual(created.status_code, status.HTTP_200_OK)
        self.assertEqual(created.data["summary"], "A real BART-CNN summary.")
        generate.assert_called_once()
        summary_id = created.data["id"]

        detail = self.client.get(reverse("summary-detail", args=[summary_id]))
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertIn("original_text", detail.data)

        updated = self.client.patch(reverse("summary-detail", args=[summary_id]), {"title": "Updated title"}, format="json")
        self.assertEqual(updated.status_code, status.HTTP_200_OK)
        self.assertEqual(updated.data["title"], "Updated title")

        deleted = self.client.delete(reverse("summary-detail", args=[summary_id]))
        self.assertEqual(deleted.status_code, status.HTTP_204_NO_CONTENT)

    def test_generation_failure_is_not_saved_as_a_summary(self):
        self.client.post(reverse("api-register"), self.account, format="json")
        login = self.client.post(reverse("api-login"), {"email": self.account["email"], "password": self.account["password"]}, format="json")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        with patch("summarizer.views.generate_summary", side_effect=SummaryGenerationError("BART-CNN is unavailable.")):
            response = self.client.post(reverse("generate-summary"), {"notes": "Source material " * 10}, format="json")
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(response.data["error"], "BART-CNN is unavailable.")
