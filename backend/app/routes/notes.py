"""
notes.py
--------
API routes for managing study notes.
All endpoints are prefixed with /api/notes (set in app/__init__.py).
"""

from flask import Blueprint, request, jsonify
from app.services.notes_service import (
    get_all_notes,
    get_note_by_id,
    create_note,
    update_note,
    delete_note,
)
from app.models.schemas import validate_note

# Create a Blueprint for notes routes
notes_bp = Blueprint("notes", __name__)


@notes_bp.route("/", methods=["GET"])
def list_notes():
    """GET /api/notes — Retrieve all notes."""
    notes = get_all_notes()
    return jsonify(notes), 200


@notes_bp.route("/<note_id>", methods=["GET"])
def get_note(note_id):
    """GET /api/notes/<id> — Retrieve a single note."""
    note = get_note_by_id(note_id)
    if note is None:
        return jsonify({"error": "Note not found"}), 404
    return jsonify(note), 200


@notes_bp.route("/", methods=["POST"])
def add_note():
    """POST /api/notes — Create a new note."""
    data = request.get_json()

    # Validate the incoming data
    is_valid, error = validate_note(data)
    if not is_valid:
        return jsonify({"error": error}), 400

    note = create_note(
        title=data["title"],
        content=data["content"],
        subject=data.get("subject", "General"),
    )
    return jsonify(note), 201


@notes_bp.route("/<note_id>", methods=["PUT"])
def edit_note(note_id):
    """PUT /api/notes/<id> — Update an existing note."""
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    note = update_note(
        note_id=note_id,
        title=data.get("title"),
        content=data.get("content"),
        subject=data.get("subject"),
    )

    if note is None:
        return jsonify({"error": "Note not found"}), 404
    return jsonify(note), 200


@notes_bp.route("/<note_id>", methods=["DELETE"])
def remove_note(note_id):
    """DELETE /api/notes/<id> — Delete a note."""
    success = delete_note(note_id)
    if not success:
        return jsonify({"error": "Note not found"}), 404
    return jsonify({"message": "Note deleted successfully"}), 200
