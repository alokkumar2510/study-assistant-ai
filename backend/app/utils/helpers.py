"""
helpers.py
----------
Miscellaneous helper functions used across the application.
"""

import uuid
from datetime import datetime, timezone


def generate_id():
    """
    Generate a unique ID string.

    Returns:
        str: A short unique identifier (first 8 chars of a UUID).
    """
    return str(uuid.uuid4())[:8]


def get_timestamp():
    """
    Get the current UTC timestamp as an ISO format string.

    Returns:
        str: Current time in ISO 8601 format (e.g., "2026-03-19T16:00:00Z").
    """
    return datetime.now(timezone.utc).isoformat()
