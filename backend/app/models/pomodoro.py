"""
app/models/pomodoro.py — PREPIFY pomodoro session model
Stores completed pomodoro work sessions per user.
"""

import os, json, uuid
from datetime import date, datetime
from config import DATA_DIR

POMODORO_FILE = os.path.join(DATA_DIR, "pomodoro.json")


def _load() -> list:
    if not os.path.exists(POMODORO_FILE):
        return []
    with open(POMODORO_FILE, "r") as f:
        return json.load(f)


def _save(records: list):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(POMODORO_FILE, "w") as f:
        json.dump(records, f, indent=2)


def save_session(user_id: str, duration_minutes: int, session_type: str = "work") -> dict:
    """Save a completed pomodoro session."""
    records = _load()
    record = {
        "id":               str(uuid.uuid4()),
        "user_id":          user_id,
        "date":             str(date.today()),
        "duration_minutes": duration_minutes,
        "session_type":     session_type,   # work | break | long_break
        "completed_at":     datetime.utcnow().isoformat(),
    }
    records.append(record)
    _save(records)
    return record


def get_sessions(user_id: str) -> list:
    records = _load()
    return [r for r in records if r["user_id"] == user_id]


def get_stats(user_id: str) -> dict:
    records = [r for r in _load() if r["user_id"] == user_id]
    today_str = str(date.today())

    total_sessions = len(records)
    total_minutes = sum(r.get("duration_minutes", 0) for r in records)
    today_sessions = [r for r in records if r["date"] == today_str]
    today_minutes = sum(r.get("duration_minutes", 0) for r in today_sessions)

    # Weekly (last 7 unique dates)
    from datetime import timedelta
    week_ago = str(date.today() - timedelta(days=7))
    week_records = [r for r in records if r["date"] >= week_ago]
    week_minutes = sum(r.get("duration_minutes", 0) for r in week_records)

    # Daily breakdown for the week
    daily = {}
    for r in week_records:
        d = r["date"]
        daily[d] = daily.get(d, 0) + r.get("duration_minutes", 0)

    return {
        "total_sessions": total_sessions,
        "total_minutes":  total_minutes,
        "today_sessions": len(today_sessions),
        "today_minutes":  today_minutes,
        "week_minutes":   week_minutes,
        "daily_breakdown": daily,
    }
