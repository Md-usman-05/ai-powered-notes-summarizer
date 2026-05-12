from django.contrib import messages
from django.shortcuts import get_object_or_404, redirect, render
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .auth import REFRESH_TOKEN_COOKIE_NAME, TOKEN_COOKIE_NAME, get_user_from_request, jwt_login_required
from .models import LoginActivity, NoteSummary
from .serializers import LoginSerializer, RegisterSerializer, jwt_token_pair_for_user
from .services import summarize_notes


def _wants_html(request):
    return "text/html" in request.headers.get("Accept", "")


def _set_jwt_cookies(response, tokens):
    response.set_cookie(
        TOKEN_COOKIE_NAME,
        tokens["access"],
        httponly=True,
        samesite="Lax",
        max_age=60 * 5,
    )
    response.set_cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        tokens["refresh"],
        httponly=True,
        samesite="Lax",
        max_age=60 * 60 * 24,
    )
    return response


def index(request):
    user = get_user_from_request(request)
    return render(request, "summarizer/index.html", {"jwt_user": user})


def login_view(request):
    return render(request, "summarizer/login.html")


def register_view(request):
    return render(request, "summarizer/register.html")


def logout_view(request):
    response = redirect("index")
    response.delete_cookie(TOKEN_COOKIE_NAME)
    response.delete_cookie(REFRESH_TOKEN_COOKIE_NAME)
    return response


def _get_client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def _first_serializer_error(serializer):
    errors = serializer.errors
    if isinstance(errors, dict):
        first_value = next(iter(errors.values()))
        if isinstance(first_value, list):
            return str(first_value[0])
        return str(first_value)
    if isinstance(errors, list) and errors:
        return str(errors[0])
    return "Please check your input and try again."


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            if _wants_html(request):
                messages.error(request, _first_serializer_error(serializer))
                return redirect("register")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        if _wants_html(request):
            messages.success(request, "Account created successfully. Please login with your email and password.")
            return redirect("login")

        tokens = jwt_token_pair_for_user(user)

        return Response(
            {
                "message": "Account created successfully.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "name": user.first_name,
                    "date_joined": user.date_joined,
                },
                "tokens": tokens,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            if _wants_html(request):
                messages.error(request, _first_serializer_error(serializer))
                return redirect("login")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data["user"]
        tokens = jwt_token_pair_for_user(user)
        LoginActivity.objects.create(
            user=user,
            email=user.email,
            ip_address=_get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
        )

        if _wants_html(request):
            response = redirect("dashboard")
            return _set_jwt_cookies(response, tokens)

        return Response(
            {
                "message": "Login successful.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "name": user.first_name,
                },
                "tokens": tokens,
            }
        )


@jwt_login_required
def upload_view(request):
    if request.method == "POST":
        title = request.POST.get("title", "").strip() or "Untitled notes"
        notes_text = request.POST.get("notes", "").strip()
        uploaded_file = request.FILES.get("notes_file")

        if not notes_text and uploaded_file:
            try:
                notes_text = uploaded_file.read().decode("utf-8", errors="ignore").strip()
                uploaded_file.seek(0)
            except ValueError:
                notes_text = ""

        if not notes_text:
            messages.error(request, "Paste notes text or upload a readable text file.")
            return render(request, "summarizer/upload.html")

        note_summary = NoteSummary.objects.create(
            user=request.jwt_user,
            title=title,
            original_text=notes_text,
            summary=summarize_notes(notes_text),
            uploaded_file=uploaded_file,
        )
        return redirect("result", summary_id=note_summary.id)

    return render(request, "summarizer/upload.html")


@jwt_login_required
def dashboard_view(request):
    summaries = NoteSummary.objects.filter(user=request.jwt_user)
    return render(
        request,
        "summarizer/dashboard.html",
        {"summaries": summaries, "jwt_user": request.jwt_user},
    )


@jwt_login_required
def result_view(request, summary_id):
    note_summary = get_object_or_404(
        NoteSummary,
        id=summary_id,
        user=request.jwt_user,
    )
    return render(
        request,
        "summarizer/result.html",
        {"note_summary": note_summary, "jwt_user": request.jwt_user},
    )
