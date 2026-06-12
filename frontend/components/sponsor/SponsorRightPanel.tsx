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
      <div className="panel-card-accent">
        <h3>Why Sponsor CrowdShift</h3>
        <div style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
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
          <table className="data-table">
            <thead>
              <tr>
                <th>Country</th>
                <th style={{ textAlign: "right" }}>Attendees</th>
              </tr>
            </thead>
            <tbody>
              {segments.countries.slice(0, 8).map((c) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td style={{ textAlign: "right" }}>{c.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="panel-card">
        <h3>Top Attendee Roles</h3>
        {segments && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Role</th>
                <th style={{ textAlign: "right" }}>Count</th>
              </tr>
            </thead>
            <tbody>
              {segments.roles.slice(0, 8).map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  <td style={{ textAlign: "right" }}>{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
