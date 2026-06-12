const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

let _token: string | null = null;

export function setToken(token: string | null) {
  _token = token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers as Record<string, string>,
  };
  if (_token) {
    headers["Authorization"] = `Bearer ${_token}`;
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  login: async (role: string, user_id?: number) => {
    const data = await request<any>("/api/login", {
      method: "POST",
      body: JSON.stringify({ role, user_id }),
    });
    if (data.token) setToken(data.token);
    return data;
  },

  snapshots: (talkId: number) =>
    request<any[]>(`/api/talks/${talkId}/snapshots`),

  demographics: (talkId: number, snapshotId: number) =>
    request<any>(`/api/talks/${talkId}/demographics?snapshot_id=${snapshotId}`),

  brief: (talkId: number, snapshotId: number) =>
    request<any>(`/api/talks/${talkId}/brief?snapshot_id=${snapshotId}`),

  generateBrief: (talkId: number, snapshotId: number) =>
    request<any>(`/api/talks/${talkId}/brief?snapshot_id=${snapshotId}`, {
      method: "POST",
    }),

  questions: (talkId: number) =>
    request<any[]>(`/api/talks/${talkId}/questions`),

  submitQuestion: (ticketId: string, talkId: number, questionText: string) =>
    request<any>("/api/attendee/question", {
      method: "POST",
      body: JSON.stringify({
        ticket_id: ticketId,
        talk_id: talkId,
        question_text: questionText,
      }),
    }),

  attendees: () => request<any[]>("/api/attendees"),

  segments: () => request<any>("/api/attendees/segments"),

  cohorts: () =>
    request<{ segment: string; count: number; pct: number; top_interest: string; evaluating_pct: number; top_company_size: string }[]>(
      "/api/attendees/cohorts"
    ),

  lookupAttendee: (ticketId: string) =>
    request<{ name: string; registered_talks: { id: number; title: string; track: string }[] }>(
      `/api/attendee/lookup?ticket_id=${encodeURIComponent(ticketId)}`
    ),
};
