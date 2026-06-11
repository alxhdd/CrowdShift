const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  login: (role: string, user_id?: number) =>
    request<any>("/api/login", {
      method: "POST",
      body: JSON.stringify({ role, user_id }),
    }),

  talks: () => request<any[]>("/api/talks"),

  talk: (id: number) => request<any>(`/api/talks/${id}`),

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
};
