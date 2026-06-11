"""
Pre-generate AI briefs for hero talks.

Run inside the Docker container or with DB accessible:
  python generate_briefs.py

Requires: GEMINI_API_KEY env var (falls back to rules-based if missing).
"""

import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from models import get_db
from agent import generate_brief

HERO_TALK_IDS = [1, 5]  # Sarah Chen (s1), Marcus Webb (s5)


def get_demographics_at_snapshot(db, talk_id: int, cutoff: str) -> dict:
    rows = db.execute(
        """SELECT a.age, a.role, a.tech_interests, a.goal
           FROM attendees a
           JOIN registrations r ON r.attendee_id = a.id
           WHERE r.talk_id = ? AND r.registered_at <= ?""",
        (talk_id, cutoff),
    ).fetchall()

    age_groups = {"18-25": 0, "26-35": 0, "36-45": 0, "46+": 0}
    tech_counter = {}
    role_counter = {}
    goal_counter = {}

    for r in rows:
        age = r["age"] or 0
        if age <= 25:
            age_groups["18-25"] += 1
        elif age <= 35:
            age_groups["26-35"] += 1
        elif age <= 45:
            age_groups["36-45"] += 1
        else:
            age_groups["46+"] += 1

        try:
            interests = json.loads(r["tech_interests"] or "[]")
        except (json.JSONDecodeError, TypeError):
            interests = []
        for tech in interests:
            tech_counter[tech] = tech_counter.get(tech, 0) + 1

        role = r["role"] or "Unknown"
        role_counter[role] = role_counter.get(role, 0) + 1

        goal = r["goal"] or ""
        if goal:
            goal_counter[goal] = goal_counter.get(goal, 0) + 1

    return {
        "age_groups": age_groups,
        "tech_stacks": sorted(tech_counter.items(), key=lambda x: x[1], reverse=True),
        "roles": sorted(role_counter.items(), key=lambda x: x[1], reverse=True),
        "goals": sorted(goal_counter.items(), key=lambda x: x[1], reverse=True),
    }


def run():
    db = get_db()

    for talk_id in HERO_TALK_IDS:
        talk = db.execute(
            "SELECT title FROM talks WHERE id = ?", (talk_id,)
        ).fetchone()
        if not talk:
            print(f"Talk {talk_id} not found, skipping")
            continue

        title = talk["title"]
        print(f"\n--- {title} ---")

        snaps = db.execute(
            """SELECT id, label, cutoff_date, attendee_count
               FROM snapshots WHERE talk_id = ?
               ORDER BY pct ASC""",
            (talk_id,),
        ).fetchall()

        prev = None
        for snap in snaps:
            demog = get_demographics_at_snapshot(db, talk_id, snap["cutoff_date"])

            tech_stacks = [{"name": n, "count": c} for n, c in demog["tech_stacks"][:10]]
            roles = [{"name": n, "count": c} for n, c in demog["roles"]]
            goals = [{"name": n, "count": c} for n, c in demog["goals"][:8]]

            print(f"  {snap['label']} ({snap['attendee_count']} attendees)...", end=" ")

            brief = generate_brief(
                talk_title=title,
                snapshot_label=snap["label"],
                total=snap["attendee_count"],
                age_groups=demog["age_groups"],
                tech_stacks=tech_stacks,
                roles=roles,
                goals=goals,
                prev_label=prev["label"] if prev else None,
                prev_total=prev["attendee_count"] if prev else None,
            )

            from datetime import datetime
            now = datetime.utcnow().isoformat()

            db.execute(
                """INSERT OR REPLACE INTO briefs
                   (talk_id, snapshot_id, headline, audience_profile,
                    shift_alert, recommendations, tone, generated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    talk_id, snap["id"],
                    brief["headline"],
                    brief["audience_profile"],
                    brief.get("shift_alert"),
                    json.dumps(brief.get("recommendations", [])),
                    brief.get("tone", "neutral"),
                    now,
                ),
            )
            print("done")

            prev = snap

    db.commit()
    db.close()
    print("\nAll briefs generated!")


if __name__ == "__main__":
    run()
