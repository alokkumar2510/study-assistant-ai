"""
app/models/user.py — PREPIFY user model with JSON persistence
Stores: id, username, email, password_hash, created_at, api_usage {date: count}
"""

import os, json, uuid, bcrypt
from datetime import date, datetime
from config import DATA_DIR

USERS_FILE = os.path.join(DATA_DIR, "users.json")


def _load() -> list:
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r") as f:
        return json.load(f)


def _save(users: list):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)


# ── Public helpers ────────────────────────────────────────────────────────────

def create_user(username: str, email: str, password: str) -> dict:
    users = _load()
    # Check uniqueness
    if any(u["username"].lower() == username.lower() for u in users):
        raise ValueError("Username already taken.")
    if any(u["email"].lower() == email.lower() for u in users):
        raise ValueError("Email already registered.")

    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = {
        "id":           str(uuid.uuid4()),
        "username":     username,
        "email":        email,
        "password_hash": pw_hash,
        "created_at":   datetime.utcnow().isoformat(),
        "api_usage":    {}   # {"2026-03-20": 42}
    }
    users.append(user)
    _save(users)
    return _public(user)


def verify_user(username: str, password: str) -> dict | None:
    """Return public user dict if credentials match, else None."""
    users = _load()
    user  = next((u for u in users if u["username"].lower() == username.lower()), None)
    if user and bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return _public(user)
    return None


def get_user_by_id(user_id: str) -> dict | None:
    users = _load()
    user  = next((u for u in users if u["id"] == user_id), None)
    return _public(user) if user else None


def get_usage_today(user_id: str) -> int:
    users = _load()
    user  = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return 0
    today = str(date.today())
    return user.get("api_usage", {}).get(today, 0)


def increment_usage(user_id: str) -> int:
    """Increment today's AI call count. Returns new count."""
    users = _load()
    for user in users:
        if user["id"] == user_id:
            today = str(date.today())
            usage = user.setdefault("api_usage", {})
            usage[today] = usage.get(today, 0) + 1
            _save(users)
            return usage[today]
    return 0


def _public(user: dict) -> dict:
    """Strip password hash before returning to callers."""
    if user is None:
        return None
    return {k: v for k, v in user.items() if k != "password_hash"}
