import { useState, useEffect, useCallback } from "react";
import { Slider } from "@progress/kendo-react-inputs";
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartLegend,
} from "@progress/kendo-react-charts";
import { api } from "../../utils/api";
import { useDashboard } from "../../context/DashboardContext";
import { Snapshot, Demographics, User } from "../../types";

const ACCENT = "#f5eb7c";
const ACCENT_DIM = "#c7b93d";

interface Props {
  user: User;
}

export default function SpeakerLeftPanel({ user }: Props) {
  const { talkId, setSnapshotIdx } = useDashboard();
  const effectiveTalkId = talkId || user.talks?.[0]?.id;
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [demographics, setDemographics] = useState<Demographics | null>(null);

  useEffect(() => {
    if (!effectiveTalkId) return;
    api.snapshots(effectiveTalkId).then((data) => {
      setSnapshots(data);
      if (data.length > 0) {
        setActiveIdx(data.length - 1);
        setSnapshotIdx(data.length - 1);
      }
    });
  }, [effectiveTalkId, setSnapshotIdx]);

  const loadDemo = useCallback(
    (idx: number) => {
      if (!snapshots[idx] || !effectiveTalkId) return;
      api
        .demographics(effectiveTalkId, snapshots[idx].id)
        .then(setDemographics)
        .catch(() => setDemographics(null));
    },
    [effectiveTalkId, snapshots]
  );

  useEffect(() => {
    loadDemo(activeIdx);
  }, [activeIdx, loadDemo]);

  const handleChange = (e: any) => {
    setActiveIdx(e.value);
    setSnapshotIdx(e.value);
  };

  if (!snapshots.length) {
    return <div className="panel-card">Loading snapshots...</div>;
  }

  const ageData = demographics
    ? Object.entries(demographics.age_groups).map(([age, count]) => ({
        category: age,
        value: count,
      }))
    : [];

  const techData = demographics
    ? demographics.tech_stacks.slice(0, 6).map((t) => ({
        category: t.name,
        value: t.count,
      }))
    : [];

  return (
    <>
      <div className="panel-card">
        <h3>Audience Timeline</h3>
        <Slider
          min={0}
          max={snapshots.length - 1}
          value={activeIdx}
          onChange={handleChange}
          step={1}
          buttons={true}
          style={{ marginTop: 24, marginBottom: 16 }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", padding: "0 4px" }}>
          {snapshots.map((s, i) => (
            <span
              key={s.id}
              style={{
                cursor: "pointer",
                color: i === activeIdx ? ACCENT : "var(--muted)",
                fontWeight: i === activeIdx ? 600 : 400,
              }}
              onClick={() => handleChange({ value: i })}
            >
              {s.label}
            </span>
          ))}
        </div>
        <p style={{ textAlign: "center", color: "var(--text)", fontSize: "0.85rem", opacity: 0.75 }}>
          {snapshots[activeIdx]?.label} —{" "}
          {snapshots[activeIdx]?.attendee_count} attendees
        </p>
      </div>

      {demographics && demographics.total > 0 && (
        <>
          <div className="panel-card">
            <h3>Age Distribution</h3>
            <Chart style={{ height: 200 }}>
              <ChartSeries>
                <ChartSeriesItem
                  type="pie"
                  data={ageData}
                  field="value"
                  categoryField="category"
                />
              </ChartSeries>
              <ChartLegend position="bottom" />
            </Chart>
          </div>

          <div className="panel-card">
            <h3>Top Tech Stacks</h3>
            <Chart style={{ height: 220 }}>
              <ChartSeries>
                <ChartSeriesItem
                  type="bar"
                  data={techData}
                  field="value"
                  categoryField="category"
                  color={ACCENT}
                />
              </ChartSeries>
            </Chart>
          </div>
        </>
      )}

      {demographics && demographics.total === 0 && (
        <div className="panel-card">
          <div className="empty-state">
            No registrations at this milestone yet.
          </div>
        </div>
      )}
    </>
  );
}
