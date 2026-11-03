import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import type { User } from "../api";
import { useAuth } from "../auth";
import { useAsync } from "../lib/useAsync";
import { money, pct } from "../lib/format";
import { preview } from "../lib/calcPreview";
import {
  Button, Card, CardHead, Field, Input, MixBar, ORow, OutCard, PageHead,
  Rtag, Segmented, Select, Stepper,
} from "../components/ui";

interface ResRow {
  module: string; name: string; type: "Own_FTE" | "Freelancer"; grade: string;
  totalMd: number; rate: number; monthly: number[];
}
interface SubRow {
  module: string; vendor: string; recognitionBasis: string;
  windowStart: string; windowEnd: string; fixedPrice: number;
}

const STEPS = ["Project Details", "Baseline Estimation", "Review & Submit"];

function monthList(start: string, end: string): string[] {
  const s = new Date(start), e = new Date(end);
  if (isNaN(+s) || isNaN(+e) || e < s) return [];
  const out: string[] = [];
  let d = new Date(s.getFullYear(), s.getMonth(), 1);
  const last = new Date(e.getFullYear(), e.getMonth(), 1);
  while (d <= last && out.length < 36) {
    out.push(d.toLocaleString("en-US", { month: "short" }) + " " + String(d.getFullYear()).slice(2));
    d.setMonth(d.getMonth() + 1);
  }
  return out;
}

function distribute(total: number, n: number): number[] {
  if (n <= 0) return [];
  const base = Math.floor(total / n);
  const arr = Array(n).fill(base);
  arr[n - 1] += total - base * n;
  return arr;
}

export default function NewProject() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { data: users } = useAsync(() => api.users(), []);
  const pds = (users ?? []).filter((u: User) => u.role === "PD");

  const [step, setStep] = useState(0);
  const [tried, setTried] = useState(false);
  const [mode, setMode] = useState<"Cumulative" | "By month">("Cumulative");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // input filters: alpha-only strips digits/symbols; names/ids stay alphanumeric
  const alpha = (v: string) => v.replace(/[^A-Za-z\s&.\-/]/g, "");
  const [form, setForm] = useState({
    code: "", name: "", customer: "", businessUnit: "", description: "",
    contractValue: 0, financialYear: "FY2025-26", startDate: "2025-04-01",
    plannedEndDate: "2026-03-31", pdUserId: 0,
  });
  const [resources, setResources] = useState<ResRow[]>([
    { module: "", name: "", type: "Own_FTE", grade: "L4", totalMd: 0, rate: 624, monthly: [] },
  ]);
  const [subs, setSubs] = useState<SubRow[]>([]);

  const months = useMemo(() => monthList(form.startDate, form.plannedEndDate), [form.startDate, form.plannedEndDate]);
  const durationMonths = months.length || 12;
  const byMonth = mode === "By month";

  // effective man-days per row (sum of months when in month mode)
  const effortOf = (r: ResRow) => byMonth ? months.reduce((s, _m, i) => s + (Number(r.monthly[i]) || 0), 0) : Number(r.totalMd) || 0;
  const costOf = (r: ResRow) => effortOf(r) * (Number(r.rate) || 0);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const updRes = (i: number, patch: Partial<ResRow>) => setResources((rs) => rs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const updMonth = (i: number, mi: number, v: number) =>
    setResources((rs) => rs.map((x, j) => {
      if (j !== i) return x;
      const monthly = months.map((_m, k) => (k === mi ? v : (Number(x.monthly[k]) || 0)));
      return { ...x, monthly };
    }));

  const switchMode = (next: string) => {
    if (next === mode) return;
    if (next === "By month") {
      // seed months from the cumulative total so nothing is lost and they tally
      setResources((rs) => rs.map((r) => {
        const cur = months.reduce((s, _m, i) => s + (Number(r.monthly[i]) || 0), 0);
        return cur > 0 ? r : { ...r, monthly: distribute(Number(r.totalMd) || 0, months.length) };
      }));
    } else {
      // collapse months back into the cumulative total
      setResources((rs) => rs.map((r) => ({ ...r, totalMd: months.reduce((s, _m, i) => s + (Number(r.monthly[i]) || 0), 0) || r.totalMd })));
    }
    setMode(next as typeof mode);
  };

  const previewLines = [
    ...resources.map((r) => ({ type: r.type, rate: r.rate, actualDays: 0, etcDays: effortOf(r), fixedPrice: 0, completionPct: 0, baselineDays: effortOf(r) })),
    ...subs.map((s) => ({ type: "Fixed_Subcon", rate: 0, actualDays: 0, etcDays: 0, fixedPrice: s.fixedPrice, completionPct: 0, baselineDays: 0 })),
  ];
  const p = preview(form.contractValue, previewLines);
  const comp = {
    own: resources.filter((r) => r.type === "Own_FTE").reduce((s, r) => s + costOf(r), 0),
    free: resources.filter((r) => r.type === "Freelancer").reduce((s, r) => s + costOf(r), 0),
    sub: subs.reduce((s, r) => s + r.fixedPrice, 0),
  };
  const totMd = resources.reduce((s, r) => s + effortOf(r), 0);
  const totCost = resources.reduce((s, r) => s + costOf(r), 0);
  const monthTot = (mi: number) => resources.reduce((s, r) => s + (Number(r.monthly[mi]) || 0), 0);

  // In cumulative mode, warn when a row's monthly breakdown no longer tallies with the typed total.
  const mismatches = resources
    .map((r, i) => {
      const msum = months.reduce((s, _m, k) => s + (Number(r.monthly[k]) || 0), 0);
      const tot = Number(r.totalMd) || 0;
      return msum > 0 && tot > 0 && msum !== tot ? { i, msum, tot, name: r.name || `Row ${i + 1}` } : null;
    })
    .filter(Boolean) as { i: number; msum: number; tot: number; name: string }[];
  const showMismatch = !byMonth && mismatches.length > 0;

  // ---- required-field validation per step ----
  const step0Valid = !!(
    form.name.trim() && form.customer.trim() && form.businessUnit.trim() &&
    form.contractValue > 0 && form.pdUserId && form.startDate && form.plannedEndDate
  );
  const step1Valid =
    totMd > 0 && !showMismatch &&
    resources.every((r) => effortOf(r) > 0 && Number(r.rate) > 0 && r.name.trim() && r.module.trim()) &&
    subs.every((s) => Number(s.fixedPrice) > 0 && s.vendor.trim() && s.module.trim());
  const stepValid = step === 0 ? step0Valid : step === 1 ? step1Valid : true;
  const bad = (cond: boolean) => (tried && cond ? "ring-2 ring-red/70 bg-red-soft/40" : "");

  const submit = async () => {
    setSaving(true); setErr(null);
    try {
      const res = await api.createProject({
        ...form, pmUserId: user?.id, pdUserId: form.pdUserId || null, durationMonths,
        resources: [
          ...resources.map((r) => ({
            module: r.module, name: r.name, type: r.type, grade: r.grade, rate: r.rate,
            totalMd: effortOf(r),
            monthly: byMonth ? months.map((m, i) => ({ month: m, md: Number(r.monthly[i]) || 0 })) : [],
          })),
          ...subs.map((s) => ({ module: s.module, type: "Fixed_Subcon", vendor: s.vendor, recognitionBasis: s.recognitionBasis, completionWindow: `${s.windowStart} → ${s.windowEnd}`, fixedPrice: s.fixedPrice })),
        ],
      });
      nav(`/projects/${res.id}`);
    } catch (e) { setErr(String((e as Error).message)); } finally { setSaving(false); }
  };

  const th = "px-3 py-2.5 text-[10.3px] uppercase tracking-[0.07em] font-semibold text-ink3 bg-surface2 border-b border-border";
  const thc = "px-2.5 py-2.5 text-[10px] uppercase tracking-[0.05em] font-semibold text-ink3 bg-surface2 border-b border-border border-r border-border last:border-r-0";
  const rbad = (_i: number, cond: boolean) => (tried && cond ? "ring-2 ring-red/70 bg-red-soft/40" : "");

  return (
    <div className="max-w-[1180px]">
      <PageHead title="Baseline & Deal Closure Setup" crumb={<><span>Delivery</span> <span className="opacity-50">/</span> <b className="text-ink2">New Baseline</b></>} meta={<span className="text-[13px] text-ink3">Create a new fixed-price project baseline</span>} />
      <Card className="mb-[18px]"><Stepper steps={STEPS} active={step} /></Card>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_332px] gap-[18px] items-start">
        <div className="space-y-[18px] min-w-0">
          {/* STEP 0 — project details */}
          {step === 0 && (
            <Card>
              <CardHead title="Project details" desc="Project master & deal parameters" />
              <div className="text-[11px] text-ink3 mb-3">Fields marked <span className="text-red">*</span> are required. Customer is letters only; contract value is numeric.</div>
              <div className="grid sm:grid-cols-3 gap-3.5">
                <Field label="Project ID / Code"><Input value={form.code} onChange={(e) => set({ code: e.target.value })} placeholder="PRJ-2025-XXXX" /></Field>
                <div className="sm:col-span-2"><Field label="Project name *"><Input value={form.name} onChange={(e) => set({ name: e.target.value })} className={bad(!form.name.trim())} /></Field></div>
                <Field label="Customer * (letters only)"><Input value={form.customer} onChange={(e) => set({ customer: alpha(e.target.value) })} className={bad(!form.customer.trim())} placeholder="e.g. Nordwind Logistics AG" /></Field>
                <div className="sm:col-span-2"><Field label="Business unit / account *"><Input value={form.businessUnit} onChange={(e) => set({ businessUnit: e.target.value })} placeholder="e.g. SAP Finance — EMEA" className={bad(!form.businessUnit.trim())} /></Field></div>
                <Field label="Contract value (TCV, USD) *"><Input type="number" inputMode="numeric" min={0} value={form.contractValue || ""} onChange={(e) => set({ contractValue: Number(e.target.value) })} className={bad(form.contractValue <= 0)} /></Field>
                <Field label="Financial year"><Input value={form.financialYear} onChange={(e) => set({ financialYear: e.target.value })} /></Field>
                <Field label="Duration (auto)"><Input value={`${durationMonths} months`} disabled /></Field>
                <Field label="Project start *"><Input type="date" value={form.startDate} onChange={(e) => set({ startDate: e.target.value })} className={bad(!form.startDate)} /></Field>
                <Field label="Planned end *"><Input type="date" value={form.plannedEndDate} onChange={(e) => set({ plannedEndDate: e.target.value })} className={bad(!form.plannedEndDate)} /></Field>
                <Field label="Project Manager"><Input value={user?.name ?? ""} disabled /></Field>
                <Field label="Delivery owner (PD) *">
                  <Select value={form.pdUserId} onChange={(e) => set({ pdUserId: Number(e.target.value) })} className={bad(!form.pdUserId)}>
                    <option value={0}>— select —</option>
                    {pds.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </Select>
                </Field>
                <div className="sm:col-span-2"><Field label="Description"><Input value={form.description} onChange={(e) => set({ description: e.target.value })} /></Field></div>
              </div>
            </Card>
          )}

          {/* STEP 1 — baseline estimation */}
          {step === 1 && (
            <>
              {showMismatch && (
                <div className="rounded-[10px] bg-amber-soft border border-amber/30 text-[#8f5e14] px-4 py-3 text-[12.5px] flex items-start gap-2">
                  <span className="text-[15px] leading-none mt-0.5">⚠</span>
                  <div>
                    <b>Monthly breakdown doesn’t tally with the cumulative total.</b>
                    {mismatches.map((m) => (
                      <div key={m.i} className="mono text-[11.5px] mt-0.5">
                        {m.name}: months sum {m.msum} md vs cumulative {m.tot} md — adjust so both match.
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Card pad={false}>
                <div className="flex items-center gap-3 px-[18px] py-3.5 border-b border-border">
                  <div>
                    <h3 className="text-[14px] font-bold">Baseline estimation</h3>
                    <div className="text-[11.5px] text-ink3">Effort in man-days · rate & cost in USD</div>
                  </div>
                  <div className="ml-auto flex items-center gap-2.5">
                    <Segmented options={["Cumulative", "By month"]} value={mode} onChange={switchMode} />
                    <Button variant="ghost" onClick={() => setResources((r) => [...r, { module: "", name: "", type: "Own_FTE", grade: "L4", totalMd: 0, rate: 624, monthly: [] }])}>+ Row</Button>
                  </div>
                </div>
                <div className="px-[18px] py-2 bg-primary-soft/40 text-[11.5px] text-ink2 border-b border-border">
                  {byMonth
                    ? "By-month entry: type man-days per month — the Total effort column is auto-summed and locked so months and cumulative always tally."
                    : "Cumulative entry: type the total man-days directly. Switch to By month to split effort across the delivery calendar."}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12.5px]" style={{ minWidth: byMonth ? 560 + months.length * 52 : 880 }}>
                    <thead>
                      <tr>
                        <th className={`${thc} text-left`} style={{ width: 150 }}>Module</th>
                        <th className={`${thc} text-left`} style={{ width: 80 }}>Level</th>
                        <th className={`${thc} text-left`}>Resource line</th>
                        <th className={`${thc} text-left`} style={{ width: 118 }}>Type</th>
                        {byMonth && months.map((m) => <th key={m} className={`${thc} text-center`} style={{ minWidth: 50 }}>{m.split(" ")[0]}</th>)}
                        <th className={`${thc} text-right`} style={{ width: 100 }}>Total effort (md)</th>
                        <th className={`${thc} text-right`} style={{ width: 96 }}>Rate / day ($)</th>
                        <th className={`${thc} text-right`} style={{ width: 118 }}>Planned cost ($)</th>
                        <th className={`${thc}`} style={{ width: 36 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map((r, i) => (
                        <tr key={i} className="border-b border-surface3 hover:bg-primary-soft/15">
                          <td className="px-2.5 py-1.5 border-r border-surface3">
                            <input className={`w-full bg-transparent outline-none rounded px-1 placeholder:text-ink3 ${rbad(i, !r.module.trim())}`} placeholder="e.g. FI / GL" value={r.module} onChange={(e) => updRes(i, { module: e.target.value })} />
                          </td>
                          <td className="px-2.5 py-1.5 border-r border-surface3">
                            {r.type === "Own_FTE" ? (
                              <select className="mono text-[12px] bg-surface3 border border-border rounded px-1.5 py-1 outline-none w-full" value={r.grade} onChange={(e) => updRes(i, { grade: e.target.value })}>
                                {["L1", "L2", "L3", "L4", "L5", "L6", "L7"].map((g) => <option key={g}>{g}</option>)}
                              </select>
                            ) : <span className="text-ink3 text-[11.5px]">T&amp;M band</span>}
                          </td>
                          <td className="px-2.5 py-1.5 border-r border-surface3">
                            <input className={`w-full bg-transparent outline-none rounded px-1 font-medium placeholder:text-ink3 ${rbad(i, !r.name.trim())}`} placeholder="Role / resource name" value={r.name} onChange={(e) => updRes(i, { name: e.target.value })} />
                          </td>
                          <td className="px-2.5 py-1.5 border-r border-surface3">
                            <select className="bg-surface3 border border-border rounded px-1.5 py-1 text-[11.5px] outline-none w-full" value={r.type} onChange={(e) => updRes(i, { type: e.target.value as ResRow["type"] })}>
                              <option value="Own_FTE">Internal</option>
                              <option value="Freelancer">Freelancer</option>
                            </select>
                          </td>
                          {byMonth && months.map((m, mi) => (
                            <td key={m} className="px-0.5 py-1.5 border-r border-surface3">
                              <input type="number" className="w-full bg-transparent outline-none text-center mono text-[12px]" value={r.monthly[mi] || ""} onChange={(e) => updMonth(i, mi, Number(e.target.value))} />
                            </td>
                          ))}
                          <td className={`px-2.5 py-1.5 border-r border-surface3 text-right mono font-semibold ${byMonth ? "bg-primary-soft/50 text-primary2" : ""}`}>
                            {byMonth ? effortOf(r).toLocaleString()
                              : <input type="number" className={`w-full bg-transparent outline-none text-right mono font-semibold rounded ${rbad(i, effortOf(r) <= 0)}`} value={r.totalMd || ""} placeholder="0" onChange={(e) => updRes(i, { totalMd: Number(e.target.value) })} />}
                          </td>
                          <td className="px-2.5 py-1.5 border-r border-surface3 text-right">
                            <input type="number" className={`w-full bg-transparent outline-none text-right mono rounded ${rbad(i, Number(r.rate) <= 0)}`} value={r.rate || ""} placeholder="0" onChange={(e) => updRes(i, { rate: Number(e.target.value) })} />
                          </td>
                          <td className="px-2.5 py-1.5 border-r border-surface3 text-right mono font-semibold">{money(costOf(r))}</td>
                          <td className="px-1 py-1.5 text-center"><button className="text-ink3 hover:text-red" onClick={() => setResources((rs) => rs.filter((_, j) => j !== i))} title="Remove row">✕</button></td>
                        </tr>
                      ))}
                      <tr className="bg-primary text-white font-semibold">
                        <td className="px-2.5 py-2.5" colSpan={4}>Total — internal + freelancer</td>
                        {byMonth && months.map((m, mi) => <td key={m} className="px-0.5 py-2.5 text-center mono">{monthTot(mi) || ""}</td>)}
                        <td className="px-2.5 py-2.5 text-right mono">{totMd.toLocaleString()}</td>
                        <td className="px-2.5 py-2.5"></td>
                        <td className="px-2.5 py-2.5 text-right mono">{money(totCost)}</td>
                        <td className="px-2.5 py-2.5"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Subcontract table */}
              <Card pad={false}>
                <div className="flex items-center gap-3 px-[18px] py-3.5 border-b border-border">
                  <div>
                    <h3 className="text-[14px] font-bold">Fixed-cost subcontract work packages</h3>
                    <div className="text-[11.5px] text-ink3">Recognised on completion % — no day rate</div>
                  </div>
                  <Button className="ml-auto" variant="ghost" onClick={() => setSubs((s) => [...s, { module: "", vendor: "", recognitionBasis: "% Completion", windowStart: "", windowEnd: "", fixedPrice: 0 }])}>+ Row</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12.5px]" style={{ minWidth: 820 }}>
                    <thead>
                      <tr>
                        <th className={`${th} text-left`}>Outsourced work package</th>
                        <th className={`${th} text-left`}>Vendor</th>
                        <th className={`${th} text-left`}>Recognition basis</th>
                        <th className={`${th} text-left`}>Planned completion window</th>
                        <th className={`${th} text-right`}>Fixed cost ($)</th>
                        <th className={`${th}`}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {subs.length === 0 && (
                        <tr><td colSpan={6} className="px-3 py-5 text-center text-ink3 text-[12px]">No subcontracted work packages. Click “+ Row” to add one.</td></tr>
                      )}
                      {subs.map((s, i) => (
                        <tr key={i} className="border-b border-surface3">
                          <td className="px-3 py-2 border-r border-surface3"><input className="w-full bg-transparent outline-none font-medium placeholder:text-ink3" placeholder="Work package" value={s.module} onChange={(e) => setSubs((ss) => ss.map((x, j) => j === i ? { ...x, module: e.target.value } : x))} /></td>
                          <td className="px-3 py-2 border-r border-surface3"><input className="w-full bg-transparent outline-none placeholder:text-ink3" placeholder="Vendor" value={s.vendor} onChange={(e) => setSubs((ss) => ss.map((x, j) => j === i ? { ...x, vendor: alpha(e.target.value) } : x))} /></td>
                          <td className="px-3 py-2 border-r border-surface3">
                            <select className="bg-surface3 border border-border rounded px-1.5 py-1 text-[11.5px] outline-none" value={s.recognitionBasis} onChange={(e) => setSubs((ss) => ss.map((x, j) => j === i ? { ...x, recognitionBasis: e.target.value } : x))}>
                              <option>% Completion</option><option>Milestone</option><option>On Delivery</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 border-r border-surface3">
                            <div className="flex items-center gap-1">
                              <input type="date" className="bg-transparent outline-none text-[11.5px]" value={s.windowStart} onChange={(e) => setSubs((ss) => ss.map((x, j) => j === i ? { ...x, windowStart: e.target.value } : x))} />
                              <span className="text-ink3">→</span>
                              <input type="date" className="bg-transparent outline-none text-[11.5px]" value={s.windowEnd} onChange={(e) => setSubs((ss) => ss.map((x, j) => j === i ? { ...x, windowEnd: e.target.value } : x))} />
                            </div>
                          </td>
                          <td className="px-3 py-2 border-r border-surface3 text-right"><input type="number" className="w-24 bg-transparent outline-none text-right mono" placeholder="0" value={s.fixedPrice || ""} onChange={(e) => setSubs((ss) => ss.map((x, j) => j === i ? { ...x, fixedPrice: Number(e.target.value) } : x))} /></td>
                          <td className="px-2 py-2 text-center"><button className="text-ink3 hover:text-red" onClick={() => setSubs((ss) => ss.filter((_, j) => j !== i))}>✕</button></td>
                        </tr>
                      ))}
                      {subs.length > 0 && (
                        <tr className="bg-surface2 font-semibold border-t border-border">
                          <td className="px-3 py-2.5" colSpan={4}>Subcontract total</td>
                          <td className="px-3 py-2.5 text-right mono">{money(comp.sub)}</td>
                          <td></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* STEP 2 — review */}
          {step === 2 && (
            <Card>
              <CardHead title="Review & submit" desc="Confirm the baseline before creating the project" />
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[12.6px]">
                {[["Project ID", form.code || "—"], ["Name", form.name], ["Customer", form.customer], ["Business unit / account", form.businessUnit], ["Contract value", money(form.contractValue)], ["Financial year", form.financialYear], ["Duration", `${durationMonths} months`], ["Delivery owner", pds.find((u) => u.id === form.pdUserId)?.name ?? "—"], ["Total effort", `${totMd.toLocaleString()} md`], ["Planned cost", money(totCost + comp.sub)]].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-surface3 py-1"><dt className="text-ink3">{k}</dt><dd className="font-medium">{v}</dd></div>
                ))}
              </dl>
              {err && <div className="mt-3 text-[12px] text-red">{err}</div>}
            </Card>
          )}

          {tried && !stepValid && step < 2 && (
            <div className="rounded-[10px] bg-red-soft text-[#a83a2b] px-4 py-2.5 text-[12.5px]">
              {step === 0
                ? "Please complete the required fields marked * before continuing."
                : "Add at least one complete resource line (module, line, man-days > 0, rate > 0) and make sure every row is valid."}
            </div>
          )}
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => (step === 0 ? nav("/") : (setTried(false), setStep((s) => s - 1)))}>{step === 0 ? "Cancel" : "← Back"}</Button>
            {step < 2 ? (
              <Button variant="primary" onClick={() => { if (!stepValid) { setTried(true); return; } setTried(false); setStep((s) => s + 1); }}>Continue →</Button>
            ) : (
              <Button variant="primary" onClick={submit} disabled={saving || !step0Valid}>{saving ? "Creating…" : "Create project"}</Button>
            )}
          </div>
        </div>

        {/* right rail */}
        <OutCard caption="Sold margin at baseline" headline={pct(p.soldMarginPct)} headSub={money(p.soldMargin)}>
          <ORow k="Contract value" v={money(form.contractValue)} />
          <ORow k="Planned cost (EAC baseline)" v={money(p.baselineCost)} />
          <ORow k="Planned effort" v={`${totMd.toLocaleString()} md`} />
          <div className="text-[10.5px] uppercase tracking-[0.08em] text-ink3 font-semibold mt-4 mb-1.5">Cost composition</div>
          <MixBar parts={[
            { label: "Internal (L1–L7)", value: comp.own, color: "#0072bc", display: money(comp.own) },
            { label: "Freelancer (T&M)", value: comp.free, color: "#b9791a", display: money(comp.free) },
            { label: "Subcontractor (fixed)", value: comp.sub, color: "#0d9488", display: money(comp.sub) },
          ]} />
          <div className="mt-4 flex items-center gap-2 text-[11.5px] text-ink2">
            <Rtag type="Own_FTE" /><Rtag type="Freelancer" /><Rtag type="Fixed_Subcon" />
          </div>
        </OutCard>
      </div>
    </div>
  );
}
