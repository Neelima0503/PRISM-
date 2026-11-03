import { useParams } from "react-router-dom";
import {
  Area, CartesianGrid, ComposedChart, Line as RLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis, BarChart, Bar, Cell,
} from "recharts";
import { api } from "../api";
import type { ProjectDetail as Detail } from "../api";
import { useState } from "react";
import { useAuth } from "../auth";
import { useAsync } from "../lib/useAsync";
import { money, pct, signed, workflowText, WF_COLOR } from "../lib/format";
import { Button, Card, CardHead, ChipCode, ErrorBox, Kpi, MixBar, ORow, OutCard, PageHead, Rtag, Spinner } from "../components/ui";

const RAG: Record<string, string> = { Green: "#1a8a52", Amber: "#b9791a", Red: "#cb4634" };
import { byCategory, CAT_COLOR, CostRollup, CommittedVsActual, RecognitionLedger, RevenueWaterfall, TableFrame } from "../components/recognition";

function exportExcel(d: Detail) {
  const rows = d.lines.map((l) => `<tr><td>${l.typeLabel}</td><td>${l.actualCost}</td><td>${l.etcCost}</td><td>${l.eacCost}</td></tr>`).join("");
  const html = `<table border=1><tr><th>Category</th><th>Actual</th><th>ETC</th><th>EAC</th></tr>${rows}</table>`;
  const url = URL.createObjectURL(new Blob([html], { type: "application/vnd.ms-excel" }));
  const a = document.createElement("a");
  a.href = url; a.download = `${d.code}_revenue.xls`; a.click(); URL.revokeObjectURL(url);
}

function TrendTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload;
  return (
    <div className="rounded-lg bg-white shadow-card2 border border-border p-3 text-[11px]">
      <div className="font-semibold mb-1">{label}</div>
      <div className="text-ink3 mono">Baseline {r.baseline} md</div>
      <div className="text-primary mono">Actual {r.total} md</div>
      <div className={`mono ${r.drift >= 0 ? "text-red" : "text-green"}`}>Drift {signed(r.drift)} md</div>
    </div>
  );
}

const thc = "px-3.5 py-2.5 text-[10.3px] uppercase tracking-[0.08em] font-semibold text-ink3 bg-surface2 border-b border-border border-r border-border last:border-r-0";
const tdc = "px-3.5 py-2.5 border-b border-surface3 border-r border-surface3 last:border-r-0";

export default function ProjectDetail() {
  const { id } = useParams();
  const { canRecognise } = useAuth();
  const { data: d, loading, error, reload } = useAsync(() => api.project(Number(id)), [id]);
  const [busy, setBusy] = useState(false);

  if (loading) return <Spinner label="Loading project…" />;
  if (error) return <ErrorBox message={error} />;
  if (!d) return null;
  const m = d.metrics, c = d.commitment;

  const recognise = async () => {
    setBusy(true);
    try { await api.recognise(Number(id), {}); reload(); } finally { setBusy(false); }
  };
  const wf = WF_COLOR[d.workflowStatus] ?? WF_COLOR.Draft;
  const eacDelta = m.eac - m.baselineCost;

  const cats = byCategory(d.lines);
  const comp = cats.map((l) => ({
    label: l.typeLabel, value: l.eacCost, color: CAT_COLOR[l.typeLabel] ?? "#0072bc",
    display: `${money(l.eacCost)} · ${pct(l.eacCost / Math.max(1, m.eac), 1)}`,
  }));

  return (
    <div>
      <PageHead
        title="Cost-based POC Revenue Recognition"
        crumb={<><span>Revenue Recognition</span> <span className="opacity-50">/</span> <b className="text-ink2">{d.name}</b> <span className="opacity-50">/</span> {d.period}</>}
        meta={<>
          <ChipCode>{d.code}</ChipCode>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-ink2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: RAG[d.health] ?? RAG.Green }} title={`Health: ${d.health}`} />
            {d.customer} · {d.businessUnit}
          </span>
          <span className="rounded-full px-2.5 py-[3px] text-[10.5px] font-semibold" style={{ background: wf.bg, color: wf.fg }}>
            {workflowText(d.workflowStatus, canRecognise ? "Finance" : undefined)}
          </span>
        </>}
        actions={<>
          <Button variant="ghost" onClick={() => exportExcel(d)}>Export to Excel</Button>
          {canRecognise && d.workflowStatus === "Approved" && (
            <Button variant="primary" onClick={recognise} disabled={busy}>{busy ? "Locking…" : "Recognise & lock period"}</Button>
          )}
          {canRecognise && d.workflowStatus === "Locked" && (
            <Button variant="ghost" disabled>🔒 Recognised &amp; locked</Button>
          )}
        </>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-[18px]">
        <Kpi accent="blue" label="POC % (cost basis)" value={pct(m.poc)} sub="actual ÷ EAC cost" />
        <Kpi accent="indigo" label="Cost incurred to date" value={money(m.costToDate)} />
        <Kpi accent="amber" label="Estimate to complete" value={money(m.etc)} sub="remaining cost" />
        <Kpi accent="red" label="Estimate at completion" value={money(m.eac)} sub={`${signed(eacDelta)} vs baseline`} deltaTone="neg" />
        <Kpi accent="teal" hi label="Forecast margin" value={pct(m.forecastMarginPct)} sub={`▼ ${((m.soldMarginPct - m.forecastMarginPct) * 100).toFixed(1)} pp vs sold ${pct(m.soldMarginPct)}`} />
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_332px] gap-[18px] items-start">
        <div className="space-y-[18px] min-w-0">
          <CostRollup d={d} />

          {/* Effort variance (highlighted) */}
          <Card>
            <CardHead title="Effort variance — baseline vs forecast" desc="Man-days by resource category" />
            <TableFrame>
              <table className="w-full text-[12.6px]">
                <thead>
                  <tr>
                    {["Resource category", "Baseline", "Actual", "ETC", "EAC", "Δ vs baseline"].map((h, i) => (
                      <th key={h} className={`${thc} ${i ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cats.map((l) => {
                    const sub = l.type === "Fixed_Subcon";
                    const delta = l.eacDays - l.baselineDays;
                    return (
                      <tr key={l.type} className="hover:bg-primary-soft/30">
                        <td className={tdc}><Rtag type={l.type} /></td>
                        {sub ? (
                          <td className={`${tdc} text-right text-ink3`} colSpan={4}>fixed cost — no man-days</td>
                        ) : (
                          <>
                            <td className={`${tdc} text-right mono`}>{l.baselineDays.toLocaleString()}</td>
                            <td className={`${tdc} text-right mono`}>{l.actualDays.toLocaleString()}</td>
                            <td className={`${tdc} text-right mono`}>{l.etcDays.toLocaleString()}</td>
                            <td className={`${tdc} text-right mono`}>{l.eacDays.toLocaleString()}</td>
                          </>
                        )}
                        <td className={`${tdc} text-right mono font-semibold ${sub ? "text-ink3" : delta > 0 ? "text-red" : "text-green"}`}>
                          {sub ? "—" : `${signed(delta)} md`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableFrame>
          </Card>

          {/* EAC effort trend */}
          <Card>
            <CardHead title="EAC effort trend vs baseline" desc="Cumulative man-days, Apr → Sep" />
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={d.trend} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eceef3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<TrendTip />} />
                  <Area type="monotone" dataKey="total" stroke="#0d9488" strokeWidth={2} fill="url(#g)" />
                  <RLine type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                  <RLine type="monotone" dataKey="own" stroke="#0072bc" strokeWidth={1.5} dot={false} />
                  <RLine type="monotone" dataKey="freelancer" stroke="#b9791a" strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <RevenueWaterfall d={d} />
          <CommittedVsActual d={d} />
          <RecognitionLedger d={d} />
        </div>

        {/* right rail */}
        <div className="space-y-[18px]">
          <OutCard
            caption={`Current month revenue · ${d.period}`}
            headline={money(m.periodRevenue)}
            headSub={`YTD recognised ${money(m.cumulativeRevenue)} of ${money(m.tcv)}`}
          >
            <ORow k="YTD recognised" v={money(m.cumulativeRevenue)} />
            <ORow k="Revenue backlog" v={money(m.backlog)} />
            <ORow k="Committed (last fc)" v={money(c.committed)} />
            <ORow k="Delivery vs commitment" v={`${signed(c.variance)} · ${pct(c.variancePct, 1)}`} tone={c.variance < 0 ? "neg" : "pos"} />
            <ORow k="Forecast margin" v={pct(m.forecastMarginPct)} tone="neg" />
            <ORow k="Sold margin (baseline)" v={pct(m.soldMarginPct)} />
            <div className="text-[10.5px] uppercase tracking-[0.08em] text-ink3 font-semibold mt-4 mb-1.5">EAC cost composition</div>
            <MixBar parts={comp} />
            <div className="mt-3 text-[11.5px] text-ink3">
              EAC vs baseline <span className="mono text-red font-semibold">{signed(eacDelta)} · {pct(eacDelta / Math.max(1, m.baselineCost), 1)}</span>
            </div>
          </OutCard>

          <Card>
            <CardHead title="Monthly recognised revenue" desc="$k per period" />
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.ledger} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eceef3" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 9 }} tickFormatter={(v) => String(v).slice(0, 3)} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}`} />
                  <Tooltip formatter={(v: number) => money(v)} />
                  <Bar dataKey="periodRevenue" radius={[4, 4, 0, 0]}>
                    {d.ledger.map((r, i) => <Cell key={i} fill={r.frozen ? "#9cc3e4" : "#0072bc"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
