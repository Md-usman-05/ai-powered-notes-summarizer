from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    username = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        email = attrs["email"].strip().lower()
        if get_user_model().objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "An account with this email already exists."})

        username = attrs.get("username") or attrs.get("name") or email
        if get_user_model().objects.filter(username__iexact=username).exists():
            username = email

        attrs["email"] = email
        attrs["username"] = username
        attrs["name"] = attrs.get("name") or username
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        name = validated_data.pop("name", "")
        password = validated_data.pop("password")
        return get_user_model().objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=password,
            first_name=name,
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    default_error_messages = {
        "missing_account": "Please create an account first.",
        "invalid_credentials": "Invalid Email or Password.",
    }

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        password = attrs["password"]

        try:
            matched_user = get_user_model().objects.get(email__iexact=email)
        except get_user_model().DoesNotExist as exc:
            raise serializers.ValidationError(self.error_messages["missing_account"]) from exc

        user = authenticate(
            request=self.context.get("request"),
            username=matched_user.username,
            password=password,
        )
        if user is None:
            raise serializers.ValidationError(self.error_messages["invalid_credentials"])

        attrs["user"] = user
        return attrs


def jwt_token_pair_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }
