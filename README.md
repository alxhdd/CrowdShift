# CrowdShift

> Built for the [Progress x GitNation Hackathon](https://www.hackathonparty.com/hackathons/43) — "Build the tools that make tech events more meaningful."

**Live demo:** [crowdshift.online](https://crowdshift.online)

CrowdShift gives conference speakers a real-time audience intelligence brief before they walk on stage. As attendees register for a talk, the system aggregates their demographics — age groups, tech stacks, roles, and goals — and uses an AI agent to generate an actionable speaker brief: who's in the room, what they care about, and how to tailor the talk for maximum impact.

---

## The Problem

Speakers prepare talks months in advance, then walk on stage knowing almost nothing about the actual audience. Are they junior devs who need a gentle intro, or senior engineers who want production patterns? CrowdShift answers that question before the first slide.

---

## How It Works

1. **Attendees register** for individual talks (seeded via realistic synthetic data).
2. **Snapshots** are taken at registration milestones (25%, 50%, 75%, 100% capacity) to capture how the audience evolves over time.
3. **Speakers request a brief** for any snapshot — the backend computes live demographics and calls the Gemini AI agent.
4. **The AI agent** (gemini-3.1-flash-lite) returns a structured brief: a punchy headline, an audience profile, a shift alert comparing the latest vs. previous snapshot, concrete recommendations, and a suggested tone (technical / balanced / introductory).
5. **The dashboard** — built with Kendo UI for React — lets speakers, organizers, and sponsors browse talks, explore demographic breakdowns via charts, and view AI-generated briefs side by side with the data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript, Vite 8, React Router (HashRouter) |
| UI Components | [Kendo UI for React](https://www.telerik.com/kendo-react-ui) — Charts, Grid, Slider, Inputs, Layout |
| Backend | FastAPI (Python 3.13), SQLite |
| AI Agent | gemini-3.1-flash-lite via OpenAI-compatible API |
| Infrastructure | Docker + Docker Compose, Caddy (reverse proxy) |

---

## Features

- **Role-based dashboards** — Speaker, Organizer, and Sponsor views with tailored data
- **Talk demographics** — age groups, top tech stacks, roles, and attendee goals per snapshot
- **Snapshot timeline** — slider to scrub through milestones and watch the audience shift
- **AI audience brief** — structured brief with headline, profile, shift alert, and actionable tips
- **Fallback mode** — rule-based brief generated locally when the Gemini API key is unavailable
- **Q&A feed** — attendees submit questions via ticket ID; speakers see them in real time
- **Privacy by design** — speakers see aggregates only, sponsors get anonymized cohorts, only organizers see full PII
- **Dark/light theme** — full theme system with Kendo theme switching

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for frontend)
- (Optional) A Gemini API key for AI-generated briefs

### Run with Docker

```bash
git clone https://github.com/alxhdd/CrowdShift.git
cd CrowdShift

# Create .env with your Gemini key (optional)
echo "GEMINI_API_KEY=your_key_here" > .env

# Start the backend (seeds the database automatically on first run)
docker compose up --build
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
| `POST` | `/api/attendee/question` | Submit an attendee question |
| `GET` | `/api/attendee/lookup?ticket_id=` | Look up attendee by ticket ID |
| `GET` | `/api/attendees` | List all attendees (organizer only) |
| `GET` | `/api/attendees/segments` | Aggregate audience segments |
| `GET` | `/api/attendees/cohorts` | Privacy-safe cohort breakdown |
| `GET` | `/api/health` | Health check |

---

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI app + CORS
│   ├── models.py            # SQLite schema and connection
│   ├── agent.py             # Gemini AI agent + rule-based fallback
│   ├── seed.py              # Synthetic data seeder (500 attendees)
│   ├── entrypoint.sh        # Docker entrypoint (seed + serve)
│   ├── routes/
│   │   ├── auth.py          # Login endpoint
│   │   ├── talks.py         # Talks, snapshots, demographics, briefs, questions
│   │   └── attendees.py     # Attendee lookup, segments, cohorts
│   └── Dockerfile
├── frontend/
│   ├── App.tsx              # HashRouter (Landing, Login, Dashboard, Attendee)
│   ├── main.tsx             # React entry point
│   ├── types.ts             # Shared TypeScript interfaces
│   ├── pages/
│   │   ├── Landing.tsx      # Marketing landing page
│   │   ├── Login.tsx        # Role selection screen
│   │   ├── Dashboard.tsx    # Main dashboard with role-based panels
│   │   └── AttendeeForm.tsx # Ticket lookup + question submission
│   ├── components/
│   │   ├── Navbar.tsx       # AppBar with logo, nav, theme toggle
│   │   ├── DashboardKpiBar.tsx
│   │   ├── LeftPanel.tsx    # Role router for left panels
│   │   ├── RightPanel.tsx   # Role router for right panels
│   │   ├── speaker/        # Speaker charts + AI brief + Q&A grid
│   │   ├── organizer/      # Organizer charts + full attendee grid
│   │   └── sponsor/        # Sponsor charts + cohort grid
│   ├── context/
│   │   ├── ThemeContext.tsx  # Dark/light theme provider
│   │   └── DashboardContext.tsx  # Shared talk/snapshot state
│   └── utils/
│       └── api.ts           # API client
├── docker-compose.yml
└── README.md
```

---

## Hackathon Context

Built at the **Progress x GitNation Hackathon** (June 11–12, 2026, Amsterdam + online).

- **Theme:** Build tools that make tech events more meaningful
- **Required tech:** Kendo UI Components
- **Prize pool:** €10,000
- **Sponsors:** Progress and GitNation
