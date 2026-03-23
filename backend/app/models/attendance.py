"""
app/models/attendance.py — PREPIFY attendance model
"""

import os, json, uuid
from datetime import date, datetime
from config import DATA_DIR

ATTENDANCE_FILE = os.path.join(DATA_DIR, "attendance.json")


def _load() -> list:
    if not os.path.exists(ATTENDANCE_FILE):
        return []
    with open(ATTENDANCE_FILE, "r") as f:
        return json.load(f)


def _save(records: list):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(ATTENDANCE_FILE, "w") as f:
        json.dump(records, f, indent=2)


def mark_attendance(user_id: str, status: str = "present") -> dict:
    """Mark attendance for today. status: 'present' | 'absent'"""
    records = _load()
    today   = str(date.today())

    # Upsert — replace if already marked today
    existing = next((r for r in records if r["user_id"] == user_id and r["date"] == today), None)
    if existing:
        existing["status"] = status
        _save(records)
        return existing

    record = {
        "id":         str(uuid.uuid4()),
        "user_id":    user_id,
        "date":       today,
        "status":     status,
        "marked_at":  datetime.utcnow().isoformat(),
    }
    records.append(record)
    _save(records)
    return record


def get_attendance(user_id: str) -> list:
    records = _load()
    return [r for r in records if r["user_id"] == user_id]


def get_stats(user_id: str) -> dict:
    records = sorted(
        [r for r in _load() if r["user_id"] == user_id],
        key=lambda r: r["date"]
    )
    total      = len(records)
    present    = sum(1 for r in records if r["status"] == "present")
    pct        = round(present / total * 100, 1) if total else 0.0

    # Streak: consecutive present days up to today
    today   = str(date.today())
    by_date = {r["date"]: r["status"] for r in records}
    streak  = 0
    from datetime import timedelta
    d = date.today()
    while str(d) in by_date and by_date[str(d)] == "present":
        streak += 1
        d -= timedelta(days=1)

    return {
        "total_days":    total,
        "present_days":  present,
        "absent_days":   total - present,
        "percentage":    pct,
        "current_streak": streak,
    }
