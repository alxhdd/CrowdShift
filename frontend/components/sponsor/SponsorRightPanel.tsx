import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { Segments } from "../../types";

export default function SponsorRightPanel() {
  const [segments, setSegments] = useState<Segments | null>(null);

  useEffect(() => {
    api.segments().then(setSegments);
  }, []);

  return (
    <>
      <div className="panel-card">
        <h3>Why Sponsor CrowdShift</h3>
        <div style={{ fontSize: "0.85rem", color: "#555", lineHeight: 1.6 }}>
          <p>
            <strong>Targeted exposure.</strong> Your brand reaches attendees
            whose tech stack and interests match your product. No wasted
            impressions.
          </p>
          <p>
            <strong>Privacy-safe.</strong> You see aggregate trends — tech
            stacks, company sizes, roles — never individual attendee data.
          </p>
          <p>
            <strong>Measurable.</strong> Know exactly how many attendees match
            your ideal customer profile before committing.
          </p>
        </div>
      </div>

      {segments && (
        <div className="panel-card">
          <h3>Country Breakdown</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <th style={{ textAlign: "left", padding: "4px 8px" }}>Country</th>
                <th style={{ textAlign: "right", padding: "4px 8px" }}>Attendees</th>
              </tr>
            </thead>
            <tbody>
              {segments.countries.slice(0, 8).map((c) => (
                <tr key={c.name} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "4px 8px" }}>{c.name}</td>
                  <td style={{ textAlign: "right", padding: "4px 8px" }}>
                    {c.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="panel-card">
        <h3>Top Attendee Roles</h3>
        {segments && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <th style={{ textAlign: "left", padding: "4px 8px" }}>Role</th>
                <th style={{ textAlign: "right", padding: "4px 8px" }}>Count</th>
              </tr>
            </thead>
            <tbody>
              {segments.roles.slice(0, 8).map((r) => (
                <tr key={r.name} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "4px 8px" }}>{r.name}</td>
                  <td style={{ textAlign: "right", padding: "4px 8px" }}>
                    {r.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
