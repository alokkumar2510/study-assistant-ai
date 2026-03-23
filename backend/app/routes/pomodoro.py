"""
app/routes/pomodoro.py — PREPIFY pomodoro endpoints
POST /api/pomodoro/session
GET  /api/pomodoro/sessions
GET  /api/pomodoro/stats
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import app.models.pomodoro as pomo_model

pomodoro_bp = Blueprint("pomodoro", __name__)


@pomodoro_bp.route("/session", methods=["POST"])
@jwt_required()
def save_session():
    user_id = get_jwt_identity()
    data = request.get_json(force=True) or {}
    duration = data.get("duration_minutes", 25)
    session_type = data.get("session_type", "work")

    if not isinstance(duration, (int, float)) or duration <= 0:
        return jsonify({"error": "duration_minutes must be a positive number"}), 400

    record = pomo_model.save_session(user_id, int(duration), session_type)
    return jsonify(record), 201


@pomodoro_bp.route("/sessions", methods=["GET"])
@jwt_required()
def list_sessions():
    user_id = get_jwt_identity()
    sessions = pomo_model.get_sessions(user_id)
    return jsonify(sessions), 200


@pomodoro_bp.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    user_id = get_jwt_identity()
    s = pomo_model.get_stats(user_id)
    return jsonify(s), 200
