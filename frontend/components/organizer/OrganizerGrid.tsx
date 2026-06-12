import { useState, useEffect } from "react";
import { Grid, GridColumn, GridDataStateChangeEvent } from "@progress/kendo-react-grid";
import { process, State } from "@progress/kendo-data-query";
import { api } from "../../utils/api";
import { Attendee } from "../../types";

const INITIAL_STATE: State = { skip: 0, take: 20, sort: [], filter: undefined };

export default function OrganizerGrid() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [dataState, setDataState] = useState<State>(INITIAL_STATE);

  useEffect(() => {
    api.attendees().then(setAttendees);
  }, []);

  const result = process(attendees, dataState);

  return (
    <div className="panel-card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <h3>All Attendees ({attendees.length})</h3>
      <div style={{ overflow: "auto" }}>
        <Grid
          data={result}
          {...dataState}
          total={result.total}
          onDataStateChange={(e: GridDataStateChangeEvent) => setDataState(e.dataState)}
          filterable={true}
          sortable={true}
          pageable={{ buttonCount: 5, pageSizes: [20, 50, 100] }}
          style={{ height: 500, fontSize: "0.8rem" }}
        >
          <GridColumn field="name" title="Name" width="140px" filterable={true} />
          <GridColumn field="email" title="Email" width="190px" filterable={true} />
          <GridColumn field="role" title="Role" width="140px" filterable={true} />
          <GridColumn field="company" title="Company" width="130px" filterable={true} />
          <GridColumn field="company_size" title="Size" width="70px" filterable={true} />
          <GridColumn field="country" title="Country" width="90px" filterable={true} />
          <GridColumn field="ticket_type" title="Ticket" width="85px" filterable={true} />
          <GridColumn field="attendance_mode" title="Mode" width="75px" filterable={true} />
          <GridColumn field="familiarity" title="Fam" width="60px" filter="numeric" />
          <GridColumn field="tech_interests" title="Tech" width="140px" filterable={true} />
          <GridColumn field="expectations" title="Expects" width="160px" filterable={true} />
          <GridColumn field="experience_years" title="Exp" width="60px" filter="numeric" />
        </Grid>
      </div>
    </div>
  );
}
