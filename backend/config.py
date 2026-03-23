"""
config.py — PREPIFY backend configuration
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR  = os.path.join(BASE_DIR, "data")


class Config:
    # ── Core ──────────────────────────────────────────────
    APP_NAME   = "PREPIFY"
    DEBUG      = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    SECRET_KEY = os.environ.get("SECRET_KEY", "prepify-secret-change-in-prod")

    # ── JWT ───────────────────────────────────────────────
    JWT_SECRET_KEY            = os.environ.get("JWT_SECRET_KEY", "prepify-jwt-secret-change-me")
    JWT_ACCESS_TOKEN_EXPIRES  = timedelta(days=7)

    # ── CORS ──────────────────────────────────────────────
    CORS_ORIGINS = os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:5173,https://prepify.alokkumarsahu.in"
    )

    # ── Data directories ──────────────────────────────────
    DATA_DIR = DATA_DIR

    # ── AI ────────────────────────────────────────────────
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

    # ── Rate limiting ─────────────────────────────────────
    DAILY_AI_CALL_LIMIT = int(os.environ.get("DAILY_AI_CALL_LIMIT", "100"))
