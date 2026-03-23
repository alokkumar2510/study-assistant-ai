"""
app/models/goals.py — PREPIFY study goals model
"""

import os, json, uuid
from datetime import datetime
from config import DATA_DIR

GOALS_FILE = os.path.join(DATA_DIR, "goals.json")


def _load() -> list:
    if not os.path.exists(GOALS_FILE):
        return []
    with open(GOALS_FILE, "r") as f:
        return json.load(f)


def _save(records: list):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(GOALS_FILE, "w") as f:
        json.dump(records, f, indent=2)


def create_goal(user_id: str, title: str, subject: str = "General", target: int = 100) -> dict:
    records = _load()
    goal = {
        "id":         str(uuid.uuid4()),
        "user_id":    user_id,
        "title":      title,
        "subject":    subject,
        "progress":   0,
        "target":     target,
        "status":     "active",      # active | completed
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    records.append(goal)
    _save(records)
    return goal


def get_goals(user_id: str) -> list:
    records = _load()
    return [g for g in records if g["user_id"] == user_id]


def update_goal(goal_id: str, user_id: str, **kwargs) -> dict | None:
    records = _load()
    for g in records:
        if g["id"] == goal_id and g["user_id"] == user_id:
            for key in ("title", "subject", "progress", "target", "status"):
                if key in kwargs and kwargs[key] is not None:
                    g[key] = kwargs[key]
            # Auto-complete if progress >= target
            if g["progress"] >= g["target"]:
                g["status"] = "completed"
            g["updated_at"] = datetime.utcnow().isoformat()
            _save(records)
            return g
    return None


def delete_goal(goal_id: str, user_id: str) -> bool:
    records = _load()
    filtered = [g for g in records if not (g["id"] == goal_id and g["user_id"] == user_id)]
    if len(filtered) == len(records):
        return False
    _save(filtered)
    return True
