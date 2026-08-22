"""
Django settings for ai_notes_summarizer project.
"""

import os
from pathlib import Path
from datetime import timedelta

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(*args, **kwargs):
        return False


BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv()


# ============================================================
# SECURITY
# ============================================================

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-8nsi328^n4bb3f+^f$u)fv&8m_p^3cx&m7q4p@i!p30+0^^soz",
)

DEBUG = os.environ.get("DJANGO_DEBUG", "False").lower() == "true"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get(
        "DJANGO_ALLOWED_HOSTS",
        "127.0.0.1,localhost,notemind-backend-euy4.onrender.com"
    ).split(",")
    if host.strip()
]


# ============================================================
# APPLICATIONS
# ============================================================

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "summarizer",
    "corsheaders",
]


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ============================================================
# URL / WSGI
# ============================================================

ROOT_URLCONF = "ai_notes_summarizer.urls"

WSGI_APPLICATION = "ai_notes_summarizer.wsgi.application"


# ============================================================
# TEMPLATES
# ============================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ============================================================
# DATABASE
# ============================================================

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# ============================================================
# PASSWORD VALIDATION
# ============================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


# ============================================================
# INTERNATIONALIZATION
# ============================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# ============================================================
# STATIC & MEDIA
# ============================================================

STATIC_URL = "static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "media/"

MEDIA_ROOT = BASE_DIR / "media"


# ============================================================
# DJANGO DEFAULTS
# ============================================================

LOGIN_URL = "login"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ============================================================
# DJANGO REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}


# ============================================================
# JWT
# ============================================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),

    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),

    "ROTATE_REFRESH_TOKENS": False,

    "BLACKLIST_AFTER_ROTATION": False,

    "UPDATE_LAST_LOGIN": True,
}


# ============================================================
# CORS
# ============================================================

CORS_ALLOW_ALL_ORIGINS = True


# ============================================================
# EMAIL / OTP
# ============================================================

EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND",
    (
        "django.core.mail.backends.smtp.EmailBackend"
        if os.environ.get("EMAIL_HOST")
        else "django.core.mail.backends.console.EmailBackend"
    ),
)

DEFAULT_FROM_EMAIL = os.environ.get(
    "DEFAULT_FROM_EMAIL",
    "noreply@notemind.local",
)

EMAIL_HOST = os.environ.get(
    "EMAIL_HOST",
    "",
)

EMAIL_PORT = int(
    os.environ.get(
        "EMAIL_PORT",
        "587",
    )
)

EMAIL_HOST_USER = os.environ.get(
    "EMAIL_HOST_USER",
    "",
)

EMAIL_HOST_PASSWORD = os.environ.get(
    "EMAIL_HOST_PASSWORD",
    "",
)

EMAIL_USE_TLS = os.environ.get(
    "EMAIL_USE_TLS",
    "true",
).lower() == "true"


OTP_EMAIL_READY = bool(
    EMAIL_HOST
    and EMAIL_HOST_USER
    and EMAIL_HOST_PASSWORD
)