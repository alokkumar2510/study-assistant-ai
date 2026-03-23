"""
file_handler.py
---------------
Utility functions for reading and writing JSON data files.
This centralizes all file I/O so that if we switch to a database
later, we only need to change this one file.
"""

import json
import os


def read_json(filepath):
    """
    Read data from a JSON file.

    Args:
        filepath (str): Absolute path to the JSON file.

    Returns:
        list | dict: The parsed JSON data. Returns an empty list
                     if the file doesn't exist or is empty.
    """
    # If the file doesn't exist yet, return an empty list
    if not os.path.exists(filepath):
        return []

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data
    except (json.JSONDecodeError, IOError):
        # If the file is corrupted or unreadable, return empty list
        return []


def write_json(filepath, data):
    """
    Write data to a JSON file.

    Args:
        filepath (str): Absolute path to the JSON file.
        data (list | dict): The data to write.

    Returns:
        bool: True if write was successful, False otherwise.
    """
    try:
        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        with open(filepath, "w", encoding="utf-8") as f:
            # indent=2 makes the JSON human-readable
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except IOError as e:
        print(f"Error writing to {filepath}: {e}")
        return False
