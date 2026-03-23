"""
app/utils/rate_limit.py — PREPIFY AI rate limiter
Enforces 100 AI API calls per user per day via JWT identity.
"""

from functools import wraps
from flask import jsonify, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
import app.models.user as user_model


def require_auth_rate_limit(fn):
    """
    Decorator that:
      1. Verifies a valid JWT is present.
      2. Checks the user hasn't exceeded the daily AI call limit.
      3. Increments usage on success.
    Apply to any AI-powered endpoint.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()

        limit = current_app.config.get("DAILY_AI_CALL_LIMIT", 100)
        usage = user_model.get_usage_today(user_id)

        if usage >= limit:
            return jsonify({
                "error":  "Daily AI limit reached",
                "detail": f"You have used {usage}/{limit} AI calls today. Limit resets at midnight UTC.",
                "usage":  usage,
                "limit":  limit,
            }), 429

        # Run the actual route
        response = fn(*args, **kwargs)

        # Increment *after* success (don't count failed calls)
        user_model.increment_usage(user_id)
        return response

    return wrapper
