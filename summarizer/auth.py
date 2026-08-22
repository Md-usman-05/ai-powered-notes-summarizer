from functools import wraps

from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken


TOKEN_COOKIE_NAME = "access_token"
REFRESH_TOKEN_COOKIE_NAME = "refresh_token"


def get_user_from_request(request):
    token = request.COOKIES.get(TOKEN_COOKIE_NAME)
    if not token:
        return None

    try:
        payload = AccessToken(token)
    except TokenError:
        return None

    try:
        return get_user_model().objects.get(id=payload["user_id"])
    except (KeyError, get_user_model().DoesNotExist):
        return None


def jwt_login_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user = get_user_from_request(request)
        if user is None:
            return redirect("login")

        request.jwt_user = user
        return view_func(request, *args, **kwargs)

    return wrapper
