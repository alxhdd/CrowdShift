import { useState, useEffect } from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { api } from "../../utils/api";
import { Attendee } from "../../types";

export default function OrganizerLeftPanel() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  useEffect(() => {
    api.attendees().then(setAttendees);
  }, []);

  return (
    <div className="panel-card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <h3>All Attendees ({attendees.length})</h3>
      <div style={{ flex: 1, overflow: "auto" }}>
        <Grid
          data={attendees.slice(0, 100)}
          style={{ height: "100%", fontSize: "0.8rem" }}
        >
          <GridColumn field="name" title="Name" width="150px" />
          <GridColumn field="email" title="Email" width="180px" />
          <GridColumn field="role" title="Role" width="140px" />
          <GridColumn field="company" title="Company" width="130px" />
          <GridColumn field="country" title="Country" width="90px" />
          <GridColumn field="ticket_type" title="Ticket" width="90px" />
          <GridColumn field="tech_interests" title="Tech" width="180px" />
          <GridColumn field="experience_years" title="Exp (yrs)" width="80px" />
          <GridColumn field="goal" title="Goal" width="140px" />
        </Grid>
      </div>
      <p style={{ fontSize: "0.75rem", color: "#999", marginTop: 8 }}>
        Showing first 100 of {attendees.length} attendees
      </p>
    </div>
  );
}
