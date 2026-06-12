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
          padding: "16px 20px",
          fontSize: "1rem",
          fontWeight: 600,
          fontFamily: '"Space Grotesk", sans-serif',
          color: "var(--text)",
          background: "var(--stat-bg)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}>

          <span style={{ opacity: 0.8 }}>Hi {user.name}, here is your overview</span>
          {user.role === "speaker" && selectedTalk && (
            <span style={{ color: "var(--muted)", fontSize: "0.85rem", fontWeight: 400 }}>
              {selectedTalk.title} — {selectedTalk.track}
            </span>
          )}
          {user.role === "organizer" && (
            <span style={{ color: "var(--muted)", fontSize: "0.85rem", fontWeight: 400 }}>React Summit + JSNation 2026</span>
          )}
          {user.role === "sponsor" && (
            <span style={{ color: "var(--muted)", fontSize: "0.85rem", fontWeight: 400 }}>Audience Intelligence</span>
          )}
          {user.role === "speaker" && user.talks.length > 1 && (
            <select value={talkId ?? ""} onChange={(e) => setTalkId(Number(e.target.value))} style={{ marginLeft: "auto" }}>
              {user.talks.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          )}
          <span style={{
            marginLeft: "auto",
            background: "var(--accent)",
            color: "var(--cta-text)",
            fontSize: 11,
            fontWeight: 600,
            fontFamily: '"Space Grotesk", sans-serif',
            padding: "3px 12px",
            borderRadius: 999,
            textTransform: "capitalize",
          }}>
            {user.role}
          </span>
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
