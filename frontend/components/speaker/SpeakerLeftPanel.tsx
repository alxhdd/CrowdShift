import { useState, useEffect } from "react";
import { Slider } from "@progress/kendo-react-inputs";
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartLegend,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
} from "@progress/kendo-react-charts";
import { api } from "../../utils/api";
import { useDashboard } from "../../context/DashboardContext";
import { Snapshot, Demographics, User } from "../../types";

const ACCENT = "#f5eb7c";
const DONUT_COLORS = ["#f5eb7c", "#eb9783", "#8e8e95", "#b84c3a"];
const BAR_COLORS = ["#f5eb7c", "#f5eb7c", "#f5eb7c", "#efe6c0", "#efe6c0", "#efe6c0"];

interface Props {
  user: User;
}

export default function SpeakerLeftPanel({ user }: Props) {
  const { talkId, setSnapshotIdx } = useDashboard();
  const effectiveTalkId = talkId || user.talks?.[0]?.id;
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [demographics, setDemographics] = useState<Demographics | null>(null);
  const [hiddenAges, setHiddenAges] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!effectiveTalkId) return;
    api.snapshots(effectiveTalkId).then((data) => {
      setSnapshots(data);
      if (data.length > 0) {
        setActiveIdx(0);
        setSnapshotIdx(0);
      }
    });
  }, [effectiveTalkId, setSnapshotIdx]);

  useEffect(() => {
    if (!snapshots[activeIdx] || !effectiveTalkId) return;
    api
      .demographics(effectiveTalkId, snapshots[activeIdx].id)
      .then(setDemographics)
      .catch(() => setDemographics(null));
    setHiddenAges(new Set());
  }, [activeIdx, effectiveTalkId, snapshots]);

  const handleChange = (e: any) => {
    const val = Math.round(e.value);
    setActiveIdx(val);
    setSnapshotIdx(val);
  };

  if (!snapshots.length) {
    return <div className="panel">Loading snapshots...</div>;
  }

  const ageData = demographics
    ? Object.entries(demographics.age_groups)
        .map(([age, count], i) => {
          const pct = demographics.total > 0 ? Math.round(count / demographics.total * 100) : 0;
          return {
            range: `${age} (${pct}%)`,
            ageKey: age,
            count,
            color: DONUT_COLORS[i % DONUT_COLORS.length],
          };
        })
        .filter((d) => d.count > 0)
    : [];

  const activeCount = ageData
    .filter((d) => !hiddenAges.has(d.ageKey))
    .reduce((sum, d) => sum + d.count, 0);

  const handleDonutClick = (e: any) => {
    const label = e.category || e.text || e.point?.category || "";
    const ageKey = ageData.find((d) => d.range === label)?.ageKey;
    if (!ageKey) return;
    setHiddenAges((prev) => {
      const next = new Set(prev);
      if (next.has(ageKey)) {
        next.delete(ageKey);
      } else {
        next.add(ageKey);
      }
      if (next.size === ageData.length) return new Set();
      return next;
    });
  };

  const visibleAgeData = ageData.map((d) => ({
    ...d,
    color: hiddenAges.has(d.ageKey) ? "#4a4d56" : d.color,
  }));

  const sortedTech = demographics
    ? [...demographics.tech_stacks].sort((a, b) => b.count - a.count).slice(0, 6)
    : [];

  const currentSnapshot = snapshots[activeIdx];
  const prevSnapshot = activeIdx > 0 ? snapshots[activeIdx - 1] : null;
  const delta = prevSnapshot && currentSnapshot ? currentSnapshot.attendee_count - prevSnapshot.attendee_count : null;
  const count = demographics?.total ?? currentSnapshot?.attendee_count ?? 0;

  return (
    <>
      <div className="panel">
        <h3>Audience Timeline</h3>
        {snapshots.length > 1 && (
          <Slider
            className="timeline-slider"
            buttons={false}
            min={0}
            max={snapshots.length - 1}
            value={activeIdx}
            onChange={handleChange}
            step={1}
            style={{ marginTop: 16, marginBottom: 12, width: "100%" }}
          />
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", padding: "0 2px" }}>
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
        <p className="timeline-headline">
          {currentSnapshot?.label ?? "—"} — {count} attendees
        </p>
        {delta !== null && delta > 0 && (
          <p className="timeline-delta">
            ↑ {delta} new since {prevSnapshot?.label}
          </p>
        )}
      </div>

      {demographics && demographics.total > 0 && (
        <>
          <div className="panel">
            <h3>Age Distribution</h3>
            <div style={{ position: "relative" }}>
              <Chart transitions={true} style={{ height: 240 }} onLegendItemClick={handleDonutClick}>
                <ChartSeries>
                  <ChartSeriesItem
                    type="donut"
                    data={visibleAgeData}
                    field="count"
                    categoryField="range"
                    colorField="color"
                    holeSize={40}
                  />
                </ChartSeries>
                <ChartLegend position="bottom" labels={{ font: "11px inherit" }} />
              </Chart>
              <div className="donut-center">
                <span className="donut-num">{activeCount}</span>
                <span className="donut-sub">attendees</span>
              </div>
            </div>
          </div>

          <div className="panel">
            <h3>Top Tech Stacks</h3>
            <Chart transitions={true} style={{ height: 260 }}>
              <ChartSeries>
                <ChartSeriesItem
                  type="bar"
                  data={sortedTech}
                  field="count"
                  categoryField="name"
                  color={(p: any) => BAR_COLORS[p.index] ?? "#efe6c0"}
                  labels={{ visible: true, position: "outsideEnd", font: "11px inherit" }}
                  border={{ width: 0 }}
                />
              </ChartSeries>
              <ChartCategoryAxis>
                <ChartCategoryAxisItem majorGridLines={{ visible: false }} />
              </ChartCategoryAxis>
            </Chart>
          </div>
        </>
      )}

      {demographics && demographics.total === 0 && (
        <div className="panel">
          <div className="empty-state">No registrations at this milestone yet.</div>
        </div>
      )}
    </>
  );
}
