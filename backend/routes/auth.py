from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from models import db_session
from routes.deps import create_token

router = APIRouter(prefix="/api", tags=["auth"])


class LoginRequest(BaseModel):
    role: str
    user_id: int | None = None


@router.post("/login")
def login(body: LoginRequest, db=Depends(db_session)):
    role = body.role.lower()
    if role not in ("speaker", "organizer", "sponsor"):
        raise HTTPException(status_code=400, detail="Invalid role")

    if role == "speaker":
        if not body.user_id:
            raise HTTPException(status_code=400, detail="user_id required for speaker login")
        user = db.execute(
            "SELECT id, name FROM users WHERE id = ? AND role = 'speaker'",
            (body.user_id,),
        ).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Speaker not found")

        talks = db.execute(
            "SELECT id, title, track FROM talks WHERE speaker_id = ?",
            (user["id"],),
        ).fetchall()

        return {
            "user_id": user["id"],
            "name": user["name"],
            "role": "speaker",
            "talks": [dict(t) for t in talks],
            "token": create_token("speaker"),
        }

    if role == "organizer":
        user = db.execute(
            "SELECT id, name FROM users WHERE role = 'organizer'"
        ).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="No organizer found")

        talks = db.execute("SELECT id, title, track FROM talks").fetchall()
        return {
            "user_id": user["id"],
            "name": user["name"],
            "role": "organizer",
            "talks": [dict(t) for t in talks],
            "token": create_token("organizer"),
        }

    if role == "sponsor":
        user = db.execute(
            "SELECT id, name FROM users WHERE role = 'sponsor'"
        ).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="No sponsor found")

        talks = db.execute("SELECT id, title, track FROM talks").fetchall()
        return {
            "user_id": user["id"],
            "name": user["name"],
            "role": "sponsor",
            "talks": [dict(t) for t in talks],
            "token": create_token("sponsor"),
        }

    raise HTTPException(status_code=400, detail="Invalid role")
