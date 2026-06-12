import { useState, useEffect, useCallback } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Grid, GridColumn, GridDataStateChangeEvent } from "@progress/kendo-react-grid";
import { process, State } from "@progress/kendo-data-query";
import { api } from "../../utils/api";
import { useDashboard } from "../../context/DashboardContext";
import { Brief, Question, User } from "../../types";

interface Props {
  user: User;
}

const QUESTIONS_STATE: State = { skip: 0, take: 10, sort: [{ field: "submitted_at", dir: "desc" }], filter: undefined };

export default function SpeakerRightPanel({ user }: Props) {
  const { talkId: contextTalkId, snapshotIdx } = useDashboard();
  const effectiveTalkId = contextTalkId || user.talks?.[0]?.id;
  const [brief, setBrief] = useState<Brief | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [qState, setQState] = useState<State>(QUESTIONS_STATE);
  const qResult = process(questions, qState);

  const loadBrief = useCallback(
    async (idx: number) => {
      if (!effectiveTalkId) return;
      try {
        const snaps = await api.snapshots(effectiveTalkId);
        const snap = snaps[Math.min(idx, snaps.length - 1)];
        if (snap) {
          const data = await api.brief(effectiveTalkId, snap.id);
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
      const snap = snaps[Math.min(snapshotIdx, snaps.length - 1)];
      if (snap) {
        const data = await api.generateBrief(effectiveTalkId, snap.id);
        setBrief(data);
      }
    } catch {
      setBrief(null);
    }
    setLoadingBrief(false);
  };

  return (
    <>
      <div className="brief-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, color: "#fff", fontSize: 14 }}>AI Audience Brief</h3>
          <Button
            onClick={handleGenerate}
            disabled={loadingBrief}
            style={{
              background: "#f5eb7c",
              borderColor: "#f5eb7c",
              color: "#1a1a1d",
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 13,
              paddingBlock: 8,
              paddingInline: 16,
            }}
          >
            {loadingBrief ? "Loading..." : "Generate Brief"}
          </Button>
        </div>

        {brief && brief.headline !== "No brief generated yet" ? (
          <div style={{ marginTop: 12 }}>
            <div className="brief-headline">{brief.headline}</div>
            {brief.audience_profile && (
              <div className="brief-body">{brief.audience_profile}</div>
            )}
            {brief.shift_alert && (
              <span className="shift-badge">⚠ {brief.shift_alert}</span>
            )}
            {brief.recommendations.length > 0 && (
              <div className="brief-recs" style={{ marginTop: 10 }}>
                {brief.recommendations.map((rec, i) => (
                  <div key={i}><span className="arrow">→</span> {rec}</div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state" style={{ marginTop: 12, color: "rgba(255,255,255,0.5)" }}>
            {brief?.headline === "No brief generated yet"
              ? "No brief available. Click Generate to create one."
              : "Click a milestone in the timeline to load the brief."}
          </div>
        )}
      </div>

      <div className="panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <h3>Attendee Questions ({questions.length})</h3>
        {questions.length > 0 ? (
          <div style={{ overflow: "auto" }}>
            <Grid
              data={qResult}
              {...qState}
              total={qResult.total}
              onDataStateChange={(e: GridDataStateChangeEvent) => setQState(e.dataState)}
              sortable
              filterable
              pageable={{ buttonCount: 5, pageSizes: [10, 20, 50] }}
              style={{ height: 400, fontSize: "0.85rem" }}
            >
              <GridColumn field="question_text" title="Question" filterable={true} />
              <GridColumn field="attendee_name" title="From" width="130px" filterable={false} />
              <GridColumn
                field="submitted_at"
                title=""
                width="90px"
                filterable={false}
                cells={{
                  data: (props) => (
                    <td {...props.tdProps} className="q-date">
                      {new Date(props.dataItem.submitted_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  ),
                }}
              />
            </Grid>
          </div>
        ) : (
          <div className="empty-state">No questions submitted yet.</div>
        )}
      </div>
    </>
  );
}
