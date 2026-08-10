"""
Commit rhythm detection.

Clusters a user's PushEvent timestamps by hour-of-day, encoded on a circle
(so 23:00 and 00:00 land next to each other instead of far apart), to find
their dominant coding window.
"""

import math
from datetime import datetime

import numpy as np
from sklearn.cluster import KMeans

MIN_EVENTS_FOR_RHYTHM = 5


def _push_timestamps(events: list[dict]) -> list[datetime]:
    out = []
    for event in events:
        if event.get("type") != "PushEvent":
            continue
        try:
            out.append(datetime.fromisoformat(event["created_at"].replace("Z", "+00:00")))
        except (KeyError, ValueError):
            continue
    return out


def _label_hour(hour: float, weekend_ratio: float) -> tuple[str, str]:
    if weekend_ratio >= 0.4:
        return "Weekend Warrior", "A large share of commits land on Saturday/Sunday."
    if hour < 5 or hour >= 22:
        return "Night Owl", "Most commits happen late at night or after midnight (UTC)."
    if hour < 9:
        return "Early Bird", "Most commits happen early in the morning (UTC)."
    if hour < 18:
        return "9-to-5 Coder", "Commits cluster around typical working hours (UTC)."
    return "Evening Coder", "Most commits happen in the evening, after typical work hours (UTC)."


def detect_commit_rhythm(events: list[dict]) -> tuple[str, str]:
    timestamps = _push_timestamps(events)
    if len(timestamps) < MIN_EVENTS_FOR_RHYTHM:
        return "Not enough data", "Not enough recent push activity to detect a pattern yet."

    hours = np.array([t.hour + t.minute / 60 for t in timestamps])
    weekend_ratio = sum(1 for t in timestamps if t.weekday() >= 5) / len(timestamps)

    angles = hours / 24 * 2 * math.pi
    features = np.column_stack([np.cos(angles), np.sin(angles)])

    k = min(3, len(timestamps))
    model = KMeans(n_clusters=k, n_init=10, random_state=42)
    labels = model.fit_predict(features)

    # Dominant cluster = the user's typical coding window
    counts = np.bincount(labels)
    dominant = int(counts.argmax())
    dom_angle = math.atan2(
        float(np.mean(np.sin(angles[labels == dominant]))),
        float(np.mean(np.cos(angles[labels == dominant]))),
    )
    dom_hour = (dom_angle / (2 * math.pi) * 24) % 24

    return _label_hour(dom_hour, weekend_ratio)
