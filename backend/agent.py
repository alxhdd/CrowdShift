import json
import os
import urllib.request
import urllib.error

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/openai"
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-3.1-flash-lite"


def generate_brief(talk_title: str, snapshot_label: str, total: int,
                   age_groups: dict, tech_stacks: list, roles: list,
                   goals: list, prev_label: str | None = None,
                   prev_total: int | None = None) -> dict:
    """
    Call Gemini to generate a speaker audience brief.
    Returns structured JSON with: headline, audience_profile, shift_alert,
    recommendations, tone.
    """

    age_summary = ", ".join(f"{k}: {v}" for k, v in age_groups.items())
    tech_summary = ", ".join(f"{t['name']} ({t['count']})" for t in tech_stacks[:5])
    role_summary = ", ".join(f"{r['name']} ({r['count']})" for r in roles[:5])
    goal_summary = ", ".join(f"{g['name']} ({g['count']})" for g in goals[:5])

    prev_text = ""
    if prev_label and prev_total is not None:
        prev_text = f"""
Previous snapshot: {prev_label} with {prev_total} attendees.
"""
    system = """You are an audience intelligence agent for conference speakers.
You analyze attendee data and generate concise, actionable speaker briefs.
Respond ONLY with valid JSON — no markdown, no code fences, no extra text."""

    user = f"""Talk: "{talk_title}"
Current snapshot: {snapshot_label} with {total} attendees registered.
{prev_text}
Attendee demographics:
- Age groups: {age_summary}
- Top tech stacks: {tech_summary}
- Top roles: {role_summary}
- Top goals: {goal_summary}

Generate a speaker brief as JSON with these fields:
{{
  "headline": "1-line TL;DR (max 15 words, be punchy)",
  "audience_profile": "2-3 sentences describing WHO is in the room — experience level, roles, interests",
  "shift_alert": "if previous snapshot exists: what changed since then? If first snapshot: null",
  "recommendations": ["3 specific, actionable tips for the speaker. Be concrete — name technologies, suggest slide changes, mention real pain points"],
  "tone": "technical" | "introductory" | "balanced"
}}

Rules:
- Be specific. Reference exact tech stacks, roles, and counts from the data.
- If juniors > 35% of the audience, recommend simplifying or adding prerequisite section.
- If a tech stack has >20 mentions, flag it as a focus area.
- Previous snapshot data is provided to help you identify shifts.
- Never hallucinate technologies that aren't in the data.
"""

    payload = {
        "model": GEMINI_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": 0.7,
        "max_tokens": 500,
    }

    if not GEMINI_KEY:
        return _fallback_brief(talk_title, snapshot_label, total, age_groups, tech_stacks, roles)

    url = f"{GEMINI_BASE}/chat/completions"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GEMINI_KEY}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read())
            raw = body["choices"][0]["message"]["content"]
            # Strip markdown fences if present
            raw = raw.strip()
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1]
                if raw.endswith("```"):
                    raw = raw[:-3]
                raw = raw.strip()
                if raw.startswith("json"):
                    raw = raw[4:].strip()
            return json.loads(raw)
    except Exception as e:
        print(f"Gemini API error: {e}")
        return _fallback_brief(talk_title, snapshot_label, total, age_groups, tech_stacks, roles)


def _fallback_brief(talk_title: str, label: str, total: int,
                    age_groups: dict, tech_stacks: list, roles: list) -> dict:
    """Generate a rules-based brief when the API is unavailable."""
    jr_18 = age_groups.get("18-25", 0)
    jr_26 = age_groups.get("26-35", 0)
    sr_36 = age_groups.get("36-45", 0)
    sr_46 = age_groups.get("46+", 0)
    total_age = sum(age_groups.values()) or 1
    jr_pct = (jr_18 + jr_26) / total_age * 100

    top_tech = tech_stacks[0]["name"] if tech_stacks else "general programming"
    top_role = roles[0]["name"] if roles else "professionals"

    if jr_pct > 50:
        tone = "introductory"
        headline = f"{total} attendees and counting — mostly early-career devs eager to learn"
        profile = f"Your audience at {label} is predominantly junior to mid-level {top_role.lower()}s. {top_tech} is the most common tech interest. Many are here to learn and network."
        recs = [
            f"Lead with fundamental concepts before diving into {top_tech} specifics",
            "Include a 'prerequisites' slide so juniors don't feel lost",
            f"Compare {top_tech} with alternatives — attendees are evaluating tools",
        ]
    elif jr_pct < 30:
        tone = "technical"
        headline = f"{total} senior practitioners — go deep"
        profile = f"Your audience is experienced {top_role.lower()}s. They know {top_tech} well and want advanced patterns, not basics."
        recs = [
            f"Skip the intro to {top_tech} — these people live it daily",
            "Show production architecture and failure stories",
            "Leave time for Q&A — this crowd will have pointed questions",
        ]
    else:
        tone = "balanced"
        headline = f"{total} attendees with mixed experience — broad appeal needed"
        profile = f"Your audience spans junior to senior {top_role.lower()}s. {top_tech} dominates but interests are diverse."
        recs = [
            "Structure the talk with a clear beginner-to-advanced arc",
            f"Use {top_tech} examples that scale from simple to complex",
            "Include a resources slide for those who want to go deeper",
        ]

    return {
        "headline": headline,
        "audience_profile": profile,
        "shift_alert": None,
        "recommendations": recs,
        "tone": tone,
    }
