import json
from fastapi import APIRouter, HTTPException, Depends
from models import get_db, db_session

router = APIRouter(prefix="/api", tags=["talks"])


@router.get("/talks")
def list_talks(db=Depends(db_session)):
    rows = db.execute(
        """SELECT t.id, t.title, t.track, t.description, t.capacity,
                  u.name AS speaker_name
           FROM talks t
           JOIN users u ON u.id = t.speaker_id
           ORDER BY t.track, t.id"""
    ).fetchall()
    return [dict(r) for r in rows]


@router.get("/talks/{talk_id}")
def get_talk(talk_id: int, db=Depends(db_session)):
    talk = db.execute(
        """SELECT t.id, t.title, t.track, t.description, t.capacity,
                  u.name AS speaker_name
           FROM talks t
           JOIN users u ON u.id = t.speaker_id
           WHERE t.id = ?""",
        (talk_id,),
    ).fetchone()
    if not talk:
        raise HTTPException(status_code=404, detail="Talk not found")
    return dict(talk)


@router.get("/talks/{talk_id}/snapshots")
def talk_snapshots(talk_id: int, db=Depends(db_session)):
    rows = db.execute(
        """SELECT id, talk_id, label, cutoff_date, attendee_count, pct
           FROM snapshots
           WHERE talk_id = ?
           ORDER BY pct ASC""",
        (talk_id,),
    ).fetchall()
    return [dict(r) for r in rows]


@router.get("/talks/{talk_id}/demographics")
def talk_demographics(talk_id: int, snapshot_id: int, db=Depends(db_session)):
    snap = db.execute(
        "SELECT cutoff_date, attendee_count FROM snapshots WHERE id = ?",
        (snapshot_id,),
    ).fetchone()
    if not snap:
        raise HTTPException(status_code=404, detail="Snapshot not found")

    cutoff = snap["cutoff_date"]
    total = snap["attendee_count"]

    if total == 0:
        return {
            "snapshot_id": snapshot_id,
            "total": 0,
            "age_groups": {},
            "tech_stacks": [],
            "roles": [],
            "goals": [],
            "familiarity_avg": 0,
            "first_time_pct": 0,
            "online_count": 0,
            "avg_experience": 0,
        }

    rows = db.execute(
        """SELECT a.age, a.role, a.tech_interests, a.goal, a.ticket_type,
                  a.experience_years, a.company, a.country,
                  a.familiarity, a.first_time, a.attendance_mode
           FROM attendees a
           JOIN registrations r ON r.attendee_id = a.id
           WHERE r.talk_id = ?
             AND r.registered_at <= ?""",
        (talk_id, cutoff),
    ).fetchall()

    age_groups = {"18-25": 0, "26-35": 0, "36-45": 0, "46+": 0}
    tech_counter = {}
    role_counter = {}
    goal_counter = {}
    familiarity_sum = 0
    familiarity_count = 0
    first_time_count = 0
    online_count = 0
    exp_sum = 0

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

        fam = r["familiarity"]
        if fam is not None:
            familiarity_sum += fam
            familiarity_count += 1

        if r["first_time"]:
            first_time_count += 1

        if r["attendance_mode"] == "online":
            online_count += 1

        exp_sum += r["experience_years"] or 0

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
        "familiarity_avg": round(familiarity_sum / familiarity_count, 1) if familiarity_count > 0 else 0,
        "first_time_pct": round(first_time_count / total * 100) if total > 0 else 0,
        "online_count": online_count,
        "avg_experience": round(exp_sum / total, 1) if total > 0 else 0,
    }


@router.get("/talks/{talk_id}/brief")
def talk_brief(talk_id: int, snapshot_id: int, db=Depends(db_session)):
    row = db.execute(
        """SELECT id, headline, audience_profile, shift_alert,
                  recommendations, tone, generated_at
           FROM briefs
           WHERE talk_id = ? AND snapshot_id = ?""",
        (talk_id, snapshot_id),
    ).fetchone()

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


@router.post("/talks/{talk_id}/brief")
def generate_talk_brief(talk_id: int, snapshot_id: int):
    from datetime import datetime, timezone
    from agent import generate_brief

    db = get_db()
    try:
        talk = db.execute("SELECT title FROM talks WHERE id = ?", (talk_id,)).fetchone()
        if not talk:
            raise HTTPException(status_code=404, detail="Talk not found")

        snap = db.execute(
            "SELECT id, label, cutoff_date, attendee_count, pct FROM snapshots WHERE id = ?",
            (snapshot_id,),
        ).fetchone()
        if not snap:
            raise HTTPException(status_code=404, detail="Snapshot not found")

        cutoff = snap["cutoff_date"]
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

        tech_sorted = sorted(tech_counter.items(), key=lambda x: x[1], reverse=True)
        role_sorted = sorted(role_counter.items(), key=lambda x: x[1], reverse=True)
        goal_sorted = sorted(goal_counter.items(), key=lambda x: x[1], reverse=True)

        talk_title = talk["title"]
        snap_label = snap["label"]
        snap_id = snap["id"]
        snap_total = snap["attendee_count"]
        snap_pct = snap["pct"]
        tech_stacks = [{"name": n, "count": c} for n, c in tech_sorted[:10]]
        roles = [{"name": n, "count": c} for n, c in role_sorted]
        goals = [{"name": n, "count": c} for n, c in goal_sorted[:8]]

        prev_row = db.execute(
            "SELECT label, attendee_count FROM snapshots WHERE talk_id = ? AND pct < ? ORDER BY pct DESC LIMIT 1",
            (talk_id, snap_pct),
        ).fetchone()
        prev_label = prev_row["label"] if prev_row else None
        prev_total = prev_row["attendee_count"] if prev_row else None
    finally:
        db.close()

    brief = generate_brief(
        talk_title=talk_title,
        snapshot_label=snap_label,
        total=snap_total,
        age_groups=age_groups,
        tech_stacks=tech_stacks,
        roles=roles,
        goals=goals,
        prev_label=prev_label,
        prev_total=prev_total,
    )

    headline = brief.get("headline", "Brief generated")
    audience_profile = brief.get("audience_profile", "")
    shift_alert = brief.get("shift_alert")
    recommendations = brief.get("recommendations", [])
    tone = brief.get("tone", "neutral")

    db = get_db()
    try:
        now = datetime.now(timezone.utc).isoformat()
        db.execute(
            """INSERT OR REPLACE INTO briefs
               (talk_id, snapshot_id, headline, audience_profile,
                shift_alert, recommendations, tone, generated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (talk_id, snap_id, headline, audience_profile,
             shift_alert, json.dumps(recommendations), tone, now),
        )
        db.commit()
    finally:
        db.close()

    return {
        "headline": headline,
        "audience_profile": audience_profile,
        "shift_alert": shift_alert,
        "recommendations": recommendations,
        "tone": tone,
    }


@router.get("/talks/{talk_id}/questions")
def talk_questions(talk_id: int, db=Depends(db_session)):
    rows = db.execute(
        """SELECT q.id, q.question_text, q.submitted_at, a.name AS attendee_name
           FROM questions q
           JOIN attendees a ON a.id = q.attendee_id
           WHERE q.talk_id = ?
           ORDER BY q.submitted_at ASC""",
        (talk_id,),
    ).fetchall()
    return [dict(r) for r in rows]
