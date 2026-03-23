"""
chat.py
-------
API routes for the AI chat assistant.
All endpoints are prefixed with /api/chat.
"""

from flask import Blueprint, request, jsonify
from app.services.ai_service import generate_response
from app.models.schemas import validate_chat_message
from app.utils.rate_limit import require_auth_rate_limit

# Create a Blueprint for chat routes
chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/", methods=["POST"])
@require_auth_rate_limit
def send_message():
    """
    POST /api/chat — Send a message to the AI assistant.

    Expected JSON body:
        {
            "message": "What is photosynthesis?"
        }

    Returns:
        {
            "reply": "Photosynthesis is the process by which..."
        }
    """
    data = request.get_json()

    # Validate the incoming data
    is_valid, error = validate_chat_message(data)
    if not is_valid:
        return jsonify({"error": error}), 400

    # Generate a response using the AI service
    reply = generate_response(data["message"])

    return jsonify({"reply": reply}), 200
