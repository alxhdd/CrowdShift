import { useState, useEffect } from "react";
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartLegend,
} from "@progress/kendo-react-charts";
import { api } from "../../utils/api";
import { Segments } from "../../types";

export default function OrganizerRightPanel() {
  const [segments, setSegments] = useState<Segments | null>(null);

  useEffect(() => {
    api.segments().then(setSegments);
  }, []);

  const techData = segments
    ? segments.tech_stacks.slice(0, 6).map((t) => ({
        category: t.name,
        value: t.count,
      }))
    : [];

  return (
    <>
      <div className="panel-card">
        <h3>Audience Overview</h3>
        {segments && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              ["Total", segments.total],
              ["Countries", segments.countries.length],
              ["Avg Experience", "4.2 yrs"],
              ["Top Role", segments.roles[0]?.name ?? "—"],
            ].map(([label, value]) => (
              <div key={label as string} style={{ background: "#f8f9fa", padding: 12, borderRadius: 6 }}>
                <div style={{ fontSize: "0.75rem", color: "#999" }}>{label}</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
        )}
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
              color="#34a853"
            />
          </ChartSeries>
        </Chart>
      </div>

      <div className="panel-card">
        <h3>Marketing Copy</h3>
        <div style={{ fontSize: "0.85rem", color: "#555", lineHeight: 1.6 }}>
          <p>
            <strong>React Summit track:</strong> 60% of attendees are junior to
            mid-level developers passionate about React and TypeScript. Target
            LinkedIn ads at developers aged 22–35 in London, Berlin, and
            Amsterdam.
          </p>
          <p>
            <strong>JSNation track:</strong> Backend-leaning audience. 40% use
            TypeScript daily. Highlight API design and testing topics in
            promotional content.
          </p>
        </div>
      </div>
    </>
  );
}
