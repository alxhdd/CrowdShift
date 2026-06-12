import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { Segments } from "../../types";

export default function OrganizerRightPanel() {
  const [segments, setSegments] = useState<Segments | null>(null);

  useEffect(() => {
    api.segments().then(setSegments);
  }, []);

  if (!segments) {
    return <div className="panel">Loading...</div>;
  }

  return (
    <>
      <div className="panel">
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

      <div className="panel">
        <h3>Top Attendee Roles</h3>
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
      </div>
    </>
  );
}
