import { useState, useEffect } from "react";
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartLegend,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
} from "@progress/kendo-react-charts";
import { api } from "../../utils/api";
import { Segments } from "../../types";

const DONUT_COLORS = ["#eb9783", "#f5eb7c", "#8e8e95", "#b84c3a"];
const BAR_COLORS = ["#eb9783", "#eb9783", "#eb9783", "#e8c8c0", "#e8c8c0", "#e8c8c0"];

export default function SponsorLeftPanel() {
  const [segments, setSegments] = useState<Segments | null>(null);
  const [hiddenAges, setHiddenAges] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.segments().then(setSegments);
  }, []);

  const ageData = segments
    ? Object.entries(segments.age_groups)
        .map(([age, count], i) => {
          const pct = segments.total > 0 ? Math.round(count / segments.total * 100) : 0;
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

  const sortedTech = segments
    ? [...segments.tech_stacks].sort((a, b) => b.count - a.count).slice(0, 6)
    : [];

  if (!segments) {
    return <div className="panel">Loading...</div>;
  }

  return (
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
        <h3>Top Technologies</h3>
        <Chart transitions={true} style={{ height: 260 }}>
          <ChartSeries>
            <ChartSeriesItem
              type="bar"
              data={sortedTech}
              field="count"
              categoryField="name"
              color={(p: any) => BAR_COLORS[p.index] ?? "#e8c8c0"}
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
  );
}
