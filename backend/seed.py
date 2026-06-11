import random
import json
from datetime import datetime, timedelta

random.seed(42)

try:
    from faker import Faker
    Faker.seed(42)
except ImportError:
    print("Faker not installed. Run: pip install faker")
    raise

fake = Faker()

# ----------------------------------------------------------------
# Constants
# ----------------------------------------------------------------

EVENT_DATE = datetime(2026, 7, 10)
SALES_OPEN = EVENT_DATE - timedelta(days=75)  # tickets go live 75 days before

ROLES_SENIOR = [
    "Senior Software Engineer", "Staff Engineer", "Engineering Manager",
    "Tech Lead", "Principal Engineer", "CTO", "Solutions Architect",
]
ROLES_MID = [
    "Software Engineer", "Frontend Developer", "Backend Developer",
    "Full-stack Developer", "DevOps Engineer", "Product Manager",
]
ROLES_JUNIOR = [
    "Junior Developer", "CS Student", "Intern", "Bootcamp Graduate",
    "Junior Frontend Developer", "QA Engineer",
]

# Tech pools — attendees draw interests from these
# (this is a JS / React conference, so frontend dominates)
TECH_REACT  = ["React", "TypeScript", "Next.js", "JavaScript", "Tailwind", "Vue"]
TECH_NODE   = ["Node.js", "GraphQL", "PostgreSQL", "AWS", "Go", "Rust"]
TECH_AI     = ["LLMs", "Python", "LangChain", "RAG", "AI Agents", "PyTorch"]

GOALS = [
    "Learn new skills", "Networking", "Job hunting", "Hiring",
    "Evaluating tools for my team", "Speaker fan", "Sent by employer",
]

COUNTRIES = [
    ("United States", 22), ("India", 14), ("United Kingdom", 10),
    ("Germany", 9), ("Poland", 8), ("Brazil", 6), ("Canada", 5),
    ("Netherlands", 4), ("Australia", 4), ("France", 4), ("Sweden", 3),
    ("Nigeria", 2), ("Japan", 2), ("South Korea", 2), ("Czechia", 2),
    ("Spain", 2), ("Italy", 1),
]

# 3 demographic waves — creates the "audience shift" over time
# Early Bird = seniors/architects planning ahead
# Regular   = mid-level devs, conference bread-and-butter
# Student   = juniors / last-minute / promo tickets
WAVES = [
    # (start_day, end_day, n, ticket_label, age_range, roles, tech_pools_with_weights)
    (0,  25, 120, "Early Bird", (30, 55), ROLES_SENIOR,
     [(TECH_REACT, 0.40), (TECH_NODE, 0.40), (TECH_AI, 0.20)]),
    (25, 55, 200, "Regular",    (22, 42), ROLES_MID,
     [(TECH_REACT, 0.55), (TECH_NODE, 0.30), (TECH_AI, 0.15)]),
    (55, 75, 180, "Student",    (18, 26), ROLES_JUNIOR,
     [(TECH_REACT, 0.60), (TECH_NODE, 0.15), (TECH_AI, 0.25)]),
]

# 8 talks — React Summit + JSNation
# hotness (0-1) controls how aggressively the talk fills
SESSIONS = [
    {
        "id_tag": "s1",
        "title": "The Future of React State Management",
        "track": "React Summit",
        "speaker_name": "Sarah Chen",
        "speaker_email": "sarah@example.com",
        "capacity": 100,
        "hotness": 1.0,
        "description": "Zustand, Redux, signals — what's worth learning in 2026?",
        "tags": ["React", "TypeScript", "State Management"],
    },
    {
        "id_tag": "s2",
        "title": "Server Components in Production",
        "track": "React Summit",
        "speaker_name": "Erik Dahl",
        "speaker_email": "erik@example.com",
        "capacity": 80,
        "hotness": 0.70,
        "description": "Lessons from shipping RSC to 100k users.",
        "tags": ["React", "Next.js", "TypeScript"],
    },
    {
        "id_tag": "s3",
        "title": "Building for Accessibility at Scale",
        "track": "React Summit",
        "speaker_name": "Lina Berg",
        "speaker_email": "lina@example.com",
        "capacity": 60,
        "hotness": 0.60,
        "description": "ARIA patterns that survive large codebases.",
        "tags": ["React", "CSS", "TypeScript"],
    },
    {
        "id_tag": "s4",
        "title": "React Performance Anti-Patterns",
        "track": "React Summit",
        "speaker_name": "Omar Farouk",
        "speaker_email": "omar@example.com",
        "capacity": 80,
        "hotness": 0.65,
        "description": "The 5 mistakes every React dev makes.",
        "tags": ["React", "TypeScript", "Next.js"],
    },
    {
        "id_tag": "s5",
        "title": "Scalable APIs in Node.js",
        "track": "JSNation",
        "speaker_name": "Marcus Webb",
        "speaker_email": "marcus@example.com",
        "capacity": 70,
        "hotness": 0.75,
        "description": "From prototype to 10k req/s.",
        "tags": ["TypeScript", "Node.js", "PostgreSQL"],
    },
    {
        "id_tag": "s6",
        "title": "Advanced TypeScript Patterns",
        "track": "JSNation",
        "speaker_name": "Yuki Tanaka",
        "speaker_email": "yuki@example.com",
        "capacity": 100,
        "hotness": 0.90,
        "description": "Template literals, conditional types, and infer.",
        "tags": ["TypeScript", "React", "Next.js"],
    },
    {
        "id_tag": "s7",
        "title": "WebAssembly for JavaScript Devs",
        "track": "JSNation",
        "speaker_name": "Fatima Osei",
        "speaker_email": "fatima@example.com",
        "capacity": 50,
        "hotness": 0.30,
        "description": "Rust compiled to WASM, from a JS dev's perspective.",
        "tags": ["Rust", "TypeScript"],
    },
    {
        "id_tag": "s8",
        "title": "Testing Microservices in 2026",
        "track": "JSNation",
        "speaker_name": "Henrik Holm",
        "speaker_email": "henrik@example.com",
        "capacity": 60,
        "hotness": 0.50,
        "description": "Contract testing, e2e, and when to mock nothing.",
        "tags": ["TypeScript", "Testing", "Go"],
    },
]

# Pre-seeded questions for hero talks (attendee_id set after insertion)
SEED_QUESTIONS_SARAH = [
    "How do you handle async state in Server Components?",
    "Is Redux still worth learning in 2026?",
    "Your abstract mentions signals — will you compare them to hooks?",
    "What's your take on Zustand vs Jotai for smaller projects?",
    "Do you recommend React Query alongside state management libraries?",
    "How do you test complex state transitions?",
    "Any patterns for sharing state between micro-frontends?",
    "What state management would you use for a real-time collab app?",
    "Do signals replace the need for memoization?",
    "How do you decide between lifting state vs using a global store?",
    "Is the Context API sufficient for medium-sized apps?",
    "What's the biggest state management mistake you see teams make?",
]

SEED_QUESTIONS_MARCUS = [
    "What's your preferred logging strategy for Node.js APIs?",
    "How do you handle database connection pooling at scale?",
    "Do you recommend tRPC or REST for internal APIs?",
    "How do you approach rate limiting in a microservices setup?",
    "What monitoring tools do you use in production?",
]


# ----------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------

def weighted_pick(pools):
    """pools is [(pool_list, weight), ...] — pick a pool by weight."""
    r = random.random()
    acc = 0.0
    for pool, w in pools:
        acc += w
        if r <= acc:
            return pool
    return pools[-1][0]


def pick_interests(wave_pools):
    """2-3 tech interests from weighted pools; 30% chance of 1 cross-interest."""
    primary = weighted_pick(wave_pools)
    interests = random.sample(primary, k=min(3, len(primary)))
    if random.random() < 0.3:
        other = weighted_pick(wave_pools)
        extra = random.choice(other)
        if extra not in interests:
            interests.append(extra)
    return interests


def date_from_days(days_offset: int) -> datetime:
    """SALES_OPEN + N days + random hour."""
    return SALES_OPEN + timedelta(
        days=days_offset, hours=random.randint(7, 22)
    )


# ----------------------------------------------------------------
# Main
# ----------------------------------------------------------------

def run():
    from models import get_db, init_db

    init_db()
    conn = get_db()

    # -- 1. Users ---------------------------------------------------
    print("Inserting users...")
    users = [
        ("Sarah Chen", "sarah@example.com", "speaker"),
        ("Marcus Webb", "marcus@example.com", "speaker"),
    ]
    # Filler speakers
    speaker_names = {s["speaker_name"] for s in SESSIONS}
    speaker_names -= {"Sarah Chen", "Marcus Webb"}
    for name in sorted(speaker_names):
        users.append((name, f"{name.split()[0].lower()}@example.com", "speaker"))

    # Organizer + sponsor
    users.append(("Alex Rivera", "alex@example.com", "organizer"))
    users.append(("MegaCorp", "hello@megacorp.example.com", "sponsor"))

    user_map = {}  # name -> id
    for name, email, role in users:
        cur = conn.execute(
            "INSERT INTO users (name, email, role) VALUES (?, ?, ?)",
            (name, email, role),
        )
        user_map[name] = cur.lastrowid
    print(f"  {len(users)} users inserted")

    # -- 2. Talks ---------------------------------------------------
    print("Inserting talks...")
    talk_map = {}  # id_tag -> row id
    for s in SESSIONS:
        cur = conn.execute(
            """INSERT INTO talks
               (title, speaker_id, track, description, capacity, hotness)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (s["title"], user_map[s["speaker_name"]], s["track"],
             s["description"], s["capacity"], s["hotness"]),
        )
        talk_map[s["id_tag"]] = cur.lastrowid
    print(f"  {len(SESSIONS)} talks inserted")

    # -- 3. Attendees (500) -----------------------------------------
    print("Generating 500 attendees...")
    attendees = []  # list of dicts
    a_idx = 0

    for start_day, end_day, n, ticket, ages, roles, pools in WAVES:
        for _ in range(n):
            # Registration date accelerates toward the end (triangular)
            day_offset = int(random.triangular(start_day, end_day, end_day))
            primary_pool = weighted_pick(pools)
            interests = random.sample(primary_pool, k=min(3, len(primary_pool)))
            if random.random() < 0.3:
                other = weighted_pick(pools)
                extra = random.choice(other)
                if extra not in interests:
                    interests.append(extra)
            interests = list(dict.fromkeys(interests))

            exp_map = {"Early Bird": random.randint(6, 20),
                       "Regular": random.randint(2, 8),
                       "Student": random.randint(0, 2)}

            attendee = {
                "ticket_id": f"TKT-{a_idx:04d}",
                "name": fake.name(),
                "email": fake.email(),
                "age": random.randint(*ages),
                "role": random.choice(roles),
                "company": fake.company(),
                "country": random.choices(
                    [c[0] for c in COUNTRIES],
                    weights=[c[1] for c in COUNTRIES],
                )[0],
                "ticket_type": ticket,
                "registered_at": date_from_days(day_offset).isoformat(),
                "tech_interests": json.dumps(interests),
                "experience_years": exp_map[ticket],
                "goal": random.choice(GOALS),
            }
            attendees.append(attendee)
            a_idx += 1

    # Sort by registration time (chronological)
    attendees.sort(key=lambda a: a["registered_at"])
    print(f"  {len(attendees)} attendees generated")

    # -- 4. Attendees + Registrations (chronological assignment) ----
    print("Inserting attendees & assigning talks...")
    session_fill = {s["id_tag"]: 0 for s in SESSIONS}
    session_tags = {s["id_tag"]: set(s["tags"]) for s in SESSIONS}
    reg_inserted = 0

    for a_dict in attendees:
        # Insert attendee
        cur = conn.execute(
            """INSERT INTO attendees
               (ticket_id, name, email, age, role, company, country,
                ticket_type, registered_at, tech_interests, experience_years, goal)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (a_dict["ticket_id"], a_dict["name"], a_dict["email"],
             a_dict["age"], a_dict["role"], a_dict["company"],
             a_dict["country"], a_dict["ticket_type"],
             a_dict["registered_at"], a_dict["tech_interests"],
             a_dict["experience_years"], a_dict["goal"]),
        )
        attendee_db_id = cur.lastrowid

        # Assign talks
        interests = set(json.loads(a_dict["tech_interests"]))
        reg_time = a_dict["registered_at"]
        n_talks = random.choices([2, 3, 4], weights=[0.3, 0.5, 0.2])[0]

        scored = []
        for s in SESSIONS:
            sid = s["id_tag"]
            if session_fill[sid] >= s["capacity"]:
                continue
            tag_overlap = len(session_tags[sid] & interests)
            fill_pct = session_fill[sid] / s["capacity"]
            # tag match dominates; room-remaining is a tiebreaker
            score = tag_overlap * 5 + (1.0 - fill_pct) * 2
            scored.append((sid, score))
        scored.sort(key=lambda x: x[1], reverse=True)

        chosen = 0
        for sid, _ in scored:
            if chosen >= n_talks:
                break
            conn.execute(
                """INSERT INTO registrations (attendee_id, talk_id, registered_at)
                   VALUES (?, ?, ?)""",
                (attendee_db_id, talk_map[sid], reg_time),
            )
            session_fill[sid] += 1
            chosen += 1
            reg_inserted += 1

    print(f"  {len(attendees)} attendees, {reg_inserted} registrations")

    # -- 5. Snapshots (per-talk milestones) -------------------------
    print("Computing milestones...")
    milestone_pcts = [(0, "Talk Confirmed"), (25, "25% Full"),
                      (50, "50% Full"), (75, "75% Full"),
                      (100, "Sold Out")]

    snapshot_ids = {}  # (talk_db_id, pct) -> snapshot row id

    for s in SESSIONS:
        talk_db_id = talk_map[s["id_tag"]]
        capacity = s["capacity"]

        # Get all registrations for this talk, sorted by time
        rows = conn.execute(
            """SELECT registered_at FROM registrations
               WHERE talk_id = ?
               ORDER BY registered_at ASC""",
            (talk_db_id,),
        ).fetchall()

        for pct, label in milestone_pcts:
            if pct == 0:
                cutoff = (SALES_OPEN + timedelta(days=1)).isoformat()
                count = 0
            else:
                threshold = int(capacity * pct / 100)
                if len(rows) >= threshold:
                    cutoff = rows[threshold - 1]["registered_at"]
                    count = threshold
                else:
                    # Talk never reached this milestone
                    continue

            cur = conn.execute(
                """INSERT INTO snapshots (talk_id, label, cutoff_date, attendee_count, pct)
                   VALUES (?, ?, ?, ?, ?)""",
                (talk_db_id, label, cutoff, count, pct),
            )
            snapshot_ids[(talk_db_id, pct)] = cur.lastrowid

    print(f"  {len(snapshot_ids)} snapshots created")

    # -- 6. Pre-seeded questions ------------------------------------
    print("Inserting seed questions...")

    # Pick random attendees registered for Sarah's talk
    sarah_talk_id = talk_map["s1"]
    sarah_attendees = conn.execute(
        """SELECT a.id FROM attendees a
           JOIN registrations r ON r.attendee_id = a.id
           WHERE r.talk_id = ?
           ORDER BY a.registered_at ASC""",
        (sarah_talk_id,),
    ).fetchall()

    for i, q_text in enumerate(SEED_QUESTIONS_SARAH):
        if i >= len(sarah_attendees):
            break
        attendee_id = sarah_attendees[i]["id"]
        sub_time = (SALES_OPEN + timedelta(days=random.randint(10, 65),
                                           hours=random.randint(7, 22))).isoformat()
        conn.execute(
            """INSERT INTO questions (attendee_id, talk_id, question_text, submitted_at)
               VALUES (?, ?, ?, ?)""",
            (attendee_id, sarah_talk_id, q_text, sub_time),
        )

    # Marcus's talk
    marcus_talk_id = talk_map["s5"]
    marcus_attendees = conn.execute(
        """SELECT a.id FROM attendees a
           JOIN registrations r ON r.attendee_id = a.id
           WHERE r.talk_id = ?
           ORDER BY a.registered_at ASC""",
        (marcus_talk_id,),
    ).fetchall()

    for i, q_text in enumerate(SEED_QUESTIONS_MARCUS):
        if i >= len(marcus_attendees):
            break
        attendee_id = marcus_attendees[i]["id"]
        sub_time = (SALES_OPEN + timedelta(days=random.randint(10, 65),
                                           hours=random.randint(7, 22))).isoformat()
        conn.execute(
            """INSERT INTO questions (attendee_id, talk_id, question_text, submitted_at)
               VALUES (?, ?, ?, ?)""",
            (attendee_id, marcus_talk_id, q_text, sub_time),
        )

    total_q = len(SEED_QUESTIONS_SARAH) + len(SEED_QUESTIONS_MARCUS)
    print(f"  {total_q} questions seeded")

    # -- Done -------------------------------------------------------
    conn.commit()
    conn.close()

    # Print summary
    print(f"\nDone! crowdfshift.db written.")
    print(f"  {len(attendees)} attendees")
    print(f"  {reg_inserted} registrations")
    print(f"  {len(snapshot_ids)} snapshots")
    print(f"  {total_q} questions")

    # Fill stats per talk
    print("\n  Talk fill rates:")
    for s in SESSIONS:
        sid = s["id_tag"]
        count = session_fill[sid]
        print(f"    {sid}: {count}/{s['capacity']} ({100*count//s['capacity']}%) — {s['title']}")


if __name__ == "__main__":
    run()
