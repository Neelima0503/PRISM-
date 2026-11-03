import type { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { useAsync } from "../lib/useAsync";
import { api } from "../api";
import nttLogo from "../assets/ntt-logo.webp";

type Item = { label: string; to: string; badge?: string; end?: boolean; match?: string; icon: () => ReactNode };

function NavRow({ item }: { item: Item }) {
  const loc = useLocation();
  const active = item.end
    ? loc.pathname === item.to
    : item.match
    ? loc.pathname.includes(item.match)
    : loc.pathname === item.to;
  return (
    <NavLink
      to={item.to}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[9px] text-[12.8px] font-medium transition ${
        active ? "bg-primary text-white shadow-[0_4px_12px_rgba(0,114,188,.35)]" : "text-nav-ink hover:bg-nav2 hover:text-white"
      }`}
    >
      <span className="w-[17px] h-[17px] shrink-0"><item.icon /></span>
      {item.label}
      {item.badge && (
        <span className={`ml-auto text-[10.5px] font-semibold rounded-full px-[7px] ${active ? "bg-white/20" : "bg-white/10"}`}>
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, setUser, canApprove, canRecognise } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const { data: pf } = useAsync(() => (user ? api.portfolio(user.id) : Promise.resolve(null)), [user?.id]);
  // per-project nav appears ONLY when a project is actually open (in the URL)
  const urlPid = loc.pathname.match(/\/projects\/(\d+)/);
  const activePid = urlPid ? Number(urlPid[1]) : undefined;
  const count = pf?.projects?.length;
  const activeName = pf?.projects?.find((p) => p.id === activePid)?.name;
  const initials = (user?.name ?? "").split(" ").map((p) => p[0]).join("").slice(0, 2);

  const workspace: Item[] = [
    { label: "Portfolio", to: "/", end: true, badge: count ? String(count) : undefined, icon: GridIcon },
  ];
  const projectItems: Item[] = activePid
    ? ([
        // Finance sees only Revenue Recognition; PM/PD get the full set
        ...(canRecognise ? [] : [{ label: "Baseline", to: `/projects/${activePid}/baseline`, match: "/baseline", icon: LayersIcon }]),
        { label: "Revenue Recognition", to: `/projects/${activePid}`, end: true, icon: DocIcon },
        ...(canRecognise ? [] : [{ label: "Monthly Actuals & ETC", to: `/projects/${activePid}/submission`, match: "/submission", icon: EditIcon }]),
        ...(canApprove ? [{ label: "PD Review & Approval", to: `/projects/${activePid}/review`, match: "/review", icon: CheckIcon }] : []),
      ] as Item[])
    : [];

  return (
    <div className="min-h-screen flex">
      {/* Dark navy sidebar */}
      <aside className="w-[232px] shrink-0 bg-nav flex flex-col sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-white/10">
          <img src={nttLogo} alt="NTT DATA" className="h-7 w-auto" />
        </div>
        <div className="px-4 pt-4">
          <div className="rounded-[11px] px-4 py-3" style={{ background: "linear-gradient(135deg,#0072bc,#003a70)" }}>
            <div className="text-white font-bold tracking-[0.18em] text-[17px]">PRISM</div>
            <div className="text-white/70 text-[10px] leading-tight">Project Insights &amp; Revenue Management</div>
          </div>
        </div>
        <nav className="px-3 py-4 space-y-1 flex-1 overflow-auto">
          <div className="text-[10px] tracking-[0.13em] uppercase text-nav-ink/70 font-semibold px-3 mb-1.5">Workspace</div>
          {workspace.map((it) => <NavRow key={it.to} item={it} />)}
          {projectItems.length > 0 && (
            <>
              <div className="text-[10px] tracking-[0.13em] uppercase text-nav-ink/70 font-semibold px-3 mt-5 mb-1.5">Project</div>
              {activeName && <div className="px-3 mb-1.5 text-[11px] text-white/80 font-medium truncate">{activeName}</div>}
              {projectItems.map((it) => <NavRow key={it.to} item={it} />)}
            </>
          )}
        </nav>
        <div className="px-4 pb-4 pt-3 border-t border-white/10">
          {user && (
            <button
              onClick={() => { setUser(null); nav("/login"); }}
              className="w-full flex items-center gap-2.5 rounded-[11px] px-3.5 py-2.5 text-white font-semibold text-[12.7px] transition hover:brightness-110"
              style={{ background: "linear-gradient(135deg,#0072bc,#003a70)", boxShadow: "0 4px 12px rgba(0,114,188,.35)" }}
            >
              <LogoutIcon /> Sign out
            </button>
          )}
          <div className="mt-3 text-[10.5px] text-nav-ink/80">Phase-1 · USD · FY2025–26</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-[58px] bg-surface border-b border-border flex items-center px-6 gap-4 sticky top-0 z-30">
          <div className="flex-1" />
          <div className="flex items-center gap-2.5 rounded-[10px] border border-border bg-surface px-3 py-1.5">
            <span className="h-8 w-8 rounded-[9px] grid place-items-center text-white" style={{ background: "linear-gradient(145deg,#0072bc,#003a70)" }}>
              <CalendarIcon />
            </span>
            <div className="leading-tight">
              <div className="text-[9.5px] uppercase tracking-[0.08em] text-ink3 font-semibold">Reporting period</div>
              <div className="text-[12.5px] font-semibold text-ink">September 2025 <span className="text-ink3 font-normal">· FY25–26</span></div>
            </div>
            <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-semibold text-green bg-green-soft px-1.5 py-[3px] rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-green" /> Open
            </span>
          </div>
          {user && (
            <div className="flex items-center gap-2.5">
              <div className="text-right leading-[1.15]">
                <div className="font-semibold text-[12.5px]">{user.name}</div>
                <div className="text-[10.5px] text-primary font-semibold uppercase tracking-[0.04em]">{user.role}</div>
              </div>
              <div className="w-[34px] h-[34px] rounded-full text-white grid place-items-center font-semibold text-[12px]" style={{ background: "linear-gradient(135deg,#0072bc,#003a70)" }}>
                {initials}
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 min-w-0 px-7 py-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

/* --- icons --- */
function GridIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
}
function DocIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" strokeLinecap="round" /></svg>;
}
function LayersIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function EditIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function CheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" /></svg>;
}
function CalendarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" /></svg>;
}
function LogoutIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
