import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@progress/kendo-react-buttons";
import { api } from "../api";
import { User } from "../types";

const ROLES = [
  {
    label: "Speaker",
    name: "Sarah Chen",
    subtitle: "The Future of React State Management",
    role: "speaker",
    user_id: 1,
  },
  {
    label: "Speaker",
    name: "Marcus Webb",
    subtitle: "Scalable APIs in Node.js",
    role: "speaker",
    user_id: 2,
  },
  {
    label: "Organizer",
    name: "Alex Rivera",
    subtitle: "Full event overview",
    role: "organizer",
  },
  {
    label: "Sponsor",
    name: "MegaCorp",
    subtitle: "Audience intelligence",
    role: "sponsor",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = async (role: string, user_id?: number) => {
    setLoading(role + (user_id ?? ""));
    try {
      const user: User = await api.login(role, user_id);
      navigate("/dashboard", { state: { user } });
    } catch {
      setLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "80px auto", padding: "0 16px" }}>
      <h1 style={{ textAlign: "center", marginBottom: 8 }}>CrowdShift</h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: 32 }}>
        AI-powered audience intelligence for conference speakers
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {ROLES.map((r) => {
          const key = r.role + (r.user_id ?? "");
          return (
            <div
              key={key}
              onClick={() => loading || handleLogin(r.role, r.user_id)}
              style={{
                cursor: "pointer",
                opacity: loading === key ? 0.6 : 1,
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>{r.name}</div>
                  <p style={{ color: "#888", margin: 0 }}>{r.subtitle}</p>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 4,
                    background: "#e8f0fe",
                    color: "#1967d2",
                  }}
                >
                  {r.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: "center", marginTop: 24 }}>
        <Link to="/attendee">I'm an Attendee — submit a question</Link>
      </p>
    </div>
  );
}
