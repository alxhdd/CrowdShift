import secrets
from fastapi import Header, HTTPException

SESSIONS: dict[str, str] = {}


def create_token(role: str) -> str:
    token = secrets.token_urlsafe(24)
    SESSIONS[token] = role
    return token


def require_role(*allowed):
    def check(authorization: str = Header("")):
        token = authorization.removeprefix("Bearer ").strip()
        role = SESSIONS.get(token)
        if role not in allowed:
            raise HTTPException(403, "Not authorized for this data")
        return role
    return check
