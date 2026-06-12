import { useState, useEffect, useCallback } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { ListView } from "@progress/kendo-react-listview";
import { api } from "../../utils/api";
import { useDashboard } from "../../context/DashboardContext";
import { Brief, Question, User } from "../../types";

interface Props {
  user: User;
}

export default function SpeakerRightPanel({ user }: Props) {
  const { talkId: contextTalkId, snapshotIdx } = useDashboard();
  const effectiveTalkId = contextTalkId || user.talks?.[0]?.id;
  const [brief, setBrief] = useState<Brief | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingBrief, setLoadingBrief] = useState(false);

  const loadBrief = useCallback(
    async (idx: number) => {
      if (!effectiveTalkId) return;
      try {
        const snaps = await api.snapshots(effectiveTalkId);
        if (snaps[idx]) {
          const data = await api.brief(effectiveTalkId, snaps[idx].id);
          setBrief(data);
        }
      } catch {
        setBrief(null);
      }
    },
    [effectiveTalkId]
  );

  useEffect(() => {
    loadBrief(snapshotIdx);
  }, [snapshotIdx, loadBrief]);

  useEffect(() => {
    if (!effectiveTalkId) return;
    api.questions(effectiveTalkId).then(setQuestions);
  }, [effectiveTalkId]);

  const handleGenerate = async () => {
    if (!effectiveTalkId) return;
    setLoadingBrief(true);
    try {
      const snaps = await api.snapshots(effectiveTalkId);
      if (snaps[snapshotIdx]) {
        const data = await api.generateBrief(effectiveTalkId, snaps[snapshotIdx].id);
        setBrief(data);
      }
    } catch {
      setBrief(null);
    }
    setLoadingBrief(false);
  };

  return (
    <>
      <div className="panel-card-accent">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>AI Audience Brief</h3>
          <Button onClick={handleGenerate} disabled={loadingBrief}>
            {loadingBrief ? "Loading..." : "Generate Brief"}
          </Button>
        </div>

        {brief && brief.headline !== "No brief generated yet" ? (
          <div style={{ marginTop: 16 }}>
            <div className="brief-headline" style={{ color: "inherit" }}>{brief.headline}</div>
            {brief.audience_profile && (
              <div className="brief-body" style={{ color: "inherit", opacity: 0.8 }}>{brief.audience_profile}</div>
            )}
            {brief.shift_alert && (
              <div className="brief-shift">{brief.shift_alert}</div>
            )}
            {brief.recommendations.length > 0 && (
              <>
                <strong style={{ fontSize: "0.9rem" }}>Recommendations:</strong>
                <ul className="brief-recs" style={{ marginTop: 8 }}>
                  {brief.recommendations.map((rec, i) => (
                    <li key={i} style={{ color: "inherit", opacity: 0.8 }}>{rec}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : (
          <div className="empty-state" style={{ marginTop: 16, color: "inherit" }}>
            {brief?.headline === "No brief generated yet"
              ? "No brief available. Click Generate to create one."
              : "Click a milestone in the timeline to load the brief."}
          </div>
        )}
      </div>

      <div className="panel-card">
        <h3>Attendee Questions ({questions.length})</h3>
        {questions.length > 0 ? (
          <ListView
            data={questions}
            item={QuestionItem}
            style={{ border: "none" }}
          />
        ) : (
          <div className="empty-state">No questions submitted yet.</div>
        )}
      </div>
    </>
  );
}

function QuestionItem(props: { dataItem: Question }) {
  const q = props.dataItem;
  return (
    <div style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
      <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text)" }}>{q.question_text}</p>
      <div style={{ marginTop: 4, display: "flex", gap: 12 }}>
        <span className="tag">{q.attendee_name}</span>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
          {new Date(q.submitted_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
