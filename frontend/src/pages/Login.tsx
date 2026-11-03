import { useNavigate } from "react-router-dom";
import { api } from "../api";
import type { User } from "../api";
import { useAuth } from "../auth";
import { useAsync } from "../lib/useAsync";
import { Spinner } from "../components/ui";
import nttLogo from "../assets/ntt-logo.webp";

const ROLE: Record<string, { hint: string; tint: string; icon: string }> = {
  PM: { hint: "Submit monthly actuals & ETC", tint: "#0072bc", icon: "✎" },
  PD: { hint: "Review & approve submissions", tint: "#0d9488", icon: "✓" },
  Finance: { hint: "Recognise & lock the period", tint: "#1a8a52", icon: "$" },
};

export default function Login() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const { data: users, loading } = useAsync(() => api.users(), []);

  const pick = (u: User) => { setUser(u); nav("/"); };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(150deg,#003a70,#0a1f3d)" }}>
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full" style={{ background: "radial-gradient(circle,#0072bc55,transparent 70%)" }} />
        <img src={nttLogo} alt="NTT DATA" className="h-8 w-auto relative" />
        <div className="relative">
          <div className="font-bold tracking-[0.2em] text-4xl">PRISM</div>
          <div className="text-white/70 text-[15px] mt-2 max-w-sm">Project Insights &amp; Revenue Management — cost-based percentage-of-completion revenue recognition for fixed-price delivery.</div>
          <div className="flex gap-2 mt-6 flex-wrap">
            {["Baseline", "Monthly actuals", "PD approval", "Finance recognition"].map((t) => (
              <span key={t} className="text-[11px] font-medium bg-white/10 border border-white/15 rounded-full px-3 py-1">{t}</span>
            ))}
          </div>
        </div>
        <div className="relative text-white/50 text-[11px]">Phase-1 prototype · USD · FY2025–26 · Sep 2025 close</div>
      </div>

      {/* Right sign-in panel */}
      <div className="flex items-center justify-center p-6 bg-[var(--color-bg)]">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-[10px]" style={{ background: "linear-gradient(140deg,#0072bc,#003a70)" }} />
            <span className="font-bold tracking-[0.18em] text-lg">PRISM</span>
          </div>
          <h1 className="text-[22px] font-bold text-ink">Sign in</h1>
          <p className="text-[13px] text-ink3 mt-1 mb-6">Choose a role to continue. This demo uses a simple user picker — no password.</p>

          {loading ? <Spinner /> : (
            <div className="space-y-2.5">
              {users?.map((u) => {
                const r = ROLE[u.role] ?? { hint: u.role, tint: "#0072bc", icon: "•" };
                return (
                  <button key={u.id} onClick={() => pick(u)}
                    className="w-full flex items-center gap-3 rounded-[12px] border border-border bg-surface px-4 py-3.5 text-left hover:border-primary hover:shadow-card transition group">
                    <div className="h-11 w-11 rounded-[12px] grid place-items-center text-white text-[16px] font-bold shrink-0"
                      style={{ background: `linear-gradient(145deg, ${r.tint}, ${r.tint}bb)` }}>{r.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-ink">{u.name}</div>
                      <div className="text-[11.5px] text-ink3">{u.role} · {r.hint}</div>
                    </div>
                    <span className="text-ink3 group-hover:text-primary group-hover:translate-x-0.5 transition">→</span>
                  </button>
                );
              })}
            </div>
          )}
          <p className="text-[11px] text-ink3 mt-6">PM submits · PD approves · Finance recognises &amp; locks.</p>
        </div>
      </div>
    </div>
  );
}
