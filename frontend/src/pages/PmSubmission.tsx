import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import type { Line, Submission } from "../api";
import { useAuth } from "../auth";
import { money, pct, signed } from "../lib/format";
import {
  Button, Card, CardHead, ChipCode, ErrorBox, ORow, OutCard,
  PageHead, Pill, Rtag, Segmented, Spinner,
} from "../components/ui";

function spread(total: number, k: number): number[] {
  if (k <= 0) return [];
  const base = Math.floor(total / k);
  const arr = Array(k).fill(base);
  arr[k - 1] += total - base * k;
  return arr;
}

export default function PmSubmission() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, canSubmit } = useAuth();
  const [sub, setSub] = useState<Submission | null>(null);
  const [sched, setSched] = useState<Record<number, number[]>>({});
  const [cumVals, setCumVals] = useState<Record<number, number>>({});
  const [etcVals, setEtcVals] = useState<Record<number, number>>({});
  const [subComp, setSubComp] = useState<Record<number, number>>({});
  const [mode, setMode] = useState<"Cumulative" | "By month">("Cumulative");
  const [remark, setRemark] = useState("");
  const [savedOnce, setSavedOnce] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.submission(Number(id)).then((s) => { setSub(s); setSched({}); setCumVals({}); setEtcVals({}); setSubComp({}); setSavedOnce(false); })
      .catch((e) => setError(String(e.message))).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  if (loading) return <Spinner label="Loading submission…" />;
  if (error) return <ErrorBox message={error} />;
  if (!sub) return null;

  const months = sub.months, cur = sub.currentIdx;
  const status = sub.approval?.status ?? "Draft";
  const approved = status === "Approved" || status === "Locked";
  const submitted = status === "Submitted";
  const editable = canSubmit && status === "Draft";
  const viewOnly = !canSubmit;
  const byMonth = mode === "By month";

  const nonSub = sub.lines.filter((l) => l.type !== "Fixed_Subcon");
  const subs = sub.lines.filter((l) => l.type === "Fixed_Subcon");

  const getSched = (l: Line) => sched[l.id] ?? (l.sched ? [...l.sched] : Array(months.length).fill(0));
  const setMonthVal = (l: Line, i: number, v: number) => {
    const arr = [...getSched(l)]; arr[i] = v; setSched((s) => ({ ...s, [l.id]: arr }));
  };
  const cumOf = (l: Line) => getSched(l).slice(0, cur + 1).reduce((a, b) => a + (Number(b) || 0), 0);
  const etcOf = (l: Line) => getSched(l).slice(cur + 1).reduce((a, b) => a + (Number(b) || 0), 0);
  const frozenOf = (l: Line) => getSched(l).slice(0, cur).reduce((a, b) => a + (Number(b) || 0), 0);
  // cumulative mode keeps its own raw edit values so typing echoes freely
  const cumVal = (l: Line) => cumVals[l.id] ?? cumOf(l);
  const etcVal = (l: Line) => etcVals[l.id] ?? etcOf(l);
  // mode-aware current figures
  const cum = (l: Line) => (byMonth ? cumOf(l) : cumVal(l));
  const etc = (l: Line) => (byMonth ? etcOf(l) : etcVal(l));
  // a cumulative figure can't be less than what's already frozen in prior months
  const cumInvalid = (l: Line) => !byMonth && l.type !== "Fixed_Subcon" && Number(cumVal(l)) < frozenOf(l);
  const anyInvalid = nonSub.some(cumInvalid);
  // build the 12-month schedule to persist (preserves frozen months)
  const schedForSave = (l: Line) => {
    if (byMonth) return getSched(l);
    const base = getSched(l);
    const frozen = base.slice(0, cur);
    const sep = Math.max(0, Math.round(Number(cumVal(l))) - frozenOf(l));
    const fut = spread(Math.max(0, Math.round(Number(etcVal(l)))), months.length - cur - 1);
    return [...frozen, sep, ...fut];
  };

  const compOf = (l: Line) => subComp[l.id] ?? l.completionPct;
  const lineCost = (l: Line) => {
    if (l.type === "Fixed_Subcon") { const c = compOf(l); return { a: l.fixedPrice * c, e: l.fixedPrice * (1 - c) }; }
    return { a: cum(l) * l.rate, e: etc(l) * l.rate };
  };

  // live totals drive the entry grid + cost table (the right-rail tile uses saved metrics)
  const totA = sub.lines.reduce((s, l) => s + lineCost(l).a, 0);
  const totE = sub.lines.reduce((s, l) => s + lineCost(l).e, 0);
  const totEac = totA + totE;
  const baseCost = sub.lines.reduce((s, l) => s + l.baselineCost, 0);
  const cumMd = nonSub.reduce((s, l) => s + cum(l), 0);
  const etcMd = nonSub.reduce((s, l) => s + etc(l), 0);

  // right-rail tile shows the LAST SAVED figures (updates only on recalculate)
  const savedCum = (l: Line) => (l.sched ?? []).slice(0, cur + 1).reduce((a, b) => a + (Number(b) || 0), 0);
  const savedEtc = (l: Line) => (l.sched ?? []).slice(cur + 1).reduce((a, b) => a + (Number(b) || 0), 0);
  const savedCumMd = nonSub.reduce((s, l) => s + savedCum(l), 0);
  const savedEtcMd = nonSub.reduce((s, l) => s + savedEtc(l), 0);
  const M = sub.metrics;
  const dirty = !![...Object.keys(sched), ...Object.keys(cumVals), ...Object.keys(etcVals), ...Object.keys(subComp)].length;

  const catRows = ["Own_FTE", "Freelancer", "Fixed_Subcon"]
    .filter((t) => sub.lines.some((l) => l.type === t))
    .map((t) => {
      const ls = sub.lines.filter((l) => l.type === t);
      return { type: t, a: ls.reduce((s, l) => s + lineCost(l).a, 0), e: ls.reduce((s, l) => s + lineCost(l).e, 0) };
    });

  // group matrix + cost by module
  const modules: { name: string; lines: Line[] }[] = [];
  for (const l of nonSub) {
    let g = modules.find((x) => x.name === (l.module || "—"));
    if (!g) { g = { name: l.module || "—", lines: [] }; modules.push(g); }
    g.lines.push(l);
  }

  const save = async (submit: boolean) => {
    if (anyInvalid) { setMsg("Fix the highlighted cumulative values — they can't be below the frozen prior-month actuals."); return; }
    setSaving(true); setMsg(null);
    try {
      const payload = {
        userId: user?.id, submit,
        lines: sub.lines.map((l) => l.type === "Fixed_Subcon"
          ? { id: l.id, completionPct: compOf(l) }
          : { id: l.id, sched: schedForSave(l) }),
      };
      const next = await api.saveSubmission(Number(id), payload);
      setSub(next); setSched({}); setCumVals({}); setEtcVals({}); setSubComp({});
      if (!submit) setSavedOnce(true);
      setMsg(submit ? "Submitted to PD for approval." : "Draft saved & recalculated.");
    } catch (e) { setMsg(String((e as Error).message)); } finally { setSaving(false); }
  };

  const switchMode = (next: string) => {
    if (next === mode) return;
    if (next === "By month") {
      // bake any cumulative edits into the month schedule before showing months
      const upd: Record<number, number[]> = {};
      for (const l of nonSub) if (cumVals[l.id] !== undefined || etcVals[l.id] !== undefined) upd[l.id] = schedForSave(l);
      if (Object.keys(upd).length) setSched((s) => ({ ...s, ...upd }));
    }
    setCumVals({}); setEtcVals({});
    setMode(next as typeof mode);
  };

  const th = "px-2.5 py-2 text-[10px] uppercase tracking-[0.06em] font-semibold text-ink3 bg-surface2 border-b border-border border-r border-border last:border-r-0";
  const tdc = "px-2.5 py-1.5 border-b border-surface3 border-r border-surface3 last:border-r-0";

  return (
    <div>
      <PageHead
        title="Monthly Actuals & ETC Submission"
        crumb={<><button onClick={() => nav(`/projects/${sub.id}`)} className="hover:text-primary">{sub.name}</button> <span className="opacity-50">/</span> {sub.period}</>}
        meta={<>
          <ChipCode>{sub.code}</ChipCode>
          <span className="text-[12px] text-ink2">{sub.customer} · {sub.period}</span>
          {sub.approval && <Pill value={approved ? "Approved" : "Submitted"} />}
        </>}
        actions={editable ? <>
          <Button variant="ghost" onClick={() => save(false)} disabled={saving || anyInvalid}>Save draft &amp; recalculate</Button>
          <Button variant="primary" onClick={() => save(true)} disabled={saving || anyInvalid || !savedOnce || dirty || !remark.trim()}>
            {saving ? "Submitting…" : "Submit for approval"}
          </Button>
        </> : (submitted ? <Button variant="ghost" disabled>Submitted ✓</Button> : undefined)}
      />

      {approved && <div className="rounded-[10px] bg-green-soft text-[#157045] px-4 py-3 text-[13px] mb-[18px]">{status === "Locked" ? "Recognised & locked by Finance." : `Approved by ${sub.approval?.approver}.`} Inputs are read-only.</div>}
      {canSubmit && submitted && <div className="rounded-[10px] bg-primary-soft text-primary2 px-4 py-3 text-[13px] mb-[18px]">Submitted — awaiting PD approval. Inputs are locked; if the PD holds or rejects, this reopens as a draft for editing.</div>}
      {editable && sub.approval && (sub.approval.decision === "Held" || sub.approval.decision === "Rejected") && (
        <div className="rounded-[10px] bg-amber-soft text-[#8f5e14] px-4 py-3 text-[13px] mb-[18px]">
          Returned by {sub.approval.approver ?? "the PD"} ({sub.approval.decision}){sub.approval.comments ? ` — “${sub.approval.comments}”` : ""}. Please revise the actuals / ETC and resubmit.
        </div>
      )}
      {viewOnly && !approved && <div className="rounded-[10px] bg-primary-soft text-primary2 px-4 py-3 text-[13px] mb-[18px]">View only — monthly actuals are entered by the Project Manager. Showing the latest saved figures for {sub.period}.</div>}
      {anyInvalid && <div className="rounded-[10px] bg-red-soft text-[#a83a2b] px-4 py-3 text-[13px] mb-[18px]">⚠ Some cumulative actuals are below the already-frozen prior-month totals (highlighted red). The cumulative can’t be less than what’s locked in Apr–Aug — fix them to save or submit.</div>}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_332px] gap-[18px] items-start">
        <div className="space-y-[18px] min-w-0">
          {/* Resource actuals matrix */}
          <Card pad={false}>
            <div className="flex items-center gap-3 px-[18px] py-3.5 border-b border-border flex-wrap">
              <div>
                <h3 className="text-[14px] font-bold">Resource actuals by category</h3>
                <div className="text-[11.5px] text-ink3">
                  {byMonth ? `Apr–Aug frozen · ${sub.period} open · Oct–Mar forecast` : "Cumulative actual man-days & remaining ETC"}
                </div>
              </div>
              <div className="ml-auto"><Segmented options={["Cumulative", "By month"]} value={mode} onChange={switchMode} /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]" style={{ minWidth: byMonth ? 360 + months.length * 58 : 540 }}>
                <thead>
                  <tr>
                    <th className={`${th} text-left`}>Module / resource line</th>
                    <th className={`${th} text-left`}>Type</th>
                    {byMonth && months.map((m, i) => (
                      <th key={m} className={`${th} text-center ${i === cur ? "!text-primary2 bg-primary-soft border-x border-primary/30" : i < cur ? "text-ink3" : ""}`} style={{ minWidth: 58, width: 58 }}>
                        {m.split(" ")[0]}{i === cur && <span className="block text-[8px] font-bold text-primary -mt-0.5">OPEN</span>}
                      </th>
                    ))}
                    <th className={`${th} text-center`}>Cum (md)</th>
                    <th className={`${th} text-center`}>ETC</th>
                    <th className={`${th} text-center`}>EAC</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((mod) => {
                    const mc = mod.lines.reduce((s, l) => s + cum(l), 0);
                    const me = mod.lines.reduce((s, l) => s + etc(l), 0);
                    const mSched = (i: number) => mod.lines.reduce((s, l) => s + (Number(getSched(l)[i]) || 0), 0);
                    return (
                      <Fragment key={mod.name}>
                        <tr className="bg-surface2 border-y border-border">
                          <td className="px-2.5 py-1.5 font-bold" colSpan={2}><span className="inline-block w-[6px] h-[13px] rounded-[3px] bg-primary mr-2 align-middle" />{mod.name}</td>
                          {byMonth && months.map((_m, i) => <td key={i} className={`px-1 py-1.5 text-center mono font-bold text-[11px] ${i === cur ? "bg-primary-soft border-x border-primary/30" : ""}`}>{mSched(i) || ""}</td>)}
                          <td className="px-2.5 py-1.5 text-center mono font-bold">{mc.toLocaleString()}</td>
                          <td className="px-2.5 py-1.5 text-center mono font-bold">{me.toLocaleString()}</td>
                          <td className="px-2.5 py-1.5 text-center mono font-bold">{(mc + me).toLocaleString()}</td>
                        </tr>
                        {mod.lines.map((l) => {
                          const sc = getSched(l);
                          return (
                            <tr key={l.id} className="hover:bg-primary-soft/20">
                              <td className={`${tdc} pl-6`}>{l.grade && <span className="mono text-[10px] text-ink2 bg-surface3 border border-border rounded px-1 mr-1.5">{l.grade}</span>}{l.name}</td>
                              <td className={tdc}><Rtag type={l.type} /></td>
                              {byMonth && months.map((_m, i) => {
                                const frozen = i < cur;
                                const cc = i === cur ? "bg-primary-soft border-x border-primary/30" : frozen ? "bg-surface3/60" : "";
                                return (
                                  <td key={i} className={`${tdc} p-0 ${cc}`}>
                                    {frozen || !editable ? (
                                      <div className="px-1 py-1 text-center mono text-ink3">{sc[i] || ""}</div>
                                    ) : (
                                      <input type="number" value={sc[i] || ""} className="w-full bg-transparent outline-none text-center mono px-1 py-1" onChange={(e) => setMonthVal(l, i, Number(e.target.value))} />
                                    )}
                                  </td>
                                );
                              })}
                              {/* Cum */}
                              <td className={`${tdc} text-center ${byMonth ? "mono font-semibold text-primary2" : ""}`}>
                                {byMonth || !editable ? <span className="mono font-semibold">{cumOf(l).toLocaleString()}</span>
                                  : <input type="number" value={cumVal(l)}
                                      className={`w-full outline-none text-center mono font-semibold rounded ${cumInvalid(l) ? "bg-red-soft text-red border border-red" : "bg-transparent"}`}
                                      title={cumInvalid(l) ? `Cannot be below ${frozenOf(l)} md already frozen in prior months` : ""}
                                      onChange={(e) => setCumVals((s) => ({ ...s, [l.id]: Number(e.target.value) }))} />}
                              </td>
                              {/* ETC */}
                              <td className={`${tdc} text-center ${byMonth ? "mono text-primary2" : ""}`}>
                                {byMonth || !editable ? <span className="mono">{etcOf(l).toLocaleString()}</span>
                                  : <input type="number" value={etcVal(l)} className="w-full bg-transparent outline-none text-center mono" onChange={(e) => setEtcVals((s) => ({ ...s, [l.id]: Number(e.target.value) }))} />}
                              </td>
                              <td className={`${tdc} text-center mono font-semibold`}>{(cum(l) + etc(l)).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </Fragment>
                    );
                  })}
                  <tr className="bg-primary text-white font-semibold">
                    <td className="px-2.5 py-2" colSpan={byMonth ? 2 + months.length : 2}>Total effort (man-days)</td>
                    <td className="px-2.5 py-2 text-center mono">{cumMd.toLocaleString()}</td>
                    <td className="px-2.5 py-2 text-center mono">{etcMd.toLocaleString()}</td>
                    <td className="px-2.5 py-2 text-center mono">{(cumMd + etcMd).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Subcontract work packages */}
          {subs.length > 0 && (
            <Card pad={false}>
              <div className="px-[18px] py-3.5 border-b border-border">
                <h3 className="text-[14px] font-bold">Subcontract work packages</h3>
                <div className="text-[11.5px] text-ink3">Fixed cost — only the completion % changes; recognised = fixed × %</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr>
                      {["Work package", "Vendor", "Fixed cost ($)", "Completion %", "Recognised ($)", "Remaining ETC ($)"].map((h, i) => (
                        <th key={h} className={`${th} ${i >= 2 ? "text-center" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map((l) => {
                      const c = compOf(l);
                      return (
                        <tr key={l.id} className="hover:bg-primary-soft/20">
                          <td className={`${tdc} font-medium`}>{l.name}</td>
                          <td className={`${tdc} text-ink2`}>{l.vendor}</td>
                          <td className={`${tdc} text-center mono`}>{money(l.fixedPrice)}</td>
                          <td className={`${tdc} text-center`}>
                            {editable ? (
                              <div className="inline-flex items-center gap-1">
                                <input type="number" value={Math.round(c * 100)} className="w-14 bg-surface3 border border-border rounded text-center mono py-1 outline-none focus:border-primary"
                                  onChange={(e) => setSubComp((s) => ({ ...s, [l.id]: Math.max(0, Math.min(100, Number(e.target.value))) / 100 }))} />
                                <span className="text-ink3">%</span>
                              </div>
                            ) : <span className="mono">{Math.round(c * 100)}%</span>}
                          </td>
                          <td className={`${tdc} text-center mono font-semibold`}>{money(l.fixedPrice * c)}</td>
                          <td className={`${tdc} text-center mono`}>{money(l.fixedPrice * (1 - c))}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-primary text-white font-semibold">
                      <td className="px-2.5 py-2" colSpan={2}>Subcontract total</td>
                      <td className="px-2.5 py-2 text-center mono">{money(subs.reduce((s, l) => s + l.fixedPrice, 0))}</td>
                      <td></td>
                      <td className="px-2.5 py-2 text-center mono">{money(subs.reduce((s, l) => s + l.fixedPrice * compOf(l), 0))}</td>
                      <td className="px-2.5 py-2 text-center mono">{money(subs.reduce((s, l) => s + l.fixedPrice * (1 - compOf(l)), 0))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Cost by resource category */}
          <Card pad={false}>
            <div className="px-[18px] py-3.5 border-b border-border">
              <h3 className="text-[14px] font-bold">Cost by resource category</h3>
              <div className="text-[11.5px] text-ink3">Actual ÷ ETC ÷ EAC cost by category</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr>
                    {["Category", "Actual cost to date", "ETC cost", "EAC cost"].map((h, i) => (
                      <th key={h} className={`${th} ${i ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {catRows.map((c) => (
                    <tr key={c.type} className="hover:bg-primary-soft/20">
                      <td className={tdc}><Rtag type={c.type} /></td>
                      <td className={`${tdc} text-right mono`}>{money(c.a)}</td>
                      <td className={`${tdc} text-right mono`}>{money(c.e)}</td>
                      <td className={`${tdc} text-right mono font-semibold`}>{money(c.a + c.e)}</td>
                    </tr>
                  ))}
                  <tr className="bg-primary text-white font-semibold">
                    <td className="px-2.5 py-2">Total project cost</td>
                    <td className="px-2.5 py-2 text-right mono">{money(totA)}</td>
                    <td className="px-2.5 py-2 text-right mono">{money(totE)}</td>
                    <td className="px-2.5 py-2 text-right mono">{money(totEac)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-[18px] py-2.5 text-[11.5px] text-ink2 border-t border-border">Effort {cumMd.toLocaleString()} / {etcMd.toLocaleString()} / {(cumMd + etcMd).toLocaleString()} md (cum / ETC / EAC)</div>
          </Card>

          {/* Deviation remark — required for the PM to submit; hidden for view-only roles */}
          {editable && (
            <Card>
              <CardHead title="Deviation remark & sign-off" desc="A comment is required to submit" />
              <textarea value={remark} onChange={(e) => setRemark(e.target.value)} rows={3}
                placeholder="Explain any effort / ETC deviation vs baseline for the PD review…"
                className="w-full rounded-[9px] border border-border2 px-[11px] py-[9px] text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft2" />
              <div className="mt-3 flex items-center gap-2 text-[12px] text-ink3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {msg ? msg
                  : (!savedOnce || dirty) ? "→ Save draft & recalculate to apply your entries."
                  : !remark.trim() ? "→ A deviation comment is required to submit."
                  : "→ Ready to submit for approval."}
              </div>
            </Card>
          )}
        </div>

        {/* right rail — shows the last SAVED figures; refreshes on Save & recalculate */}
        <OutCard caption={`Submission · ${sub.period}`} headline={pct(M.poc)} headSub={dirty ? "unsaved — click Save & recalculate" : submitted ? "cost basis · awaiting PD review" : "cost basis · last saved"}>
          <ORow k="Cost incurred to date" v={money(M.costToDate)} />
          <ORow k="Estimate to complete" v={money(M.eac - M.costToDate)} />
          <ORow k="Estimate at completion" v={money(M.eac)} />
          <ORow k="Forecast margin" v={pct(M.forecastMarginPct)} tone="neg" />
          <ORow k="This month revenue" v={money(M.periodRevenue)} tone={M.periodRevenue < 0 ? "neg" : "pos"} />
          <ORow k="EAC vs baseline" v={signed(M.eac - baseCost)} tone="neg" />
          <div className="text-[10.5px] uppercase tracking-[0.08em] text-ink3 font-semibold mt-4 mb-1">Effort (man-days)</div>
          <ORow k="Cumulative / ETC / EAC" v={`${savedCumMd.toLocaleString()} / ${savedEtcMd.toLocaleString()} / ${(savedCumMd + savedEtcMd).toLocaleString()}`} />
          <div className="mt-3 flex items-center gap-2 text-[11px] text-ink3">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {dirty ? "Unsaved edits — recalculate to update these figures" : submitted ? "Awaiting PD review · audit trail on" : "Draft · reflects last save"}
          </div>
        </OutCard>
      </div>
    </div>
  );
}
