import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models import get_db

router = APIRouter(prefix="/api", tags=["attendees"])


class QuestionRequest(BaseModel):
    ticket_id: str
    talk_id: int
    question_text: str


@router.post("/attendee/question")
def submit_question(body: QuestionRequest):
    db = get_db()

    attendee = db.execute(
        "SELECT id FROM attendees WHERE ticket_id = ?",
        (body.ticket_id,),
    ).fetchone()

    if not attendee:
        db.close()
        raise HTTPException(status_code=400, detail="Invalid ticket ID")

    reg = db.execute(
        "SELECT id FROM registrations WHERE attendee_id = ? AND talk_id = ?",
        (attendee["id"], body.talk_id),
    ).fetchone()

    if not reg:
        db.close()
        raise HTTPException(status_code=400, detail="Not registered for this talk")

    from datetime import datetime
    now = datetime.utcnow().isoformat()

    db.execute(
        """INSERT INTO questions (attendee_id, talk_id, question_text, submitted_at)
           VALUES (?, ?, ?, ?)""",
        (attendee["id"], body.talk_id, body.question_text, now),
    )
    db.commit()
    db.close()

    return {"status": "ok", "message": "Question submitted"}


@router.get("/attendees")
def list_attendees():
    db = get_db()
    rows = db.execute(
        """SELECT id, ticket_id, name, email, age, role, company, country,
                  ticket_type, registered_at, experience_years, goal,
                  tech_interests
           FROM attendees
           ORDER BY registered_at ASC"""
    ).fetchall()
    db.close()
    return [dict(r) for r in rows]


@router.get("/attendees/segments")
def attendee_segments():
    db = get_db()

    rows = db.execute(
        "SELECT tech_interests, role, company, country, age, experience_years FROM attendees"
    ).fetchall()
    db.close()

    tech_counter = {}
    role_counter = {}
    country_counter = {}
    age_groups = {"18-25": 0, "26-35": 0, "36-45": 0, "46+": 0}

    for r in rows:
        try:
            interests = json.loads(r["tech_interests"] or "[]")
        except (json.JSONDecodeError, TypeError):
            interests = []
        for tech in interests:
            tech_counter[tech] = tech_counter.get(tech, 0) + 1

        role = r["role"] or "Unknown"
        role_counter[role] = role_counter.get(role, 0) + 1

        country = r["country"] or "Unknown"
        country_counter[country] = country_counter.get(country, 0) + 1

        age = r["age"] or 0
        if age <= 25:
            age_groups["18-25"] += 1
        elif age <= 35:
            age_groups["26-35"] += 1
        elif age <= 45:
            age_groups["36-45"] += 1
        else:
            age_groups["46+"] += 1

    tech_sorted = sorted(tech_counter.items(), key=lambda x: x[1], reverse=True)
    role_sorted = sorted(role_counter.items(), key=lambda x: x[1], reverse=True)
    country_sorted = sorted(country_counter.items(), key=lambda x: x[1], reverse=True)

    return {
        "total": len(rows),
        "age_groups": age_groups,
        "tech_stacks": [{"name": t, "count": c} for t, c in tech_sorted[:10]],
        "roles": [{"name": t, "count": c} for t, c in role_sorted],
        "countries": [{"name": t, "count": c} for t, c in country_sorted[:10]],
    }
