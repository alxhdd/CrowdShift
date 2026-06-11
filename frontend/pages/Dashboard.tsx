import { useEffect, useState, Component, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User } from "../types";
import { DashboardContext } from "../context/DashboardContext";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import "./Dashboard.css";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, background: "#fff", border: "2px solid #d93025", borderRadius: 8, margin: 16 }}>
          <h3 style={{ color: "#d93025" }}>Error: {this.state.error.message}</h3>
          <pre style={{ fontSize: "0.75rem", whiteSpace: "pre-wrap", maxHeight: 300, overflow: "auto" }}>
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
        <div className="static-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <strong>CrowdShift</strong>
            {user.role === "speaker" && user.talks.length > 1 && (
              <select value={talkId ?? ""} onChange={(e) => setTalkId(Number(e.target.value))}>
                {user.talks.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            )}
            {selectedTalk && (
              <span style={{ color: "#666", fontSize: "0.9rem" }}>
                {selectedTalk.title} — {selectedTalk.track}
              </span>
            )}
            {user.role === "organizer" && <span style={{ color: "#666" }}>React Summit + JSNation 2026</span>}
            {user.role === "sponsor" && <span style={{ color: "#666" }}>Audience Intelligence</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="role-badge">{user.role}</span>
            <a href="/" style={{ fontSize: "0.85rem", color: "#666" }}>Logout</a>
          </div>
        </div>
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
      </div>
    </DashboardContext.Provider>
  );
}
