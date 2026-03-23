"""
app/routes/attendance.py — PREPIFY attendance endpoints
POST /api/attendance/mark
GET  /api/attendance/
GET  /api/attendance/stats
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import app.models.attendance as att_model

attendance_bp = Blueprint("attendance", __name__)


@attendance_bp.route("/mark", methods=["POST"])
@jwt_required()
def mark():
    user_id = get_jwt_identity()
    data = request.get_json(force=True) or {}
    status = data.get("status", "present")
    if status not in ("present", "absent"):
        return jsonify({"error": "status must be 'present' or 'absent'"}), 400

    record = att_model.mark_attendance(user_id, status)
    return jsonify(record), 201


@attendance_bp.route("/", methods=["GET"])
@jwt_required()
def list_attendance():
    user_id = get_jwt_identity()
    records = att_model.get_attendance(user_id)
    return jsonify(records), 200


@attendance_bp.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    user_id = get_jwt_identity()
    s = att_model.get_stats(user_id)
    return jsonify(s), 200
