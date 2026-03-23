"""
flashcard_service.py
--------------------
Business logic for managing flashcards.
Handles CRUD operations and AI-powered flashcard generation.
"""

import os
from app.utils.file_handler import read_json, write_json
from app.utils.helpers import generate_id, get_timestamp
from app.services.ai_service import generate_flashcards_from_text
from config import Config

# Path to the flashcards data file
FLASHCARDS_FILE = os.path.join(Config.DATA_DIR, "flashcards.json")


def get_all_flashcards():
    """
    Retrieve all flashcards.

    Returns:
        list[dict]: A list of all flashcard objects.
    """
    return read_json(FLASHCARDS_FILE)


def get_flashcard_by_id(flashcard_id):
    """
    Retrieve a single flashcard by its ID.

    Args:
        flashcard_id (str): The unique flashcard identifier.

    Returns:
        dict | None: The flashcard if found, None otherwise.
    """
    flashcards = read_json(FLASHCARDS_FILE)
    for card in flashcards:
        if card["id"] == flashcard_id:
            return card
    return None


def create_flashcard(question, answer, subject="General"):
    """
    Create a new flashcard manually.

    Args:
        question (str): The front of the card (question).
        answer (str): The back of the card (answer).
        subject (str): Optional subject/category.

    Returns:
        dict: The newly created flashcard object.
    """
    flashcards = read_json(FLASHCARDS_FILE)

    new_card = {
        "id": generate_id(),
        "question": question.strip(),
        "answer": answer.strip(),
        "subject": subject.strip(),
        "created_at": get_timestamp(),
    }

    flashcards.append(new_card)
    write_json(FLASHCARDS_FILE, flashcards)
    return new_card


def generate_flashcards(text, subject="General", num_cards=5):
    """
    Generate flashcards from text using AI.

    Args:
        text (str): The source text to generate cards from.
        subject (str): Subject/category for the cards.
        num_cards (int): Number of cards to generate.

    Returns:
        list[dict]: The list of newly created flashcard objects.
    """
    flashcards = read_json(FLASHCARDS_FILE)

    # Use AI service to generate Q&A pairs
    ai_cards = generate_flashcards_from_text(text, num_cards)

    new_cards = []
    for card_data in ai_cards:
        new_card = {
            "id": generate_id(),
            "question": card_data["question"],
            "answer": card_data["answer"],
            "subject": subject.strip(),
            "created_at": get_timestamp(),
        }
        flashcards.append(new_card)
        new_cards.append(new_card)

    write_json(FLASHCARDS_FILE, flashcards)
    return new_cards


def delete_flashcard(flashcard_id):
    """
    Delete a flashcard by its ID.

    Args:
        flashcard_id (str): The flashcard ID to delete.

    Returns:
        bool: True if found and deleted, False otherwise.
    """
    flashcards = read_json(FLASHCARDS_FILE)
    original_length = len(flashcards)

    flashcards = [c for c in flashcards if c["id"] != flashcard_id]

    if len(flashcards) < original_length:
        write_json(FLASHCARDS_FILE, flashcards)
        return True
    return False
