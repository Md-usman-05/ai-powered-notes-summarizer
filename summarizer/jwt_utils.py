import base64
import hashlib
import hmac
import json
import time

from django.conf import settings


JWT_ALGORITHM = "HS256"
JWT_EXP_SECONDS = 60 * 60 * 24


def _b64encode(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64decode(data):
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}")


def _sign(message):
    digest = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        message.encode("ascii"),
        hashlib.sha256,
    ).digest()
    return _b64encode(digest)


def create_access_token(user):
    now = int(time.time())
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    payload = {
        "sub": str(user.id),
        "username": user.username,
        "email": user.email,
        "iat": now,
        "exp": now + JWT_EXP_SECONDS,
    }

    encoded_header = _b64encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    encoded_payload = _b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{encoded_header}.{encoded_payload}"
    return f"{signing_input}.{_sign(signing_input)}"


def decode_access_token(token):
    try:
        encoded_header, encoded_payload, signature = token.split(".")
    except ValueError:
        return None

    signing_input = f"{encoded_header}.{encoded_payload}"
    expected_signature = _sign(signing_input)
    if not hmac.compare_digest(signature, expected_signature):
        return None

    try:
        header = json.loads(_b64decode(encoded_header))
        payload = json.loads(_b64decode(encoded_payload))
    except (json.JSONDecodeError, ValueError):
        return None

    if header.get("alg") != JWT_ALGORITHM or payload.get("exp", 0) < int(time.time()):
        return None

    return payload
