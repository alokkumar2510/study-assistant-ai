"""
quiz.py
-------
API routes for quiz generation and grading.
All endpoints are prefixed with /api/quiz.
"""

from flask import Blueprint, request, jsonify
from app.services.quiz_service import create_quiz, grade_quiz, get_quiz_history
from app.models.schemas import validate_quiz_request
from app.utils.rate_limit import require_auth_rate_limit

# Create a Blueprint for quiz routes
quiz_bp = Blueprint("quiz", __name__)


@quiz_bp.route("/generate", methods=["POST"])
@require_auth_rate_limit
def generate_quiz():
    """
    POST /api/quiz/generate — Generate a new quiz.

    Expected JSON body:
        {
            "topic": "Photosynthesis",
            "num_questions": 5       (optional, default: 5)
        }
    """
    data = request.get_json()

    # Validate the incoming data
    is_valid, error = validate_quiz_request(data)
    if not is_valid:
        return jsonify({"error": error}), 400

    quiz = create_quiz(
        topic=data["topic"],
        num_questions=data.get("num_questions", 5),
    )
    return jsonify(quiz), 201


@quiz_bp.route("/grade", methods=["POST"])
def grade():
    """
    POST /api/quiz/grade — Grade a completed quiz.

    Expected JSON body:
        {
            "quiz_id": "abc12345",
            "answers": {
                "q1": 0,
                "q2": 2,
                "q3": 1
            }
        }
    """
    data = request.get_json()

    if not data or not data.get("quiz_id"):
        return jsonify({"error": "quiz_id is required"}), 400
    if not data.get("answers"):
        return jsonify({"error": "answers are required"}), 400

    result = grade_quiz(data["quiz_id"], data["answers"])
    if result is None:
        return jsonify({"error": "Quiz not found"}), 404

    return jsonify(result), 200


@quiz_bp.route("/history", methods=["GET"])
def quiz_history():
    """GET /api/quiz/history — Retrieve all past quizzes."""
    history = get_quiz_history()
    return jsonify(history), 200
