"""
Developer archetype classification.

K-means clusters a developer's 5 score vector against the score vectors of
every previously analyzed profile (stored in Postgres), then labels the
resulting cluster by characterizing its centroid. Naming off the centroid
rather than the raw cluster index keeps labels meaningful even though
k-means' cluster indices are arbitrary and shift every time the model is
refit against a growing history.
"""

import numpy as np
from sklearn.cluster import KMeans

SCORE_KEYS = [
    "language_diversity_score",
    "commit_consistency_score",
    "project_depth_score",
    "collaboration_index",
    "activity_recency_score",
]

MIN_HISTORY_FOR_CLUSTERING = 6


def _vector(scores: dict[str, float]) -> list[float]:
    return [scores.get(k, 0.0) for k in SCORE_KEYS]


def _label_centroid(centroid: np.ndarray) -> tuple[str, str]:
    diversity, consistency, depth, collab, recency = centroid

    if depth >= 7 and diversity <= 4:
        return (
            "Deep Specialist",
            "Goes deep on a narrow set of languages and projects rather than spreading wide.",
        )
    if collab >= 6 and diversity >= 5:
        return (
            "Community Polyglot",
            "Works across many languages and is highly active contributing to others' projects.",
        )
    if consistency >= 7 and recency >= 7:
        return (
            "Steady Grinder",
            "Ships consistently, week after week, without big gaps.",
        )
    if recency >= 7 and consistency < 5:
        return (
            "Bursty Sprinter",
            "Recently very active, but activity comes in bursts rather than a steady rhythm.",
        )
    if collab >= 5:
        return (
            "Community Builder",
            "Spends significant time collaborating on other people's repositories.",
        )
    if diversity >= 6:
        return (
            "Generalist",
            "Comfortable moving across a wide range of languages and tech stacks.",
        )
    if float(np.mean(centroid)) < 3:
        return (
            "Just Getting Started",
            "Early-stage GitHub footprint with room to build consistent habits.",
        )
    return (
        "Balanced Contributor",
        "No single standout trait — a well-rounded mix across all five dimensions.",
    )


def assign_archetype(
    scores: dict[str, float], historical_vectors: list[list[float]]
) -> tuple[str, str]:
    current = _vector(scores)

    if len(historical_vectors) < MIN_HISTORY_FOR_CLUSTERING:
        # Not enough previously analyzed profiles to cluster meaningfully —
        # label directly off this profile's own vector instead. Archetypes
        # get sharper as more users get analyzed and cached.
        return _label_centroid(np.array(current))

    data = np.array(historical_vectors + [current])
    k = min(5, max(2, len(data) // 4))
    model = KMeans(n_clusters=k, n_init=10, random_state=42)
    labels = model.fit_predict(data)
    my_cluster = labels[-1]
    centroid = model.cluster_centers_[my_cluster]
    return _label_centroid(centroid)
