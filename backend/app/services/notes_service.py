"""
notes_service.py
----------------
Business logic for managing study notes.
Handles CRUD operations using JSON file storage.
"""

import os
from app.utils.file_handler import read_json, write_json
from app.utils.helpers import generate_id, get_timestamp
from config import Config

# Path to the notes data file
NOTES_FILE = os.path.join(Config.DATA_DIR, "notes.json")


def get_all_notes():
    """
    Retrieve all notes.

    Returns:
        list[dict]: A list of all note objects.
    """
    return read_json(NOTES_FILE)


def get_note_by_id(note_id):
    """
    Retrieve a single note by its ID.

    Args:
        note_id (str): The unique note identifier.

    Returns:
        dict | None: The note object if found, None otherwise.
    """
    notes = read_json(NOTES_FILE)
    for note in notes:
        if note["id"] == note_id:
            return note
    return None


def create_note(title, content, subject="General"):
    """
    Create a new note.

    Args:
        title (str): Note title.
        content (str): Note body text.
        subject (str): Optional subject/category.

    Returns:
        dict: The newly created note object.
    """
    notes = read_json(NOTES_FILE)

    new_note = {
        "id": generate_id(),
        "title": title.strip(),
        "content": content.strip(),
        "subject": subject.strip(),
        "created_at": get_timestamp(),
        "updated_at": get_timestamp(),
    }

    notes.append(new_note)
    write_json(NOTES_FILE, notes)
    return new_note


def update_note(note_id, title=None, content=None, subject=None):
    """
    Update an existing note.

    Args:
        note_id (str): The note ID to update.
        title (str, optional): New title.
        content (str, optional): New content.
        subject (str, optional): New subject.

    Returns:
        dict | None: The updated note, or None if not found.
    """
    notes = read_json(NOTES_FILE)

    for note in notes:
        if note["id"] == note_id:
            if title is not None:
                note["title"] = title.strip()
            if content is not None:
                note["content"] = content.strip()
            if subject is not None:
                note["subject"] = subject.strip()
            note["updated_at"] = get_timestamp()
            write_json(NOTES_FILE, notes)
            return note

    return None


def delete_note(note_id):
    """
    Delete a note by its ID.

    Args:
        note_id (str): The note ID to delete.

    Returns:
        bool: True if the note was found and deleted, False otherwise.
    """
    notes = read_json(NOTES_FILE)
    original_length = len(notes)

    # Filter out the note with the matching ID
    notes = [n for n in notes if n["id"] != note_id]

    if len(notes) < original_length:
        write_json(NOTES_FILE, notes)
        return True
    return False
