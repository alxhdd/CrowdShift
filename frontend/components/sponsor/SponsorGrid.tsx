import { useState, useEffect } from "react";
import { Grid, GridColumn, GridDataStateChangeEvent } from "@progress/kendo-react-grid";
import { process, State } from "@progress/kendo-data-query";
import { api } from "../../utils/api";

interface Cohort {
  segment: string;
  count: number;
  pct: number;
  top_interest: string;
  evaluating_pct: number;
  top_company_size: string;
}

const INITIAL_STATE: State = { skip: 0, take: 20, sort: [{ field: "count", dir: "desc" }], filter: undefined };

export default function SponsorGrid() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [dataState, setDataState] = useState<State>(INITIAL_STATE);

  useEffect(() => {
    api.cohorts().then(setCohorts);
  }, []);

  const result = process(cohorts, dataState);

  return (
    <div className="panel-card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <h3>Audience Cohorts ({cohorts.length} segments)</h3>
      <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "0 0 8px" }}>
        Each row is a group — segments under 5 people are suppressed for privacy.
      </p>
      <div style={{ overflow: "auto" }}>
        <Grid
          className="cohorts-grid"
          data={result}
          {...dataState}
          total={result.total}
          onDataStateChange={(e: GridDataStateChangeEvent) => setDataState(e.dataState)}
          sortable={true}
          filterable={true}
          pageable={{ buttonCount: 5, pageSizes: [20, 50] }}
          style={{ height: 500, fontSize: "0.8rem" }}
        >
          <GridColumn field="segment" title="Segment" width={260} filterable={true} />
          <GridColumn field="count" title="Count" filter="numeric" />
          <GridColumn
            field="pct"
            title="% of total"
            filter="numeric"
            cells={{ data: (props) => <td {...props.tdProps}>{props.dataItem.pct}%</td> }}
          />
          <GridColumn field="top_interest" title="Top interest" filterable={true} />
          <GridColumn field="top_company_size" title="Company size" filterable={true} />
          <GridColumn
            field="evaluating_pct"
            title="Evaluating a purchase"
            filter="numeric"
            cells={{ data: (props) => <td {...props.tdProps}>{props.dataItem.evaluating_pct}%</td> }}
          />
        </Grid>
      </div>
    </div>
  );
}
