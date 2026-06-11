import json
from fastapi import APIRouter, HTTPException
from models import get_db

router = APIRouter(prefix="/api", tags=["talks"])


@router.get("/talks")
def list_talks():
    db = get_db()
    rows = db.execute(
        """SELECT t.id, t.title, t.track, t.description, t.capacity,
                  u.name AS speaker_name
           FROM talks t
           JOIN users u ON u.id = t.speaker_id
           ORDER BY t.track, t.id"""
    ).fetchall()
    db.close()
    return [dict(r) for r in rows]


@router.get("/talks/{talk_id}")
def get_talk(talk_id: int):
    db = get_db()
    talk = db.execute(
        """SELECT t.id, t.title, t.track, t.description, t.capacity,
                  u.name AS speaker_name
           FROM talks t
           JOIN users u ON u.id = t.speaker_id
           WHERE t.id = ?""",
        (talk_id,),
    ).fetchone()
    db.close()
    if not talk:
        raise HTTPException(status_code=404, detail="Talk not found")
    return dict(talk)


@router.get("/talks/{talk_id}/snapshots")
def talk_snapshots(talk_id: int):
    db = get_db()
    rows = db.execute(
        """SELECT id, talk_id, label, cutoff_date, attendee_count, pct
           FROM snapshots
           WHERE talk_id = ?
           ORDER BY pct ASC""",
        (talk_id,),
    ).fetchall()
    db.close()
    return [dict(r) for r in rows]


@router.get("/talks/{talk_id}/demographics")
def talk_demographics(talk_id: int, snapshot_id: int):
    db = get_db()

    snap = db.execute(
        "SELECT cutoff_date, attendee_count FROM snapshots WHERE id = ?",
        (snapshot_id,),
    ).fetchone()
    if not snap:
        db.close()
        raise HTTPException(status_code=404, detail="Snapshot not found")

    cutoff = snap["cutoff_date"]
    total = snap["attendee_count"]

    if total == 0:
        db.close()
        return {
            "snapshot_id": snapshot_id,
            "total": 0,
            "age_groups": {},
            "tech_stacks": [],
            "roles": [],
            "goals": [],
        }

    rows = db.execute(
        """SELECT a.age, a.role, a.tech_interests, a.goal, a.ticket_type,
                  a.experience_years, a.company, a.country
           FROM attendees a
           JOIN registrations r ON r.attendee_id = a.id
           WHERE r.talk_id = ?
             AND r.registered_at <= ?""",
        (talk_id, cutoff),
    ).fetchall()
    db.close()

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

    # Sort by count descending
    tech_sorted = sorted(tech_counter.items(), key=lambda x: x[1], reverse=True)
    role_sorted = sorted(role_counter.items(), key=lambda x: x[1], reverse=True)
    goal_sorted = sorted(goal_counter.items(), key=lambda x: x[1], reverse=True)

    return {
        "snapshot_id": snapshot_id,
        "total": total,
        "age_groups": age_groups,
        "tech_stacks": [{"name": t, "count": c} for t, c in tech_sorted[:10]],
        "roles": [{"name": t, "count": c} for t, c in role_sorted],
        "goals": [{"name": t, "count": c} for t, c in goal_sorted[:8]],
    }


@router.get("/talks/{talk_id}/brief")
def talk_brief(talk_id: int, snapshot_id: int):
    db = get_db()
    row = db.execute(
        """SELECT id, headline, audience_profile, shift_alert,
                  recommendations, tone, generated_at
           FROM briefs
           WHERE talk_id = ? AND snapshot_id = ?""",
        (talk_id, snapshot_id),
    ).fetchone()
    db.close()

    if not row:
        return {
            "headline": "No brief generated yet",
            "audience_profile": "",
            "shift_alert": None,
            "recommendations": [],
            "tone": "neutral",
        }

    result = dict(row)
    try:
        result["recommendations"] = json.loads(result["recommendations"] or "[]")
    except (json.JSONDecodeError, TypeError):
        result["recommendations"] = []
    return result


@router.get("/talks/{talk_id}/questions")
def talk_questions(talk_id: int):
    db = get_db()
    rows = db.execute(
        """SELECT q.id, q.question_text, q.submitted_at, a.name AS attendee_name
           FROM questions q
           JOIN attendees a ON a.id = q.attendee_id
           WHERE q.talk_id = ?
           ORDER BY q.submitted_at ASC""",
        (talk_id,),
    ).fetchall()
    db.close()
    return [dict(r) for r in rows]
