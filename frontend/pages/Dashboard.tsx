import { useEffect, useState, Component, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User } from "../types";
import { DashboardContext } from "../context/DashboardContext";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import OrganizerGrid from "../components/organizer/OrganizerGrid";
import SponsorGrid from "../components/sponsor/SponsorGrid";
import DashboardKpiBar from "../components/DashboardKpiBar";
import "./Dashboard.css";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="panel-card" style={{ border: "2px solid #d93025" }}>
          <h3 style={{ color: "#d93025" }}>Error: {this.state.error.message}</h3>
          <pre style={{ fontSize: "0.75rem", whiteSpace: "pre-wrap", maxHeight: 300, overflow: "auto", color: "var(--text)" }}>
            {this.state.error.stack?.slice(0, 1000)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = (location.state as { user?: User })?.user;
  const [talkId, setTalkId] = useState<number | null>(null);
  const [snapshotIdx, setSnapshotIdx] = useState(0);

  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (user?.talks?.[0]?.id) setTalkId(user.talks[0].id);
  }, [user]);

  if (!user) return null;

  const selectedTalk = user.talks?.find((t) => t.id === talkId);

  return (
    <DashboardContext.Provider value={{ talkId, snapshotIdx, setSnapshotIdx }}>
      <div className="dashboard">
        <div style={{
          margin: "16px",
          padding: "24px 100px 24px 28px",
          background: "var(--stat-bg)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          position: "relative",
        }}>
          <span style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            background: "var(--accent)",
            color: "var(--cta-text)",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: '"Space Grotesk", sans-serif',
            padding: "0 20px",
            borderRadius: "0 12px 12px 0",
            textTransform: "capitalize",
            letterSpacing: "0.02em",
          }}>
            {user.role}
          </span>
          <h2 style={{
            margin: 0,
            fontSize: "1.5rem",
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            color: "var(--text)",
          }}>
            {user.name}
          </h2>
          {user.role === "speaker" && selectedTalk && (
            <div style={{ marginTop: 6 }}>
              <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                {selectedTalk.track}
              </span>
              <div style={{ color: "var(--accent-text)", fontSize: "0.95rem", fontWeight: 600 }}>
                {selectedTalk.title}
              </div>
            </div>
          )}
          {user.role === "organizer" && (
            <div style={{ marginTop: 6 }}>
              <span style={{ color: "var(--accent-text)", fontSize: "0.95rem", fontWeight: 600 }}>
                React Summit + JSNation
              </span>
              <span style={{ color: "var(--muted)", fontSize: "0.85rem", marginLeft: 8 }}>
                2026
              </span>
            </div>
          )}
          {user.role === "sponsor" && (
            <div style={{ marginTop: 6 }}>
              <span style={{ color: "var(--accent-text)", fontSize: "0.95rem", fontWeight: 600 }}>
                Audience Intelligence
              </span>
              <span style={{ color: "var(--muted)", fontSize: "0.85rem", marginLeft: 8 }}>
                React Summit + JSNation 2026
              </span>
            </div>
          )}
          {user.role === "speaker" && user.talks.length > 1 && (
            <select
              value={talkId ?? ""}
              onChange={(e) => setTalkId(Number(e.target.value))}
              style={{ marginTop: 12, fontSize: "0.85rem", padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text)" }}
            >
              {user.talks.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          )}
        </div>
        <DashboardKpiBar user={user} />
        <div className="dashboard-columns">
          <div className="dashboard-left">
            <ErrorBoundary>
              <LeftPanel user={user} />
            </ErrorBoundary>
          </div>
          <div className="dashboard-right">
            <ErrorBoundary>
              <RightPanel user={user} />
            </ErrorBoundary>
          </div>
        </div>
        {user.role === "organizer" && (
          <div style={{ padding: "0 16px 16px" }}>
            <ErrorBoundary>
              <OrganizerGrid />
            </ErrorBoundary>
          </div>
        )}
        {user.role === "sponsor" && (
          <div style={{ padding: "0 16px 16px" }}>
            <ErrorBoundary>
              <SponsorGrid />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </DashboardContext.Provider>
  );
}
