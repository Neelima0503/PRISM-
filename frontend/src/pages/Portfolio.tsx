import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { useAsync } from "../lib/useAsync";
import { money, pct, workflowText, WF_COLOR } from "../lib/format";
import { Button, ErrorBox, PageHead, Spinner, StatTile } from "../components/ui";

const RAG: Record<string, string> = { Green: "#1a8a52", Amber: "#b9791a", Red: "#cb4634" };

function Metric({ label, value, tone }: { label: string; value: string; tone?: "neg" | "amber" }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wide text-ink3 font-semibold">{label}</div>
      <div className={`mono text-[14px] font-semibold mt-0.5 truncate ${tone === "neg" ? "text-red" : tone === "amber" ? "text-amber" : "text-ink"}`}>
        {value}
      </div>
    </div>
  );
}

export default function Portfolio() {
  const { user, canSubmit } = useAuth();
  const nav = useNavigate();
  const { data, loading, error } = useAsync(() => api.portfolio(user?.id), [user?.id]);

  if (loading) return <Spinner label="Loading portfolio…" />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return null;
  const k = data.kpis;
  const erosion = (k.soldMarginPct - k.forecastMarginPct) * 100;

  return (
    <div>
      <PageHead
        title={`Portfolio — ${data.period}`}
        crumb={<><span>Delivery</span> <span className="opacity-50">/</span> <b className="text-ink2">Portfolio</b></>}
        meta={<span className="text-[13px] text-ink3">{k.projectCount} active projects · FY2025–26 · group currency USD</span>}
        actions={canSubmit && (
          <Button variant="primary" onClick={() => nav("/projects/new")}>
            <span className="text-[15px] leading-none">+</span> New Project
          </Button>
        )}
      />

      {/* Colorful KPI tiles with 3D icons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-5">
        <StatTile tone="blue" label="Portfolio TCV" value={money(k.tcv)} sub={`${k.projectCount} active`} icon={<DollarIcon />} />
        <StatTile tone="teal" label="This Month" value={money(k.currentMonthRevenue)} sub={`${data.period} recognition`} icon={<PulseIcon />} />
        <StatTile tone="green" label="YTD Recognised" value={money(k.ytdRecognised)} sub={`${pct(k.recognisedPct)} of TCV`} icon={<CheckIcon />} />
        <StatTile tone="navy" label="Forecast Margin" value={pct(k.forecastMarginPct)} sub={`▼ ${erosion.toFixed(1)} pp vs sold`} deltaTone="neg" icon={<ChartIcon />} />
        <StatTile tone="amber" label="Backlog" value={money(k.backlog)} sub="Unrecognised" icon={<StackIcon />} />
      </div>

      {/* Project tiles */}
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-[14px] font-bold">Projects</h3>
        <span className="text-[11.5px] text-ink3">{data.projects.length} projects</span>
      </div>
      <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {data.projects.map((p) => {
          const onerous = p.eac > p.tcv;
          return (
            <div
              key={p.id}
              onClick={() => nav(`/projects/${p.id}`)}
              className="group rounded-[14px] bg-surface border border-border shadow-card p-4 cursor-pointer hover:shadow-card2 hover:border-primary/40 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex items-start gap-2">
                  <span
                    className="mt-[5px] h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: RAG[p.health] ?? RAG.Green, boxShadow: `0 0 0 3px ${(RAG[p.health] ?? RAG.Green)}22` }}
                    title={`Health: ${p.health}${onerous ? " · onerous" : ""}`}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-ink truncate group-hover:text-primary">{p.name}</div>
                    <div className="text-[11px] text-ink3 truncate">{p.code} · {p.customer}</div>
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-[3px] text-[10.5px] font-semibold"
                  style={{ background: (WF_COLOR[p.workflowStatus] ?? WF_COLOR.Draft).bg, color: (WF_COLOR[p.workflowStatus] ?? WF_COLOR.Draft).fg }}
                >
                  {workflowText(p.workflowStatus, user?.role)}
                </span>
              </div>
              <div className="h-px bg-border my-3.5" />
              <div className="grid grid-cols-3 gap-x-3 gap-y-3.5">
                <Metric label="TCV" value={money(p.tcv)} />
                <Metric label="POC %" value={pct(p.poc)} />
                <Metric label="FC Margin" value={pct(p.forecastMarginPct)} tone={onerous ? "neg" : p.forecastMarginPct < 0.1 ? "amber" : undefined} />
                <Metric label="Current EAC" value={money(p.eac)} />
                <Metric label="This Month" value={money(p.periodRevenue)} />
                <Metric label="YTD Revenue" value={money(p.cumulativeRevenue)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- 3D-chip icons --- */
function DollarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="20" height="20"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" /></svg>;
}
function PulseIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="20" height="20"><path d="M3 12h4l3 8 4-16 3 8h4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function CheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="20" height="20"><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ChartIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="20" height="20"><path d="M3 3v18h18M7 14l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function StackIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="20" height="20"><path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
