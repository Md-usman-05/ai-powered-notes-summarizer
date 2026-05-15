from django.shortcuts import render

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import NoteSummary
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    get_tokens_for_user,
)

from .services import generate_summary


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


class RegisterAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.save()

            tokens = get_tokens_for_user(user)

            return Response(
                {
                    "message": "Account created successfully",
                    "tokens": tokens,
                }
            )

        return Response(
            serializer.errors,
            status=400,
        )


class LoginAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.validated_data["user"]

            tokens = get_tokens_for_user(user)

            return Response(
                {
                    "message": "Login successful",
                    "access": tokens["access"],
                    "refresh": tokens["refresh"],
                }
            )

        return Response(
            serializer.errors,
            status=400,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def summaries_api(request):

    summaries = NoteSummary.objects.filter(
        user=request.user
    ).order_by("-created_at")

    data = []

    for item in summaries:

        data.append(
            {
                "id": item.id,
                "title": item.title,
                "summary": item.summary,
                "created_at": item.created_at,
            }
        )

    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_summary_api(request):

    try:

        notes = request.data.get("notes")

        if not notes:

            return Response(
                {
                    "error": "Notes are required"
                },
                status=400
            )

        summary = generate_summary(notes)

        title = " ".join(notes.split()[:5]) + "..."

        saved_summary = NoteSummary.objects.create(

            user=request.user,

            title=title,

            original_text=notes,

            summary=summary,
        )

        return Response(
            {
                "id": saved_summary.id,
                "title": saved_summary.title,
                "summary": saved_summary.summary,
                "created_at": saved_summary.created_at,
            }
        )

    except Exception as e:

        return Response(
            {
                "error": str(e)
            },
            status=500
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_summary_api(request, summary_id):

    try:

        summary = NoteSummary.objects.get(
            id=summary_id,
            user=request.user
        )

        summary.delete()

        return Response(
            {
                "message": "Summary deleted"
            }
        )

    except NoteSummary.DoesNotExist:

        return Response(
            {
                "error": "Summary not found"
            },
            status=404
        )