"""
app/routes/goals.py — PREPIFY study goals endpoints
GET/POST /api/goals/
PUT      /api/goals/<id>
DELETE   /api/goals/<id>
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import app.models.goals as goals_model

goals_bp = Blueprint("goals", __name__)


@goals_bp.route("/", methods=["GET"])
@jwt_required()
def list_goals():
    user_id = get_jwt_identity()
    goals = goals_model.get_goals(user_id)
    return jsonify(goals), 200


@goals_bp.route("/", methods=["POST"])
@jwt_required()
def create_goal():
    user_id = get_jwt_identity()
    data = request.get_json(force=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400

    goal = goals_model.create_goal(
        user_id=user_id,
        title=title,
        subject=data.get("subject", "General"),
        target=data.get("target", 100),
    )
    return jsonify(goal), 201


@goals_bp.route("/<goal_id>", methods=["PUT"])
@jwt_required()
def update_goal(goal_id):
    user_id = get_jwt_identity()
    data = request.get_json(force=True) or {}

    goal = goals_model.update_goal(
        goal_id=goal_id,
        user_id=user_id,
        title=data.get("title"),
        subject=data.get("subject"),
        progress=data.get("progress"),
        target=data.get("target"),
        status=data.get("status"),
    )
    if not goal:
        return jsonify({"error": "Goal not found"}), 404
    return jsonify(goal), 200


@goals_bp.route("/<goal_id>", methods=["DELETE"])
@jwt_required()
def delete_goal(goal_id):
    user_id = get_jwt_identity()
    success = goals_model.delete_goal(goal_id, user_id)
    if not success:
        return jsonify({"error": "Goal not found"}), 404
    return jsonify({"message": "Goal deleted"}), 200
