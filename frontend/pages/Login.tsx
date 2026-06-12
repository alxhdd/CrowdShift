import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../utils/api";
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
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
    }}>
      <div style={{ maxWidth: 600, width: "100%", padding: "0 16px" }}>
        <h1 style={{ textAlign: "center", marginBottom: 8, color: "var(--text)" }}>
          CrowdShift
        </h1>
        <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: 32 }}>
          AI-powered audience intelligence for conference speakers
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ROLES.map((r) => {
            const key = r.role + (r.user_id ?? "");
            return (
              <div
                key={key}
                onClick={() => loading || handleLogin(r.role, r.user_id)}
                className="panel-card login-card"
                style={{
                  opacity: loading === key ? 0.6 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>{r.name}</div>
                    <p style={{ margin: 0, opacity: 0.65 }}>{r.subtitle}</p>
                  </div>
                  <span className="tag">{r.label}</span>
                </div>
              </div>
            );
          })}
        </div>

      <p style={{ textAlign: "center", marginTop: 24 }}>
        <Link to="/attendee">I'm an Attendee — submit a question</Link>
      </p>
      <p style={{ textAlign: "center", marginTop: 8 }}>
        <Link to="/" style={{ color: "var(--muted)", fontSize: "0.85rem" }}>← Back to home</Link>
      </p>
      </div>
    </div>
  );
}
