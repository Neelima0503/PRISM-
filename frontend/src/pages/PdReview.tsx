import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import type { Line, Submission } from "../api";
import { useAuth } from "../auth";
import { money, pct, signed, workflowText, WF_COLOR } from "../lib/format";
import {
  Button, Card, ChipCode, ErrorBox, Kpi, ORow, OutCard,
  PageHead, Pill, Rtag, Spinner,
} from "../components/ui";

export default function PdReview() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [rev, setRev] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.review(Number(id)).then(setRev).catch((e) => setError(String(e.message))).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  if (loading) return <Spinner label="Loading review…" />;
  if (error) return <ErrorBox message={error} />;
  if (!rev) return null;

  const a = rev.approval;
  const approved = a?.decision === "Approved";
  const canDecide = a?.status === "Submitted";
  const m = rev.metrics;

  // group submitted lines by module
  const modules: { name: string; lines: Line[] }[] = [];
  const subLines = rev.lines.filter((l) => l.type === "Fixed_Subcon");
  for (const l of rev.lines.filter((l) => l.type !== "Fixed_Subcon")) {
    let g = modules.find((x) => x.name === (l.module || "—"));
    if (!g) { g = { name: l.module || "—", lines: [] }; modules.push(g); }
    g.lines.push(l);
  }
  const totBase = rev.lines.reduce((s, l) => s + l.baselineDays, 0);
  const totEacMd = rev.lines.reduce((s, l) => s + l.eacDays, 0);
  const totEacCost = rev.lines.reduce((s, l) => s + l.eacCost, 0);
  const thc = "px-3.5 py-2.5 text-[10.3px] uppercase tracking-[0.08em] font-semibold text-ink3 bg-surface2 border-b border-border";

  const decide = async (decision: string) => {
    setBusy(true); setMsg(null);
    try {
      const next = await api.decide(Number(id), { userId: user?.id, decision, comments });
      setRev(next); setComments(""); setMsg(`Decision recorded: ${decision}.`);
    } catch (e) { setMsg(String((e as Error).message)); } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHead
        title="Period Review & Approval"
        crumb={<><button onClick={() => nav(`/projects/${rev.id}`)} className="hover:text-primary">{rev.name}</button> <span className="opacity-50">/</span> {rev.period}</>}
        meta={<>
          <ChipCode>{rev.code}</ChipCode>
          {a && (() => { const w = WF_COLOR[a.status] ?? WF_COLOR.Draft; return (
            <span className="rounded-full px-2.5 py-[3px] text-[10.5px] font-semibold" style={{ background: w.bg, color: w.fg }}>
              {workflowText(a.status, user?.role)}
            </span>
          ); })()}
          {rev.health && <Pill value={rev.health} />}
        </>}
        actions={<Button variant="ghost" onClick={() => nav(`/projects/${rev.id}`)}>View recognition</Button>}
      />

      {!a && (
        <div className="rounded-[10px] bg-amber-soft text-[#8f5e14] px-4 py-3 text-[13px] mb-[18px]">
          No submission exists for this period yet — the PM must submit first.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-[18px]">
        <Kpi accent="blue" label="POC (cost basis)" value={pct(m.poc)} sub={`${money(m.costToDate)} ÷ ${money(m.eac)}`} />
        <Kpi accent="red" label="Estimate at completion" value={money(m.eac)} />
        <Kpi accent="indigo" hi label="Forecast margin" value={pct(m.forecastMarginPct)} sub={`sold ${pct(m.soldMarginPct)} · ▼ ${((m.soldMarginPct - m.forecastMarginPct) * 100).toFixed(1)} pp`} />
        <Kpi accent="amber" label="This month revenue" value={money(m.periodRevenue)} />
        <Kpi accent="teal" label="Cumulative revenue" value={money(m.cumulativeRevenue)} />
      </div>

      <div className="grid lg:grid-cols-[1fr_332px] gap-[18px] items-start">
        <div className="space-y-[18px]">
          <Card pad={false}>
            <div className="px-[18px] py-3.5 border-b border-border">
              <h3 className="text-[14px] font-bold">Submitted effort &amp; cost</h3>
              <div className="text-[11.5px] text-ink3">Baseline vs forecast (EAC) by module &amp; resource line</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr>
                    {["Module / resource line", "Resource type", "Baseline effort (md)", "Forecast effort — EAC (md)", "Variance (md)", "Forecast cost — EAC ($)"].map((h, i) => (
                      <th key={h} className={`${thc} ${i >= 2 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((mod) => {
                    const mb = mod.lines.reduce((s, l) => s + l.baselineDays, 0);
                    const me = mod.lines.reduce((s, l) => s + l.eacDays, 0);
                    const mc = mod.lines.reduce((s, l) => s + l.eacCost, 0);
                    return (
                      <Fragment key={mod.name}>
                        <tr className="bg-surface2 border-y border-border">
                          <td className="px-3.5 py-2 font-bold" colSpan={2}><span className="inline-block w-[6px] h-[14px] rounded-[3px] bg-primary mr-2 align-middle" />{mod.name}</td>
                          <td className="px-3.5 py-2 text-right mono font-bold">{mb.toLocaleString()}</td>
                          <td className="px-3.5 py-2 text-right mono font-bold">{me.toLocaleString()}</td>
                          <td className={`px-3.5 py-2 text-right mono font-bold ${me - mb > 0 ? "text-red" : "text-green"}`}>{signed(me - mb)}</td>
                          <td className="px-3.5 py-2 text-right mono font-bold">{money(mc)}</td>
                        </tr>
                        {mod.lines.map((l) => {
                          const d = l.eacDays - l.baselineDays;
                          return (
                            <tr key={l.id} className="border-b border-surface3 hover:bg-primary-soft/20">
                              <td className="px-3.5 py-2 pl-8">{l.grade && <span className="mono text-[11px] text-ink2 bg-surface3 border border-border rounded px-1.5 mr-2">{l.grade}</span>}{l.name}</td>
                              <td className="px-3.5 py-2"><Rtag type={l.type} /></td>
                              <td className="px-3.5 py-2 text-right mono">{l.baselineDays.toLocaleString()}</td>
                              <td className="px-3.5 py-2 text-right mono">{l.eacDays.toLocaleString()}</td>
                              <td className={`px-3.5 py-2 text-right mono font-semibold ${d > 0 ? "text-red" : d < 0 ? "text-green" : "text-ink3"}`}>{signed(d)}</td>
                              <td className="px-3.5 py-2 text-right mono">{money(l.eacCost)}</td>
                            </tr>
                          );
                        })}
                      </Fragment>
                    );
                  })}
                  {subLines.map((l) => (
                    <tr key={l.id} className="border-b border-surface3 hover:bg-primary-soft/20 border-t border-border">
                      <td className="px-3.5 py-2 font-medium">{l.name}</td>
                      <td className="px-3.5 py-2"><Rtag type={l.type} /></td>
                      <td className="px-3.5 py-2 text-right text-ink3" colSpan={3}>fixed cost — no man-days</td>
                      <td className="px-3.5 py-2 text-right mono">{money(l.eacCost)}</td>
                    </tr>
                  ))}
                  <tr className="bg-primary text-white font-semibold">
                    <td className="px-3.5 py-2.5" colSpan={2}>Total</td>
                    <td className="px-3.5 py-2.5 text-right mono">{totBase.toLocaleString()}</td>
                    <td className="px-3.5 py-2.5 text-right mono">{totEacMd.toLocaleString()}</td>
                    <td className="px-3.5 py-2.5 text-right mono">{signed(totEacMd - totBase)}</td>
                    <td className="px-3.5 py-2.5 text-right mono">{money(totEacCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-[18px]">
          <OutCard
            caption={`Review · ${rev.period}`}
            headline={pct(m.forecastMarginPct)}
            headSub={`sold ${pct(m.soldMarginPct)}`}
            gradient={approved ? "green" : "blue"}
          >
            <ORow k="POC (cost basis)" v={pct(m.poc)} />
            <ORow k="Estimate at completion" v={money(m.eac)} />
            <ORow k="Committed POC" v={pct(rev.committedPoc ?? 0)} />
            <ORow k="Prior YTD (frozen)" v={money(m.priorYtd)} />

            {approved ? (
              <div className="mt-4 text-[12px] text-ink2">
                Approved {a?.approver && `by ${a.approver}`}. Released to Finance for recognition.
                {a?.comments && <div className="text-ink3 mt-1">“{a.comments}”</div>}
              </div>
            ) : (
              <div className="mt-4">
                <div className="text-[10.5px] uppercase tracking-wide text-ink3 font-semibold mb-1.5">Decision</div>
                <textarea
                  value={comments} onChange={(e) => setComments(e.target.value)} disabled={!canDecide} rows={3}
                  placeholder="Add a note for the PM…"
                  className="w-full rounded-[9px] border border-border2 px-[11px] py-[9px] text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft2 disabled:bg-surface3"
                />
                <div className="grid gap-2 mt-2.5">
                  <Button variant="green" onClick={() => decide("Approved")} disabled={!canDecide || busy}>Approve</Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="ghost" onClick={() => decide("Held")} disabled={!canDecide || busy}>Hold</Button>
                    <Button variant="danger" onClick={() => decide("Rejected")} disabled={!canDecide || busy}>Reject</Button>
                  </div>
                </div>
                {!canDecide && a && <p className="text-[11px] text-ink3 mt-2">Awaiting a fresh PM submission to act on.</p>}
                {msg && <p className="text-[11px] text-primary mt-2">{msg}</p>}
              </div>
            )}
          </OutCard>
        </div>
      </div>
    </div>
  );
}
