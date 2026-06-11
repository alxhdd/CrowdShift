import { useState, useEffect, useCallback } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { ListView } from "@progress/kendo-react-listview";
import { api } from "../../utils/api";
import { Brief, Question, User } from "../../types";

interface Props {
  user: User;
}

export default function SpeakerRightPanel({ user }: Props) {
  const talkId = (window as any).__selectedTalkId || user.talks?.[0]?.id;
  const [snapshotIdx, setSnapshotIdx] = useState(0);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingBrief, setLoadingBrief] = useState(false);

  // Poll for active snapshot index from left panel
  useEffect(() => {
    const interval = setInterval(() => {
      const idx = (window as any).__activeSnapshotIdx;
      if (idx !== undefined && idx !== snapshotIdx) {
        setSnapshotIdx(idx);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [snapshotIdx]);

  // Fetch brief when snapshot changes
  const loadBrief = useCallback(
    async (idx: number) => {
      if (!talkId) return;
      try {
        const snaps = await api.snapshots(talkId);
        if (snaps[idx]) {
          const data = await api.brief(talkId, snaps[idx].id);
          setBrief(data);
        }
      } catch {
        setBrief(null);
      }
    },
    [talkId]
  );

  useEffect(() => {
    loadBrief(snapshotIdx);
  }, [snapshotIdx, loadBrief]);

  useEffect(() => {
    if (!talkId) return;
    api.questions(talkId).then(setQuestions);
  }, [talkId]);

  const handleGenerate = async () => {
    if (!talkId) return;
    setLoadingBrief(true);
    try {
      const snaps = await api.snapshots(talkId);
      if (snaps[snapshotIdx]) {
        const data = await api.generateBrief(talkId, snaps[snapshotIdx].id);
        setBrief(data);
      }
    } catch {
      setBrief(null);
    }
    setLoadingBrief(false);
  };

  return (
    <>
      <div className="panel-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>AI Audience Brief</h3>
          <Button onClick={handleGenerate} disabled={loadingBrief}>
            {loadingBrief ? "Loading..." : "Generate Brief"}
          </Button>
        </div>

        {brief && brief.headline !== "No brief generated yet" ? (
          <div style={{ marginTop: 16 }}>
            <div className="brief-headline">{brief.headline}</div>
            {brief.audience_profile && (
              <div className="brief-body">{brief.audience_profile}</div>
            )}
            {brief.shift_alert && (
              <div className="brief-shift">{brief.shift_alert}</div>
            )}
            {brief.recommendations.length > 0 && (
              <>
                <strong style={{ fontSize: "0.9rem" }}>Recommendations:</strong>
                <ul className="brief-recs" style={{ marginTop: 8 }}>
                  {brief.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : (
          <div className="empty-state" style={{ marginTop: 16 }}>
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
    <div style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
      <p style={{ margin: 0, fontSize: "0.9rem" }}>{q.question_text}</p>
      <div style={{ marginTop: 4, display: "flex", gap: 12 }}>
        <span className="tag">{q.attendee_name}</span>
        <span style={{ fontSize: "0.75rem", color: "#999" }}>
          {new Date(q.submitted_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
