import { useState, useEffect } from "react";
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartLegend,
} from "@progress/kendo-react-charts";
import { api } from "../../api";
import { Segments } from "../../types";

export default function SponsorLeftPanel() {
  const [segments, setSegments] = useState<Segments | null>(null);

  useEffect(() => {
    api.segments().then(setSegments);
  }, []);

  const ageData = segments
    ? Object.entries(segments.age_groups).map(([age, count]) => ({
        category: age,
        value: count,
      }))
    : [];

  const techData = segments
    ? segments.tech_stacks.slice(0, 6).map((t) => ({
        category: t.name,
        value: t.count,
      }))
    : [];

  if (!segments) {
    return <div className="panel-card">Loading...</div>;
  }

  return (
    <>
      <div className="panel-card">
        <h3>Audience at a Glance</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            ["Total Attendees", segments.total],
            ["Countries", segments.countries.length],
            ["Top Tech", segments.tech_stacks[0]?.name ?? "—"],
            ["Top Role", segments.roles[0]?.name ?? "—"],
          ].map(([label, value]) => (
            <div key={label as string} style={{ background: "#f8f9fa", padding: 12, borderRadius: 6 }}>
              <div style={{ fontSize: "0.75rem", color: "#999" }}>{label}</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

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
        <h3>Top Technologies</h3>
        <Chart style={{ height: 220 }}>
          <ChartSeries>
            <ChartSeriesItem
              type="bar"
              data={techData}
              field="value"
              categoryField="category"
              color="#ea4335"
            />
          </ChartSeries>
        </Chart>
      </div>
    </>
  );
}
