import sqlite3
import os
from pathlib import Path

DATA_DIR = Path("/data")
DB_PATH = str(DATA_DIR / "crowdshift.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL CHECK(role IN ('speaker', 'organizer', 'sponsor'))
);

CREATE TABLE IF NOT EXISTS talks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    speaker_id INTEGER NOT NULL REFERENCES users(id),
    track TEXT NOT NULL,
    time_slot TEXT,
    description TEXT,
    capacity INTEGER NOT NULL,
    hotness REAL NOT NULL DEFAULT 0.5
);

CREATE TABLE IF NOT EXISTS attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    age INTEGER,
    role TEXT,
    company TEXT,
    country TEXT,
    ticket_type TEXT,
    registered_at TEXT NOT NULL,
    tech_interests TEXT,
    experience_years INTEGER,
    goal TEXT,
    familiarity INTEGER DEFAULT 3,
    expectations TEXT,
    first_time INTEGER DEFAULT 1,
    attendance_mode TEXT DEFAULT 'in-person',
    company_size TEXT DEFAULT '11-50',
    evaluating INTEGER DEFAULT 0,
    evaluating_category TEXT
);

CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attendee_id INTEGER NOT NULL REFERENCES attendees(id),
    talk_id INTEGER NOT NULL REFERENCES talks(id),
    registered_at TEXT NOT NULL,
    UNIQUE(attendee_id, talk_id)
);

CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    talk_id INTEGER NOT NULL REFERENCES talks(id),
    label TEXT NOT NULL,
    cutoff_date TEXT NOT NULL,
    attendee_count INTEGER NOT NULL,
    pct INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS briefs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    talk_id INTEGER NOT NULL REFERENCES talks(id),
    snapshot_id INTEGER NOT NULL REFERENCES snapshots(id),
    headline TEXT,
    audience_profile TEXT,
    shift_alert TEXT,
    recommendations TEXT,
    tone TEXT,
    generated_at TEXT
);

CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attendee_id INTEGER NOT NULL REFERENCES attendees(id),
    talk_id INTEGER NOT NULL REFERENCES talks(id),
    question_text TEXT NOT NULL,
    submitted_at TEXT NOT NULL
);
"""


def get_db() -> sqlite3.Connection:
    """Return a new connection. Caller must close it."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def db_session():
    """FastAPI dependency — guarantees close on any exit path."""
    db = get_db()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables if they don't exist."""
    conn = get_db()
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()
