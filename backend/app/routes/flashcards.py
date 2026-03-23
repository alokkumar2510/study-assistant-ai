"""
flashcards.py
-------------
API routes for managing flashcards.
All endpoints are prefixed with /api/flashcards.
"""

from flask import Blueprint, request, jsonify
from app.services.flashcard_service import (
    get_all_flashcards,
    create_flashcard,
    generate_flashcards,
    delete_flashcard,
)
from app.models.schemas import validate_flashcard
from app.utils.rate_limit import require_auth_rate_limit

# Create a Blueprint for flashcard routes
flashcards_bp = Blueprint("flashcards", __name__)


@flashcards_bp.route("/", methods=["GET"])
def list_flashcards():
    """GET /api/flashcards — Retrieve all flashcards."""
    cards = get_all_flashcards()
    return jsonify(cards), 200


@flashcards_bp.route("/", methods=["POST"])
def add_flashcard():
    """POST /api/flashcards — Create a new flashcard manually."""
    data = request.get_json()

    # Validate the incoming data
    is_valid, error = validate_flashcard(data)
    if not is_valid:
        return jsonify({"error": error}), 400

    card = create_flashcard(
        question=data["question"],
        answer=data["answer"],
        subject=data.get("subject", "General"),
    )
    return jsonify(card), 201


@flashcards_bp.route("/generate", methods=["POST"])
@require_auth_rate_limit
def auto_generate_flashcards():
    """
    POST /api/flashcards/generate — Generate flashcards from text using AI.

    Expected JSON body:
        {
            "text": "Your study notes or text here...",
            "subject": "Math",        (optional)
            "num_cards": 5              (optional)
        }
    """
    data = request.get_json()

    if not data or not data.get("text", "").strip():
        return jsonify({"error": "Text content is required"}), 400

    cards = generate_flashcards(
        text=data["text"],
        subject=data.get("subject", "General"),
        num_cards=data.get("num_cards", 5),
    )
    return jsonify(cards), 201


@flashcards_bp.route("/<flashcard_id>", methods=["DELETE"])
def remove_flashcard(flashcard_id):
    """DELETE /api/flashcards/<id> — Delete a flashcard."""
    success = delete_flashcard(flashcard_id)
    if not success:
        return jsonify({"error": "Flashcard not found"}), 404
    return jsonify({"message": "Flashcard deleted successfully"}), 200
