import secrets
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.shortcuts import render
from django.utils import timezone
from types import SimpleNamespace

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import LoginActivity, NoteSummary, OTP

from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    get_tokens_for_user,
)

from .services import (
    SummaryGenerationError,
    generate_key_points,
    generate_summary,
)

from .file_extractors import (
    UnsupportedFileError,
    extract_text_from_upload,
)


# ============================================================
# BASIC DJANGO PAGE VIEWS
# ============================================================

def index(request):

    return render(
        request,
        "summarizer/index.html",
    )


def login_view(request):

    return render(
        request,
        "summarizer/login.html",
    )


def register_view(request):

    return render(
        request,
        "summarizer/register.html",
    )


def logout_view(request):

    return render(
        request,
        "summarizer/index.html",
    )


def upload_view(request):

    if request.method == "POST":

        notes = request.POST.get(
            "notes_text",
            "",
        )

        uploaded_file = request.FILES.get(
            "notes_file"
        )

        if uploaded_file:

            try:

                notes = extract_text_from_upload(
                    uploaded_file
                )

            except UnsupportedFileError as exc:

                return render(
                    request,
                    "summarizer/upload.html",
                    {
                        "error": str(exc)
                    },
                )

        if not notes.strip():

            return render(
                request,
                "summarizer/upload.html",
                {
                    "error":
                    "Upload a text file or paste notes first."
                },
            )

        try:

            summary = generate_summary(
                notes
            )

        except SummaryGenerationError as exc:

            return render(
                request,
                "summarizer/upload.html",
                {
                    "error": str(exc)
                },
            )

        title = (
            " ".join(
                notes.split()[:5]
            )
            + "..."
        )

        if request.user.is_authenticated:

            note_summary = NoteSummary.objects.create(

                user=request.user,

                title=title,

                original_text=notes,

                summary=summary,

                uploaded_file=(
                    uploaded_file
                    if uploaded_file
                    else None
                ),

            )

        else:

            note_summary = SimpleNamespace(

                title=title,

                summary=summary,

            )

        return render(

            request,

            "summarizer/result.html",

            {
                "note_summary":
                note_summary
            },

        )

    return render(
        request,
        "summarizer/upload.html",
    )


def dashboard_view(request):

    return render(
        request,
        "summarizer/dashboard.html",
    )


def result_view(request):

    return render(
        request,
        "summarizer/result.html",
    )


# ============================================================
# REGISTER API
# ============================================================

class RegisterAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.save()

            return Response(

                {
                    "message":
                    "Account created successfully",

                    "user": {

                        "id": user.id,

                        "name":
                        user.get_full_name()
                        or user.username,

                        "email":
                        user.email,

                    },
                },

                status=201,

            )

        return Response(

            serializer.errors,

            status=400,

        )


# ============================================================
# LOGIN API
# ============================================================

class LoginAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.validated_data[
                "user"
            ]

            tokens = get_tokens_for_user(
                user
            )

            LoginActivity.objects.create(

                user=user,

                email=user.email,

                ip_address=_get_client_ip(
                    request
                ),

                user_agent=request.META.get(
                    "HTTP_USER_AGENT",
                    "",
                )[:1000],

            )

            return Response(

                {

                    "message":
                    "Login successful",

                    "access":
                    tokens["access"],

                    "refresh":
                    tokens["refresh"],

                }

            )

        return Response(

            serializer.errors,

            status=400,

        )


# ============================================================
# GET CLIENT IP
# ============================================================

def _get_client_ip(request):

    forwarded = request.META.get(
        "HTTP_X_FORWARDED_FOR"
    )

    if forwarded:

        return (
            forwarded
            .split(",")[0]
            .strip()
        )

    return request.META.get(
        "REMOTE_ADDR"
    )


# ============================================================
# CURRENT USER API
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user_api(request):

    return Response(

        {

            "id":
            request.user.id,

            "name":
            request.user.get_full_name()
            or request.user.username,

            "email":
            request.user.email,

        }

    )


# ============================================================
# FIND LATEST VALID OTP
# ============================================================

def _latest_valid_otp(email):

    return OTP.objects.filter(

        email__iexact=email,

        used_at__isnull=True,

        created_at__gte=
        timezone.now()
        - timedelta(minutes=10),

    ).first()


# ============================================================
# FORGOT PASSWORD API
# ============================================================
#
# IMPORTANT:
#
# Django generates the OTP.
#
# Django stores a HASHED version of the OTP.
#
# Django returns the OTP to React.
#
# React will send that OTP using EmailJS.
#
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password_api(request):

    email = str(

        request.data.get(
            "email",
            "",
        )

    ).strip().lower()

    # --------------------------------------------------------
    # Validate email
    # --------------------------------------------------------

    if not email:

        return Response(

            {
                "error":
                "Enter your email address."
            },

            status=400,

        )

    # --------------------------------------------------------
    # Check whether account exists
    # --------------------------------------------------------

    user = get_user_model().objects.filter(

        email__iexact=email

    ).first()

    if not user:

        return Response(

            {
                "error":
                "No account exists with this email address."
            },

            status=404,

        )

    # --------------------------------------------------------
    # Generate 6-digit OTP
    # --------------------------------------------------------

    code = f"{secrets.randbelow(1_000_000):06d}"

    # --------------------------------------------------------
    # Invalidate previous unused OTPs
    # --------------------------------------------------------

    OTP.objects.filter(

        email__iexact=email,

        used_at__isnull=True,

    ).update(

        used_at=timezone.now()

    )

    # --------------------------------------------------------
    # Store hashed OTP
    # --------------------------------------------------------

    OTP.objects.create(

        email=email,

        otp=make_password(code),

    )

    # --------------------------------------------------------
    # IMPORTANT:
    #
    # We DO NOT use Django send_mail() here.
    #
    # EmailJS will send the email from React.
    # --------------------------------------------------------

    return Response(

        {

            "message":
            "Verification code generated successfully.",

            "otp":
            code,

        },

        status=200,

    )


# ============================================================
# VERIFY OTP API
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp_api(request):

    email = str(

        request.data.get(
            "email",
            "",
        )

    ).strip().lower()

    code = str(

        request.data.get(
            "otp",
            "",
        )

    ).strip()

    # --------------------------------------------------------
    # Basic validation
    # --------------------------------------------------------

    if not email or not code:

        return Response(

            {
                "error":
                "Email and OTP are required."
            },

            status=400,

        )

    # --------------------------------------------------------
    # Find valid OTP
    # --------------------------------------------------------

    otp = _latest_valid_otp(
        email
    )

    # --------------------------------------------------------
    # Check OTP
    # --------------------------------------------------------

    if not otp or not check_password(
        code,
        otp.otp,
    ):

        return Response(

            {
                "error":
                "That code is invalid or has expired. Request a new one and try again."
            },

            status=400,

        )

    return Response(

        {
            "message":
            "Code verified."
        }

    )


# ============================================================
# RESET PASSWORD API
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password_api(request):

    email = str(

        request.data.get(
            "email",
            "",
        )

    ).strip().lower()

    code = str(

        request.data.get(
            "otp",
            "",
        )

    ).strip()

    password = request.data.get(
        "password",
        "",
    )

    confirm_password = request.data.get(
        "confirm_password",
        "",
    )

    # --------------------------------------------------------
    # Check password match
    # --------------------------------------------------------

    if password != confirm_password:

        return Response(

            {
                "error":
                "Passwords do not match."
            },

            status=400,

        )

    # --------------------------------------------------------
    # Find user
    # --------------------------------------------------------

    user = get_user_model().objects.filter(

        email__iexact=email

    ).first()

    # --------------------------------------------------------
    # Find valid OTP
    # --------------------------------------------------------

    otp = _latest_valid_otp(
        email
    )

    # --------------------------------------------------------
    # Validate OTP
    # --------------------------------------------------------

    if (

        not user
        or not otp
        or not check_password(
            code,
            otp.otp,
        )

    ):

        return Response(

            {
                "error":
                "That code is invalid or has expired."
            },

            status=400,

        )

    # --------------------------------------------------------
    # Validate password using Django validators
    # --------------------------------------------------------

    try:

        validate_password(
            password,
            user,
        )

    except Exception as exc:

        return Response(

            {
                "error":
                " ".join(
                    exc.messages
                )
            },

            status=400,

        )

    # --------------------------------------------------------
    # Set new password
    # --------------------------------------------------------

    user.set_password(
        password
    )

    user.save(
        update_fields=[
            "password"
        ]
    )

    # --------------------------------------------------------
    # Mark OTP as used
    # --------------------------------------------------------

    otp.used_at = timezone.now()

    otp.save(
        update_fields=[
            "used_at"
        ]
    )

    return Response(

        {
            "message":
            "Your password has been reset. You can now sign in."
        }

    )


# ============================================================
# CHANGE PASSWORD API
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password_api(request):

    current_password = request.data.get(
        "current_password",
        "",
    )

    password = request.data.get(
        "password",
        "",
    )

    confirm_password = request.data.get(
        "confirm_password",
        "",
    )

    # --------------------------------------------------------
    # Check current password
    # --------------------------------------------------------

    if not request.user.check_password(
        current_password
    ):

        return Response(

            {
                "error":
                "Your current password is incorrect."
            },

            status=400,

        )

    # --------------------------------------------------------
    # Check new password
    # --------------------------------------------------------

    if password != confirm_password:

        return Response(

            {
                "error":
                "Passwords do not match."
            },

            status=400,

        )

    # --------------------------------------------------------
    # Validate password
    # --------------------------------------------------------

    try:

        validate_password(

            password,

            request.user,

        )

    except Exception as exc:

        return Response(

            {
                "error":
                " ".join(
                    exc.messages
                )
            },

            status=400,

        )

    # --------------------------------------------------------
    # Save password
    # --------------------------------------------------------

    request.user.set_password(
        password
    )

    request.user.save(
        update_fields=[
            "password"
        ]
    )

    return Response(

        {
            "message":
            "Password updated successfully."
        }

    )


# ============================================================
# GET ALL SUMMARIES
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def summaries_api(request):

    summaries = NoteSummary.objects.filter(

        user=request.user

    ).order_by(
        "-created_at"
    )

    data = []

    for item in summaries:

        data.append(

            {

                "id":
                item.id,

                "title":
                item.title,

                "summary":
                item.summary,

                "created_at":
                item.created_at,

            }

        )

    return Response(
        data
    )


# ============================================================
# GENERATE SUMMARY API
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_summary_api(request):

    try:

        notes = request.data.get("notes", "")
        uploaded_file = request.FILES.get("notes_file")

        print("========== SUMMARY REQUEST ==========")
        print("Content-Type:", request.content_type)
        print("Uploaded file:", uploaded_file)
        print("Request FILES:", request.FILES)
        print("Request DATA keys:", list(request.data.keys()))
        print("=====================================")

        if uploaded_file:

            try:

                notes = extract_text_from_upload(
                    uploaded_file
                )

                print(
                    "Extracted characters:",
                    len(notes)
                )

            except UnsupportedFileError as exc:

                return Response(
                    {
                        "error": str(exc)
                    },
                    status=400,
                )

        if not notes or not str(notes).strip():

            return Response(
                {
                    "error":
                    "No readable notes were received. "
                    "Please upload a readable document or paste your notes."
                },
                status=400,
            )

        notes = str(notes).strip()

        summary = generate_summary(notes)

        title = (
            " ".join(
                notes.split()[:5]
            )
            + "..."
        )

        if uploaded_file:
            uploaded_file.seek(0)

        saved_summary = NoteSummary.objects.create(
            user=request.user,
            title=title,
            original_text=notes,
            summary=summary,
            uploaded_file=(
                uploaded_file
                if uploaded_file
                else None
            ),
        )

        return Response(
            {
                "id": saved_summary.id,
                "title": saved_summary.title,
                "summary": saved_summary.summary,
                "created_at": saved_summary.created_at,
            }
        )

    except SummaryGenerationError as exc:

        return Response(
            {
                "error": str(exc)
            },
            status=503,
        )

    except Exception as exc:

        print(
            "SUMMARY GENERATION ERROR:",
            repr(exc)
        )

        return Response(
            {
                "error":
                "Unable to generate a summary right now. Please try again."
            },
            status=500,
        )

# ============================================================
# DELETE SUMMARY API
# ============================================================

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_summary_api(
    request,
    summary_id,
):

    try:

        summary = NoteSummary.objects.get(

            id=summary_id,

            user=request.user,

        )

        summary.delete()

        return Response(

            {
                "message":
                "Summary deleted"
            }

        )

    except NoteSummary.DoesNotExist:

        return Response(

            {
                "error":
                "Summary not found"
            },

            status=404,

        )


# ============================================================
# SUMMARY DETAIL API
# ============================================================

@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def summary_detail_api(
    request,
    summary_id,
):

    try:

        note_summary = NoteSummary.objects.get(

            id=summary_id,

            user=request.user,

        )

    except NoteSummary.DoesNotExist:

        return Response(

            {
                "error":
                "Summary not found."
            },

            status=404,

        )

    if request.method == "GET":

        from .serializers import NoteSummarySerializer

        return Response(

            NoteSummarySerializer(
                note_summary
            ).data

        )

    if request.method == "PATCH":

        from .serializers import NoteSummarySerializer

        serializer = NoteSummarySerializer(

            note_summary,

            data=request.data,

            partial=True,

        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data
        )

    note_summary.delete()

    return Response(
        status=204
    )


# ============================================================
# KEY POINTS API
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def key_points_api(
    request,
    summary_id,
):

    try:

        note_summary = NoteSummary.objects.get(

            id=summary_id,

            user=request.user,

        )

    except NoteSummary.DoesNotExist:

        return Response(

            {
                "error":
                "Summary not found."
            },

            status=404,

        )

    try:

        points = generate_key_points(

            note_summary.original_text

        )

        return Response(

            {

                "key_points":
                points,

                "generated_by_ai":
                True,

            }

        )

    except SummaryGenerationError as exc:

        return Response(

            {
                "error":
                str(exc)
            },

            status=503,

        )