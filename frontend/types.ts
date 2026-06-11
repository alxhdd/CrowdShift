export interface User {
  user_id: number;
  name: string;
  role: "speaker" | "organizer" | "sponsor";
  talks: TalkSummary[];
}

export interface TalkSummary {
  id: number;
  title: string;
  track: string;
}

export interface Talk {
  id: number;
  title: string;
  track: string;
  description: string;
  capacity: number;
  speaker_name: string;
}

export interface Snapshot {
  id: number;
  talk_id: number;
  label: string;
  cutoff_date: string;
  attendee_count: number;
  pct: number;
}

export interface Demographics {
  snapshot_id: number;
  total: number;
  age_groups: Record<string, number>;
  tech_stacks: { name: string; count: number }[];
  roles: { name: string; count: number }[];
  goals: { name: string; count: number }[];
}

export interface Brief {
  headline: string;
  audience_profile: string;
  shift_alert: string | null;
  recommendations: string[];
  tone: string;
}

export interface Question {
  id: number;
  question_text: string;
  submitted_at: string;
  attendee_name: string;
}

export interface Segments {
  total: number;
  age_groups: Record<string, number>;
  tech_stacks: { name: string; count: number }[];
  roles: { name: string; count: number }[];
  countries: { name: string; count: number }[];
}

export interface Attendee {
  id: number;
  ticket_id: string;
  name: string;
  email: string;
  age: number;
  role: string;
  company: string;
  country: string;
  ticket_type: string;
  registered_at: string;
  experience_years: number;
  goal: string;
  tech_interests: string;
}
