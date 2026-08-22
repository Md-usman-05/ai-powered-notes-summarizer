from django.contrib.auth import authenticate, get_user_model

from rest_framework import serializers

from rest_framework_simplejwt.tokens import RefreshToken

from .models import NoteSummary


User = get_user_model()


class RegisterSerializer(serializers.Serializer):

    name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )

    username = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    confirm_password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    def validate(self, attrs):

        if attrs["password"] != attrs["confirm_password"]:

            raise serializers.ValidationError(
                {
                    "confirm_password":
                    "Passwords do not match."
                }
            )

        email = attrs["email"].strip().lower()

        if User.objects.filter(
            email__iexact=email
        ).exists():

            raise serializers.ValidationError(
                {
                    "email":
                    "Email already exists."
                }
            )

        username_base = (
            attrs.get("username")
            or attrs.get("name")
            or email.split("@")[0]
        ).strip().replace(" ", "_")

        username = username_base
        counter = 1

        while User.objects.filter(username__iexact=username).exists():
            counter += 1
            username = f"{username_base}{counter}"

        attrs["email"] = email

        attrs["username"] = username

        return attrs

    def create(self, validated_data):

        validated_data.pop("confirm_password")

        name = validated_data.pop(
            "name",
            "",
        )

        password = validated_data.pop(
            "password"
        )

        user = User.objects.create_user(

            username=validated_data["username"],

            email=validated_data["email"],

            password=password,

            first_name=name,
        )

        return user


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):

        email = attrs["email"].strip().lower()

        password = attrs["password"]

        try:

            matched_user = User.objects.get(
                email__iexact=email
            )

        except User.DoesNotExist as exc:

            raise serializers.ValidationError(
                "Account does not exist."
            ) from exc

        user = authenticate(

            username=matched_user.username,

            password=password,
        )

        if user is None:

            raise serializers.ValidationError(
                "Invalid email or password."
            )

        attrs["user"] = user

        return attrs


def get_tokens_for_user(user):

    refresh = RefreshToken.for_user(user)

    return {

        "refresh": str(refresh),

        "access": str(
            refresh.access_token
        ),
    }



class NoteSummarySerializer(serializers.ModelSerializer):

    class Meta:

        model = NoteSummary

        fields = [
            "id",
            "title",
            "original_text",
            "summary",
            "uploaded_file",
            "created_at",
        ]
        read_only_fields = ["id", "original_text", "uploaded_file", "created_at"]
