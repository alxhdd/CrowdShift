# CrowdShift

> Built for the [Progress x GitNation Hackathon](https://www.hackathonparty.com/hackathons/43) — "Build the tools that make tech events more meaningful."

CrowdShift gives conference speakers a real-time audience intelligence brief before they walk on stage. As attendees register for a talk, the system aggregates their demographics — age groups, tech stacks, roles, and goals — and uses an AI agent to generate an actionable speaker brief: who's in the room, what they care about, and how to tailor the talk for maximum impact.

---

## The Problem

Speakers prepare talks months in advance, then walk on stage knowing almost nothing about the actual audience. Are they junior devs who need a gentle intro, or senior engineers who want production patterns? CrowdShift answers that question before the first slide.

---

## How It Works

1. **Attendees register** for individual talks (seeded via realistic synthetic data).
2. **Snapshots** are taken at regular registration milestones (e.g. 25%, 50%, 75% capacity) to capture how the audience evolves over time.
3. **Speakers request a brief** for any snapshot — the backend computes live demographics and calls the Gemini AI agent.
4. **The AI agent** (Gemini 2.0 Flash) returns a structured brief: a punchy headline, an audience profile, a shift alert comparing the latest vs. previous snapshot, three concrete recommendations, and a suggested tone (technical / balanced / introductory).
5. **The dashboard** — built with Kendo UI for React — lets speakers and organizers browse talks, explore demographic breakdowns via charts, and view AI-generated briefs side by side with the data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript, Vite, React Router |
| UI Components | [Kendo UI for React](https://www.telerik.com/kendo-react-ui) (required by hackathon) |
| Backend | FastAPI (Python), SQLite |
| AI Agent | Gemini 2.0 Flash via OpenAI-compatible API |
| Infrastructure | Docker + Docker Compose |

---

## Features

- **Role-based login** — Speaker, Organizer, and Sponsor views
- **Talk demographics** — age groups, top tech stacks, roles, and attendee goals per snapshot
- **Snapshot comparison** — track how the audience composition shifts as registration fills up
- **AI audience brief** — structured JSON brief with headline, profile, shift alert, and actionable speaker tips
- **Fallback mode** — rule-based brief generated locally when the Gemini API key is unavailable
- **Q&A feed** — attendee-submitted questions per talk

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- (Optional) A Gemini API key for AI-generated briefs

### Run with Docker

```bash
# Clone the repo
git clone <repo-url>
cd Hackaton-Progress-x-GitNation

# Start the backend (seeds the database automatically on first run)
GEMINI_API_KEY=your_key_here docker compose up --build
```

The API will be available at `http://localhost:8000`.

### Run the frontend locally

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Gemini API key for AI brief generation | `""` (falls back to rule-based) |

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/login` | Login as speaker, organizer, or sponsor |
| `GET` | `/api/talks` | List all talks |
| `GET` | `/api/talks/{id}` | Get a single talk |
| `GET` | `/api/talks/{id}/snapshots` | List registration snapshots for a talk |
| `GET` | `/api/talks/{id}/demographics?snapshot_id=` | Get audience demographics for a snapshot |
| `GET` | `/api/talks/{id}/brief?snapshot_id=` | Retrieve the stored AI brief |
| `POST` | `/api/talks/{id}/brief?snapshot_id=` | Generate (or regenerate) an AI brief |
| `GET` | `/api/talks/{id}/questions` | List attendee questions for a talk |
| `GET` | `/api/health` | Health check |

---

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── models.py            # SQLite schema and connection helpers
│   ├── agent.py             # Gemini AI agent + rule-based fallback
│   ├── generate_briefs.py   # Batch brief generation script
│   ├── seed.py              # Synthetic data seeder (Faker)
│   ├── routes/
│   │   ├── auth.py          # Login endpoints
│   │   ├── talks.py         # Talks, snapshots, demographics, briefs
│   │   └── attendees.py     # Attendee endpoints
│   └── Dockerfile
├── frontend/
│   ├── App.tsx              # Router (Login → Dashboard)
│   ├── pages/
│   │   ├── Login.tsx        # Role selection screen
│   │   ├── Dashboard.tsx    # Main speaker/organizer view
│   │   └── AttendeeForm.tsx # Attendee registration form
│   ├── api.ts               # API client
│   └── types.ts             # Shared TypeScript types
├── docker-compose.yml
└── scripts/                 # Planning and content artifacts
```

---

## Hackathon Context

Built at the **Progress x GitNation Hackathon** (June 11–12, 2024, Amsterdam + online).

- **Theme:** Build tools that make tech events more meaningful
- **Required tech:** Kendo UI Components
- **Prize pool:** €10,000
- **Sponsors:** Progress and GitNation
