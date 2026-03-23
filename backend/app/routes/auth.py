"""
app/routes/auth.py — PREPIFY authentication endpoints
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import app.models.user as user_model

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data     = request.get_json(force=True) or {}
    username = (data.get("username") or "").strip()
    email    = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not username or not email or not password:
        return jsonify({"error": "username, email and password are required."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    try:
        user = user_model.create_user(username, email, password)
    except ValueError as e:
        return jsonify({"error": str(e)}), 409

    token = create_access_token(identity=user["id"])
    return jsonify({"token": token, "user": user}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data     = request.get_json(force=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"error": "username and password are required."}), 400

    user = user_model.verify_user(username, password)
    if not user:
        return jsonify({"error": "Invalid username or password."}), 401

    token = create_access_token(identity=user["id"])
    return jsonify({"token": token, "user": user}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user    = user_model.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    from flask import current_app
    limit = current_app.config.get("DAILY_AI_CALL_LIMIT", 100)
    usage = user_model.get_usage_today(user_id)

    return jsonify({
        "user":  user,
        "usage": usage,
        "limit": limit,
    }), 200
