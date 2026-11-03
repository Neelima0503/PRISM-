import type { ReactNode } from "react";
import type { Line, ProjectDetail } from "../api";
import { money, pct, signed } from "../lib/format";
import { Card, CardHead, Pill, Rtag } from "./ui";

export const CAT_COLOR: Record<string, string> = {
  "Own FTE": "#0072bc", Freelancer: "#b9791a", "Fixed Subcon": "#0d9488",
};

export interface CatAgg {
  type: string; typeLabel: string;
  baselineCost: number; actualCost: number; etcCost: number; eacCost: number;
  baselineDays: number; actualDays: number; etcDays: number; eacDays: number;
}

/** Aggregate detailed effort lines into the 3 resource categories. */
export function byCategory(lines: Line[]): CatAgg[] {
  const order = ["Own_FTE", "Freelancer", "Fixed_Subcon"];
  const map: Record<string, CatAgg> = {};
  for (const l of lines) {
    const c = (map[l.type] ??= {
      type: l.type, typeLabel: l.typeLabel,
      baselineCost: 0, actualCost: 0, etcCost: 0, eacCost: 0,
      baselineDays: 0, actualDays: 0, etcDays: 0, eacDays: 0,
    });
    c.baselineCost += l.baselineCost; c.actualCost += l.actualCost; c.etcCost += l.etcCost; c.eacCost += l.eacCost;
    c.baselineDays += l.baselineDays; c.actualDays += l.actualDays; c.etcDays += l.etcDays; c.eacDays += l.eacDays;
  }
  return order.filter((t) => map[t]).map((t) => map[t]);
}

/* shared cell helpers — bordered, highlighted table structure */
const th = "px-3.5 py-2.5 text-[10.3px] uppercase tracking-[0.08em] font-semibold text-ink3 bg-surface2 border-b border-border border-r border-border last:border-r-0";
const td = "px-3.5 py-2.5 border-b border-surface3 border-r border-surface3 last:border-r-0";

export function TableFrame({ children }: { children: ReactNode }) {
  return <div className="rounded-[10px] border border-border overflow-x-auto">{children}</div>;
}

function WFBox({ label, value, tone }: { label: string; value: string; tone?: "fin" | "neg" }) {
  const cls = tone === "fin"
    ? "bg-teal-soft border-teal/40 text-[#0a6b62]"
    : tone === "neg"
    ? "bg-red-soft border-red/40 text-[#a83a2b]"
    : "bg-surface2 border-border text-ink";
  return (
    <div className={`rounded-[11px] border px-4 py-3 ${cls} min-w-[128px]`}>
      <div className="text-[10.5px] uppercase tracking-wide text-ink3">{label}</div>
      <div className="mono text-[17px] font-semibold mt-0.5">{value}</div>
    </div>
  );
}

export function CostRollup({ d }: { d: ProjectDetail }) {
  const m = d.metrics;
  return (
    <Card>
      <CardHead title="Cost roll-up — POC basis" desc="Actual cost ÷ EAC drives percent-of-completion" />
      <TableFrame>
        <table className="w-full text-[12.6px]">
          <thead>
            <tr>
              {["Cost element", "Actual to date", "Est. to complete", "Est. at completion", "% of EAC"].map((h, i) => (
                <th key={h} className={`${th} ${i ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {byCategory(d.lines).map((l) => (
              <tr key={l.type} className="hover:bg-primary-soft/30">
                <td className={td}><Rtag type={l.type} /></td>
                <td className={`${td} text-right mono`}>{money(l.actualCost)}</td>
                <td className={`${td} text-right mono`}>{money(l.etcCost)}</td>
                <td className={`${td} text-right mono`}>{money(l.eacCost)}</td>
                <td className={`${td} text-right mono text-ink2`}>{pct(l.eacCost / Math.max(1, m.eac), 1)}</td>
              </tr>
            ))}
            <tr className="bg-primary text-white font-semibold">
              <td className="px-3.5 py-2.5">Total project cost</td>
              <td className="px-3.5 py-2.5 text-right mono">{money(m.costToDate)}</td>
              <td className="px-3.5 py-2.5 text-right mono">{money(m.etc)}</td>
              <td className="px-3.5 py-2.5 text-right mono">{money(m.eac)}</td>
              <td className="px-3.5 py-2.5 text-right mono">100%</td>
            </tr>
          </tbody>
        </table>
      </TableFrame>
      <div className="mt-3.5 rounded-[10px] bg-primary-soft border border-primary-soft2 px-3.5 py-3 text-[12px] text-primary2">
        <b>POC</b> = {money(m.costToDate)} ÷ {money(m.eac)} = <b>{pct(m.poc)}</b> &nbsp;→&nbsp; cumulative revenue = {money(m.tcv)} × {pct(m.poc)} = <b>{money(m.cumulativeRevenue)}</b>
      </div>
    </Card>
  );
}

export function RevenueWaterfall({ d }: { d: ProjectDetail }) {
  const m = d.metrics;
  return (
    <Card>
      <CardHead title={`Revenue recognition — ${d.period}`} desc="Cost-based POC per IFRS 15" />
      <div className="flex items-center gap-3 flex-wrap">
        <WFBox label="Contract value (TCV)" value={money(m.tcv)} />
        <span className="text-ink3 text-lg">×</span>
        <WFBox label="POC %" value={pct(m.poc)} />
        <span className="text-ink3 text-lg">=</span>
        <WFBox label="YTD earned" value={money(m.cumulativeRevenue)} />
        <span className="text-ink3 text-lg">−</span>
        <WFBox label="Prior YTD" value={money(m.priorYtd)} />
        <span className="text-ink3 text-lg">=</span>
        <WFBox label={`${d.period} revenue`} value={money(m.periodRevenue)} tone="fin" />
      </div>
    </Card>
  );
}

export function CommittedVsActual({ d }: { d: ProjectDetail }) {
  const c = d.commitment;
  return (
    <Card>
      <CardHead title={`Committed vs actual — ${d.period}`} desc="Against last month's forecast" />
      <div className="flex items-center gap-3 flex-wrap">
        <WFBox label={`Committed (POC ${pct(c.committedPoc)})`} value={money(c.committed)} />
        <span className="text-ink3 text-lg">vs</span>
        <WFBox label={`Actual (POC ${pct(c.actualPoc)})`} value={money(c.actualRecognised)} />
        <span className="text-ink3 text-lg">=</span>
        <WFBox label="Delivery variance" value={`${signed(c.variance)} · ${pct(c.variancePct, 1)}`} tone={c.variance < 0 ? "neg" : undefined} />
      </div>
    </Card>
  );
}

export function RecognitionLedger({ d }: { d: ProjectDetail }) {
  return (
    <Card>
      <CardHead title="Recognition ledger" desc="Frozen prior periods + live current period" />
      <TableFrame>
        <table className="w-full text-[12.6px]">
          <thead>
            <tr>
              {["Period", "Cost to date", "EAC", "POC %", "YTD revenue", "Prior YTD", "Month revenue", "Status"].map((h, i) => (
                <th key={h} className={`${th} ${i && i < 7 ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.ledger.map((r, i) => (
              <tr key={i} className={!r.frozen ? "bg-primary-soft" : "hover:bg-primary-soft/30"}>
                <td className={`${td} font-medium`}>
                  {r.period} {r.frozen ? <span className="text-[10px] text-ink3">🔒</span> : <span className="text-[10px] text-primary">live</span>}
                </td>
                <td className={`${td} text-right mono`}>{money(r.costToDate)}</td>
                <td className={`${td} text-right mono`}>{money(r.eac)}</td>
                <td className={`${td} text-right mono`}>{pct(r.poc)}</td>
                <td className={`${td} text-right mono`}>{money(r.cumulativeRevenue)}</td>
                <td className={`${td} text-right mono text-ink3`}>{money(r.priorYtd)}</td>
                <td className={`${td} text-right mono font-semibold ${r.periodRevenue < 0 ? "text-red" : ""}`}>{money(r.periodRevenue)}</td>
                <td className={td}><Pill value={r.frozen ? "Recognised" : "Approved"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableFrame>
    </Card>
  );
}
