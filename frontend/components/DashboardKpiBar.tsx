import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { useDashboard } from "../context/DashboardContext";
import { User } from "../types";

interface Props {
  user: User;
}

export default function DashboardKpiBar({ user }: Props) {
  const { talkId: ctxTalkId, snapshotIdx } = useDashboard();
  const effectiveTalkId = ctxTalkId || user.talks?.[0]?.id;
  const [kpis, setKpis] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (user.role === "speaker" && effectiveTalkId) {
      api.snapshots(effectiveTalkId).then((snaps) => {
        if (!snaps?.length) return;
        const snap = snaps[Math.min(snapshotIdx, snaps.length - 1)];
        if (!snap) return;
        api.demographics(effectiveTalkId, snap.id).then((demo) => {
          const juniorPct = demo.total > 0
            ? Math.round(((demo.age_groups["18-25"] || 0) + (demo.age_groups["26-35"] || 0)) / demo.total * 100)
            : 0;
          setKpis([
            { label: "Seats", value: `${demo.total}` },
            { label: "Knowledge", value: `${demo.familiarity_avg}/5` },
            { label: "Jr devs", value: `${juniorPct}%` },
            { label: "First-timers", value: `${demo.first_time_pct}%` },
            { label: "In person", value: `${demo.total - (demo.online_count || 0)}` },
            { label: "Remote", value: `${demo.online_count || 0}` },
            { label: "Avg exp", value: `${demo.avg_experience} yrs` },
            { label: "#1 interest", value: demo.tech_stacks?.[0]?.name ?? "—" },
          ]);
        });
      });
    } else if (user.role === "organizer" || user.role === "sponsor") {
      api.segments().then((seg) => {
        const jrPct = seg.total > 0
          ? Math.round(((seg.age_groups["18-25"] || 0) + (seg.age_groups["26-35"] || 0)) / seg.total * 100)
          : 0;
        const srPct = seg.total > 0
          ? Math.round(((seg.age_groups["36-45"] || 0) + (seg.age_groups["46+"] || 0)) / seg.total * 100)
          : 0;
        if (user.role === "organizer") {
          setKpis([
            { label: "Total", value: `${seg.total}` },
            { label: "Countries", value: `${seg.countries.length}` },
            { label: "Roles", value: `${seg.roles.length}` },
            { label: "Avg Exp", value: `${seg.avg_experience} yrs` },
            { label: "Top Role", value: seg.roles[0]?.name ?? "—" },
            { label: "Top Tech", value: seg.tech_stacks[0]?.name ?? "—" },
            { label: "Top Country", value: seg.countries[0]?.name ?? "—" },
            { label: "Jr devs", value: `${jrPct}%` },
          ]);
        } else {
          setKpis([
            { label: "Total", value: `${seg.total}` },
            { label: "Countries", value: `${seg.countries.length}` },
            { label: "Roles", value: `${seg.roles.length}` },
            { label: "Top Role", value: seg.roles[0]?.name ?? "—" },
            { label: "Top Tech", value: seg.tech_stacks[0]?.name ?? "—" },
            { label: "Top Country", value: seg.countries[0]?.name ?? "—" },
            { label: "Jr devs", value: `${jrPct}%` },
            { label: "Sr devs", value: `${srPct}%` },
          ]);
        }
      });
    }
  }, [user.role, effectiveTalkId, snapshotIdx]);

  if (kpis.length === 0) return null;

  return (
    <div style={{ padding: "0 16px" }}>
      <div className="kpi-row">
        {kpis.map((k) => (
          <div className="kpi" key={k.label}>
            <p className="kpi-label">{k.label}</p>
            <p className="kpi-value">{k.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
