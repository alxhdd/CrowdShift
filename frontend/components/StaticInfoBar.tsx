import { useState } from "react";
import { User } from "../types";
import { Link } from "react-router-dom";

interface Props {
  user: User;
}

export default function StaticInfoBar({ user }: Props) {
  const [talkId, setTalkId] = useState<number | null>(
    user.talks?.[0]?.id ?? null
  );

  const selectedTalk = user.talks?.find((t) => t.id === talkId);

  // Store selected talk globally for panel components
  (window as any).__selectedTalkId = talkId;

  return (
    <div className="static-bar">
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <strong style={{ fontSize: "1.1rem" }}>CrowdShift</strong>

        {user.role === "speaker" && user.talks.length > 1 && (
          <select
            value={talkId ?? ""}
            onChange={(e) => setTalkId(Number(e.target.value))}
          >
            {user.talks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        )}

        {user.role === "speaker" && selectedTalk && (
          <span style={{ color: "#666", fontSize: "0.9rem" }}>
            {selectedTalk.title} — {selectedTalk.track}
          </span>
        )}

        {user.role === "organizer" && (
          <span style={{ color: "#666", fontSize: "0.9rem" }}>
            React Summit + JSNation 2026
          </span>
        )}

        {user.role === "sponsor" && (
          <span style={{ color: "#666", fontSize: "0.9rem" }}>
            Audience Intelligence
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="role-badge">{user.role}</span>
        <Link to="/" style={{ fontSize: "0.85rem", color: "#666" }}>
          Logout
        </Link>
      </div>
    </div>
  );
}
