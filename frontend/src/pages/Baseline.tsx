import { Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import type { Line } from "../api";
import { useAsync } from "../lib/useAsync";
import { money, pct } from "../lib/format";
import { Card, ChipCode, ErrorBox, Kpi, MixBar, ORow, OutCard, PageHead, Rtag, Spinner } from "../components/ui";

export default function Baseline() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: b, loading, error } = useAsync(() => api.baseline(Number(id)), [id]);

  if (loading) return <Spinner label="Loading baseline…" />;
  if (error) return <ErrorBox message={error} />;
  if (!b) return null;

  // group resources by module
  const modules: { name: string; lines: Line[] }[] = [];
  for (const l of b.resources) {
    let g = modules.find((x) => x.name === (l.module || "—"));
    if (!g) { g = { name: l.module || "—", lines: [] }; modules.push(g); }
    g.lines.push(l);
  }
  const subTotal = (ls: Line[]) => ls.reduce((s, l) => ({ md: s.md + l.baselineDays, cost: s.cost + l.baselineCost }), { md: 0, cost: 0 });

  const internal = b.resources.filter((l) => l.type === "Own_FTE").reduce((s, l) => s + l.baselineCost, 0);
  const freelancer = b.resources.filter((l) => l.type === "Freelancer").reduce((s, l) => s + l.baselineCost, 0);
  const subcon = b.subcontractors.reduce((s, l) => s + l.fixedPrice, 0);
  const totMd = b.resources.reduce((s, l) => s + l.baselineDays, 0);

  const th = "px-3.5 py-2.5 text-[10.3px] uppercase tracking-[0.08em] font-semibold text-ink3 bg-surface2 border-b border-border";

  return (
    <div>
      <PageHead
        title="Baseline & Deal Closure"
        crumb={<><span>Baselines</span> <span className="opacity-50">/</span> <button onClick={() => nav(`/projects/${b.id}`)} className="hover:text-primary">{b.name}</button> <span className="opacity-50">/</span> <b className="text-ink2">Baseline</b></>}
        meta={<>
          <ChipCode>{b.code}</ChipCode>
          <span className="text-[12px] text-ink2">{b.customer} · {b.businessUnit} · {b.financialYear} · {b.durationMonths} mo ({b.startDate} → {b.plannedEndDate})</span>
        </>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-[18px]">
        <Kpi accent="blue" label="Contract value (TCV)" value={money(b.tcv)} />
        <Kpi accent="amber" label="Baseline cost" value={money(b.baselineCost)} sub={`${totMd.toLocaleString()} md planned`} />
        <Kpi accent="green" label="Sold margin" value={money(b.soldMargin)} />
        <Kpi accent="indigo" hi label="Sold margin %" value={pct(b.soldMarginPct)} />
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_332px] gap-[18px] items-start">
        <div className="space-y-[18px] min-w-0">
          <Card pad={false}>
            <div className="px-[18px] py-3.5 border-b border-border">
              <h3 className="text-[14px] font-bold">Baseline estimation</h3>
              <div className="text-[11.5px] text-ink3">Effort in man-days · rate & cost in USD · grouped by module</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12.6px]">
                <thead>
                  <tr>
                    <th className={`${th} text-left`}>Module / resource line</th>
                    <th className={`${th} text-left`}>Type</th>
                    <th className={`${th} text-right`}>Total effort (md)</th>
                    <th className={`${th} text-right`}>Rate / day ($)</th>
                    <th className={`${th} text-right`}>Planned cost ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((mod) => {
                    const st = subTotal(mod.lines);
                    return (
                      <Fragment key={mod.name}>
                        <tr className="bg-surface2 border-y border-border">
                          <td className="px-3.5 py-2 font-bold" colSpan={2}>
                            <span className="inline-block w-[7px] h-[16px] rounded-[3px] bg-primary mr-2 align-middle" />{mod.name}
                          </td>
                          <td className="px-3.5 py-2 text-right mono font-bold">{st.md.toLocaleString()}</td>
                          <td></td>
                          <td className="px-3.5 py-2 text-right mono font-bold">{money(st.cost)}</td>
                        </tr>
                        {mod.lines.map((l) => (
                          <tr key={l.id} className="border-b border-surface3 hover:bg-primary-soft/20">
                            <td className="px-3.5 py-2 pl-8">
                              {l.grade && <span className="mono text-[11px] text-ink2 bg-surface3 border border-border rounded px-1.5 mr-2">{l.grade}</span>}
                              {l.name}
                            </td>
                            <td className="px-3.5 py-2"><Rtag type={l.type} /></td>
                            <td className="px-3.5 py-2 text-right mono">{l.baselineDays.toLocaleString()}</td>
                            <td className="px-3.5 py-2 text-right mono">{money(l.rate)}</td>
                            <td className="px-3.5 py-2 text-right mono">{money(l.baselineCost)}</td>
                          </tr>
                        ))}
                      </Fragment>
                    );
                  })}
                  <tr className="bg-primary text-white font-semibold">
                    <td className="px-3.5 py-2.5" colSpan={2}>Total — internal + freelancer</td>
                    <td className="px-3.5 py-2.5 text-right mono">{totMd.toLocaleString()}</td>
                    <td></td>
                    <td className="px-3.5 py-2.5 text-right mono">{money(internal + freelancer)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {b.subcontractors.length > 0 && (
            <Card pad={false}>
              <div className="px-[18px] py-3.5 border-b border-border">
                <h3 className="text-[14px] font-bold">Fixed-cost subcontract work packages</h3>
                <div className="text-[11.5px] text-ink3">Recognised on completion % — no day rate</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12.6px]">
                  <thead>
                    <tr>
                      {["Outsourced work package", "Vendor", "Recognition basis", "Planned completion window", "Fixed cost ($)"].map((h, i) => (
                        <th key={h} className={`${th} ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.subcontractors.map((l) => (
                      <tr key={l.id} className="border-b border-surface3 hover:bg-primary-soft/20">
                        <td className="px-3.5 py-2 font-medium">{l.name || l.module}</td>
                        <td className="px-3.5 py-2 text-ink2">{l.vendor}</td>
                        <td className="px-3.5 py-2">{l.recognitionBasis}</td>
                        <td className="px-3.5 py-2 text-ink2">{l.completionWindow}</td>
                        <td className="px-3.5 py-2 text-right mono font-semibold">{money(l.fixedPrice)}</td>
                      </tr>
                    ))}
                    <tr className="bg-surface2 font-semibold border-t border-border">
                      <td className="px-3.5 py-2.5" colSpan={4}>Subcontract total</td>
                      <td className="px-3.5 py-2.5 text-right mono">{money(subcon)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* right rail */}
        <OutCard caption="Sold margin at baseline" headline={pct(b.soldMarginPct)} headSub={`${money(b.tcv)} − ${money(b.baselineCost)}`}>
          <ORow k="Contract value" v={money(b.tcv)} />
          <ORow k="Planned cost (EAC baseline)" v={money(b.baselineCost)} />
          <ORow k="Sold margin" v={money(b.soldMargin)} tone="pos" />
          <ORow k="Planned effort" v={`${totMd.toLocaleString()} md`} />
          <div className="text-[10.5px] uppercase tracking-[0.08em] text-ink3 font-semibold mt-4 mb-1.5">Cost composition</div>
          <MixBar parts={[
            { label: "Internal (L1–L7)", value: internal, color: "#0072bc", display: `${money(internal)} · ${pct(internal / Math.max(1, b.baselineCost), 1)}` },
            { label: "Freelancer (T&M)", value: freelancer, color: "#b9791a", display: `${money(freelancer)} · ${pct(freelancer / Math.max(1, b.baselineCost), 1)}` },
            { label: "Subcontractor (fixed)", value: subcon, color: "#0d9488", display: `${money(subcon)} · ${pct(subcon / Math.max(1, b.baselineCost), 1)}` },
          ]} />
        </OutCard>
      </div>
    </div>
  );
}
