"""
schemas.py
----------
Data validation helpers for incoming API requests.
Each validate function checks that required fields are present
and returns a tuple of (is_valid, error_message).
"""


def validate_note(data):
    """
    Validate data for creating/updating a note.

    Required fields:
        - title (str): The note title
        - content (str): The note body text

    Args:
        data (dict): The incoming JSON data.

    Returns:
        tuple: (True, None) if valid, (False, error_message) if invalid.
    """
    if not data:
        return False, "Request body is required"
    if not data.get("title", "").strip():
        return False, "Title is required"
    if not data.get("content", "").strip():
        return False, "Content is required"
    return True, None


def validate_flashcard(data):
    """
    Validate data for creating a flashcard.

    Required fields:
        - question (str): The front of the card
        - answer (str): The back of the card

    Args:
        data (dict): The incoming JSON data.

    Returns:
        tuple: (True, None) if valid, (False, error_message) if invalid.
    """
    if not data:
        return False, "Request body is required"
    if not data.get("question", "").strip():
        return False, "Question is required"
    if not data.get("answer", "").strip():
        return False, "Answer is required"
    return True, None


def validate_chat_message(data):
    """
    Validate data for a chat message.

    Required fields:
        - message (str): The user's message

    Args:
        data (dict): The incoming JSON data.

    Returns:
        tuple: (True, None) if valid, (False, error_message) if invalid.
    """
    if not data:
        return False, "Request body is required"
    if not data.get("message", "").strip():
        return False, "Message is required"
    return True, None


def validate_quiz_request(data):
    """
    Validate data for generating a quiz.

    Required fields:
        - topic (str): The topic to generate questions about

    Optional fields:
        - num_questions (int): Number of questions (default: 5)

    Args:
        data (dict): The incoming JSON data.

    Returns:
        tuple: (True, None) if valid, (False, error_message) if invalid.
    """
    if not data:
        return False, "Request body is required"
    if not data.get("topic", "").strip():
        return False, "Topic is required"
    return True, None
