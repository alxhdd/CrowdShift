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

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()

    db.execute(
        """INSERT INTO questions (attendee_id, talk_id, question_text, submitted_at)
           VALUES (?, ?, ?, ?)""",
        (attendee["id"], body.talk_id, body.question_text, now),
    )
    db.commit()
    db.close()

    return {"status": "ok", "message": "Question submitted"}


@router.get("/attendee/lookup")
def lookup_attendee(ticket_id: str):
    db = get_db()

    attendee = db.execute(
        "SELECT id, name FROM attendees WHERE ticket_id = ?",
        (ticket_id,),
    ).fetchone()

    if not attendee:
        db.close()
        raise HTTPException(status_code=400, detail="Invalid ticket ID")

    talks = db.execute(
        """SELECT t.id, t.title, t.track
           FROM talks t
           JOIN registrations r ON r.talk_id = t.id
           WHERE r.attendee_id = ?
           ORDER BY t.track, t.title""",
        (attendee["id"],),
    ).fetchall()

    db.close()

    return {
        "name": attendee["name"],
        "registered_talks": [dict(t) for t in talks],
    }


@router.get("/attendees")
def list_attendees():
    db = get_db()
    rows = db.execute(
        """SELECT id, ticket_id, name, email, age, role, company, country,
                  ticket_type, registered_at, experience_years, goal,
                  tech_interests, familiarity, expectations, first_time,
                  attendance_mode, company_size, evaluating, evaluating_category
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
    exp_sum = 0

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

        exp_sum += r["experience_years"] or 0

    tech_sorted = sorted(tech_counter.items(), key=lambda x: x[1], reverse=True)
    role_sorted = sorted(role_counter.items(), key=lambda x: x[1], reverse=True)
    country_sorted = sorted(country_counter.items(), key=lambda x: x[1], reverse=True)
    total = len(rows)

    return {
        "total": total,
        "age_groups": age_groups,
        "tech_stacks": [{"name": t, "count": c} for t, c in tech_sorted[:10]],
        "roles": [{"name": t, "count": c} for t, c in role_sorted],
        "countries": [{"name": t, "count": c} for t, c in country_sorted[:10]],
        "avg_experience": round(exp_sum / total, 1) if total > 0 else 0,
    }


@router.get("/attendees/cohorts")
def attendee_cohorts():
    db = get_db()

    rows = db.execute(
        "SELECT role, experience_years, tech_interests, goal, company_size, evaluating FROM attendees"
    ).fetchall()

    total = len(rows)
    cohorts = {}

    for r in rows:
        role = (r["role"] or "Other").strip()
        exp = r["experience_years"] or 0
        if exp <= 3:
            band = "0-3 yrs"
        elif exp <= 8:
            band = "4-8 yrs"
        else:
            band = "9+ yrs"

        cs = r["company_size"] or "—"
        key = f"{role}, {band}"

        try:
            interests = json.loads(r["tech_interests"] or "[]")
        except (json.JSONDecodeError, TypeError):
            interests = []

        evaluating = r["evaluating"] if r["evaluating"] else 0

        if key not in cohorts:
            cohorts[key] = {"count": 0, "interests": {}, "evaluating": 0, "company_sizes": {}}

        cohorts[key]["count"] += 1
        if evaluating:
            cohorts[key]["evaluating"] += 1
        cohorts[key]["company_sizes"][cs] = cohorts[key]["company_sizes"].get(cs, 0) + 1
        for tech in interests:
            cohorts[key]["interests"][tech] = cohorts[key]["interests"].get(tech, 0) + 1

    db.close()

    result = []
    for name, data in sorted(cohorts.items(), key=lambda x: x[1]["count"], reverse=True):
        if data["count"] < 5:
            continue
        top = sorted(data["interests"].items(), key=lambda x: x[1], reverse=True)
        top_cs = sorted(data["company_sizes"].items(), key=lambda x: x[1], reverse=True)
        result.append({
            "segment": name,
            "count": data["count"],
            "pct": round(data["count"] / total * 100, 1),
            "top_interest": top[0][0] if top else "—",
            "evaluating_pct": round(data["evaluating"] / data["count"] * 100) if data["count"] > 0 else 0,
            "top_company_size": top_cs[0][0] if top_cs else "—",
        })

    return result
