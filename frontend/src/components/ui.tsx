import type { ReactNode } from "react";

/* ------------------------------------------------------------------ *
 *  Card
 * ------------------------------------------------------------------ */
export function Card({
  children,
  className = "",
  pad = true,
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <div
      className={`rounded-[14px] bg-surface border border-border shadow-card ${
        pad ? "p-[18px]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHead({
  title,
  desc,
  right,
}: {
  title: string;
  desc?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div>
        <h3 className="text-[14px] font-bold text-ink">{title}</h3>
        {desc && <div className="text-[11.5px] text-ink3 mt-0.5">{desc}</div>}
      </div>
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  KPI tile — colored top accent bar, optional gradient highlight
 * ------------------------------------------------------------------ */
const ACCENT: Record<string, string> = {
  blue: "#0072bc",
  teal: "#0d9488",
  green: "#1a8a52",
  amber: "#b9791a",
  red: "#cb4634",
  indigo: "#003a70",
};

export function Kpi({
  label,
  value,
  sub,
  accent = "blue",
  hi = false,
  deltaTone,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: keyof typeof ACCENT | string;
  hi?: boolean;
  deltaTone?: "pos" | "neg";
}) {
  const color = ACCENT[accent] ?? ACCENT.blue;
  if (hi) {
    return (
      <div
        className="rounded-[14px] p-4 text-white shadow-card relative overflow-hidden"
        style={{ background: `linear-gradient(150deg, ${color}, ${ACCENT.indigo})` }}
      >
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/75">{label}</div>
        <div className="mono text-[26px] font-semibold leading-tight mt-1">{value}</div>
        {sub && <div className="text-[11.5px] text-white/80 mt-1">{sub}</div>}
      </div>
    );
  }
  return (
    <div className="rounded-[14px] bg-surface border border-border shadow-card p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: color }} />
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink3">{label}</div>
      <div className="mono text-[24px] font-semibold text-ink leading-tight mt-1">{value}</div>
      {sub && (
        <div
          className={`text-[11.5px] mt-1 ${
            deltaTone === "pos"
              ? "text-green"
              : deltaTone === "neg"
              ? "text-red"
              : "text-ink3"
          }`}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Colorful stat tile with a 3D gradient icon chip
 * ------------------------------------------------------------------ */
const TONE: Record<string, { base: string; dark: string; tint: string }> = {
  blue: { base: "#0072bc", dark: "#004f87", tint: "#e6f1fa" },
  navy: { base: "#003a70", dark: "#00284e", tint: "#e6edf5" },
  teal: { base: "#0d9488", dark: "#0a6b62", tint: "#e2f4f1" },
  green: { base: "#1a8a52", dark: "#12663c", tint: "#e2f3ea" },
  amber: { base: "#d98a16", dark: "#a9680d", tint: "#fbefd9" },
  red: { base: "#cb4634", dark: "#9f3426", tint: "#fae6e2" },
  violet: { base: "#6d53d0", dark: "#4f3aa3", tint: "#ece7fb" },
};

export function StatTile({
  label,
  value,
  sub,
  tone = "blue",
  icon,
  deltaTone,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: keyof typeof TONE | string;
  icon?: ReactNode;
  deltaTone?: "pos" | "neg";
}) {
  const t = TONE[tone] ?? TONE.blue;
  return (
    <div
      className="rounded-[14px] border border-border shadow-card p-4 flex items-start gap-3 min-w-0"
      style={{ background: `linear-gradient(135deg,#ffffff 42%, ${t.tint})` }}
    >
      {icon && (
        <div
          className="relative h-11 w-11 rounded-[13px] grid place-items-center shrink-0 text-white overflow-hidden"
          style={{
            background: `linear-gradient(150deg, ${t.base}, ${t.dark})`,
            boxShadow: `inset 0 1.5px 1px rgba(255,255,255,.55), inset 0 -3px 6px rgba(0,0,0,.28), 0 8px 16px ${t.base}44`,
          }}
        >
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
          <span className="relative drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">{icon}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-ink3 truncate">{label}</div>
        <div className="mono text-[17px] font-semibold text-ink leading-tight mt-0.5 truncate">{value}</div>
        {sub && (
          <div
            className={`text-[11px] mt-0.5 truncate ${
              deltaTone === "pos" ? "text-green" : deltaTone === "neg" ? "text-red" : "text-ink3"
            }`}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Status pill (soft, with dot)
 * ------------------------------------------------------------------ */
const PILL: Record<string, { bg: string; fg: string; dot: string }> = {
  "On Track": { bg: "var(--color-green-soft)", fg: "#157045", dot: "#1a8a52" },
  Green: { bg: "var(--color-green-soft)", fg: "#157045", dot: "#1a8a52" },
  Approved: { bg: "var(--color-green-soft)", fg: "#157045", dot: "#1a8a52" },
  Recognised: { bg: "var(--color-green-soft)", fg: "#157045", dot: "#1a8a52" },
  Watch: { bg: "var(--color-amber-soft)", fg: "#8f5e14", dot: "#b9791a" },
  Amber: { bg: "var(--color-amber-soft)", fg: "#8f5e14", dot: "#b9791a" },
  Draft: { bg: "var(--color-amber-soft)", fg: "#8f5e14", dot: "#b9791a" },
  Held: { bg: "var(--color-amber-soft)", fg: "#8f5e14", dot: "#b9791a" },
  "Pending PD": { bg: "var(--color-amber-soft)", fg: "#8f5e14", dot: "#b9791a" },
  "At Risk": { bg: "var(--color-red-soft)", fg: "#a83a2b", dot: "#cb4634" },
  Red: { bg: "var(--color-red-soft)", fg: "#a83a2b", dot: "#cb4634" },
  Onerous: { bg: "var(--color-red-soft)", fg: "#a83a2b", dot: "#cb4634" },
  Delayed: { bg: "var(--color-red-soft)", fg: "#a83a2b", dot: "#cb4634" },
  Rejected: { bg: "var(--color-red-soft)", fg: "#a83a2b", dot: "#cb4634" },
  Submitted: { bg: "var(--color-primary-soft)", fg: "#003a70", dot: "#0072bc" },
  Pending: { bg: "var(--color-surface3)", fg: "#5b6472", dot: "#8b94a4" },
};

export function Pill({ value, label }: { value: string; label?: string }) {
  const s = PILL[value] ?? PILL.Pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-semibold"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
      {label ?? value}
    </span>
  );
}

/* resource-type tag (Internal / Freelancer / Subcontractor) */
export function Rtag({ type }: { type: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    Own_FTE: { bg: "var(--color-primary-soft)", fg: "#003a70", label: "Internal" },
    Freelancer: { bg: "var(--color-amber-soft)", fg: "#8f5e14", label: "Freelancer" },
    Fixed_Subcon: { bg: "var(--color-teal-soft)", fg: "#0a6b62", label: "Subcontractor" },
  };
  const t = map[type] ?? map.Own_FTE;
  return (
    <span className="rounded-md px-2 py-[2px] text-[10px] font-semibold" style={{ background: t.bg, color: t.fg }}>
      {t.label}
    </span>
  );
}

export function Lvl({ children }: { children: ReactNode }) {
  return (
    <span className="mono rounded-md border border-border bg-surface3 px-[7px] py-[1px] text-[11px] font-semibold text-ink mr-2">
      {children}
    </span>
  );
}

export function ChipCode({ children }: { children: ReactNode }) {
  return (
    <span className="mono rounded-[7px] border border-border bg-surface3 px-2 py-[3px] text-[11.5px] font-medium text-ink2">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 *  Buttons / inputs
 * ------------------------------------------------------------------ */
export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "teal" | "green" | "danger";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  const styles: Record<string, string> = {
    primary: "bg-primary text-white border border-primary hover:bg-primary2",
    teal: "bg-teal text-white border border-teal hover:brightness-95",
    green: "bg-green text-white border border-green hover:brightness-95",
    danger: "bg-red text-white border border-red hover:brightness-95",
    ghost: "bg-surface text-ink border border-border2 hover:bg-surface3",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-[9px] px-4 py-[9px] text-[12.7px] font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-[9px] border border-border2 bg-white px-[11px] py-[9px] text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft2 disabled:bg-surface3 disabled:text-ink2 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-[9px] border border-border2 bg-white px-[11px] py-[9px] text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft2 ${props.className ?? ""}`}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10.5px] font-semibold uppercase tracking-wide text-ink3">{label}</span>
      {children}
    </label>
  );
}

/* read-only / calc box (mockup .f .box) */
export function ValueBox({
  children,
  variant = "ro",
}: {
  children: ReactNode;
  variant?: "ro" | "calc";
}) {
  const cls =
    variant === "calc"
      ? "bg-primary-soft border-primary-soft2 text-primary2 font-semibold"
      : "bg-surface3 border-border2 border-dashed text-ink2";
  return (
    <div className={`rounded-[9px] border px-[11px] py-[9px] text-[13px] min-h-[38px] flex items-center ${cls}`}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Stepper
 * ------------------------------------------------------------------ */
export function Stepper({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {steps.map((label, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`h-6 w-6 rounded-full grid place-items-center text-[11px] font-semibold ${
                done
                  ? "bg-green text-white"
                  : current
                  ? "bg-primary text-white"
                  : "bg-surface3 text-ink3"
              }`}
            >
              {done ? "✓" : i + 1}
            </div>
            <span
              className={`text-[12.5px] ${
                current ? "font-semibold text-ink" : done ? "text-ink2" : "text-ink3"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
          </div>
        );
      })}
    </div>
  );
}

/* segmented control */
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex bg-surface3 border border-border rounded-[9px] p-[3px]">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-[13px] py-[6px] rounded-md text-[12px] font-semibold transition ${
            value === o ? "bg-white text-ink shadow-card" : "text-ink2"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Right-rail gradient outcard
 * ------------------------------------------------------------------ */
export function OutCard({
  caption,
  headline,
  headSub,
  gradient = "blue",
  children,
}: {
  caption: string;
  headline: ReactNode;
  headSub?: ReactNode;
  gradient?: "blue" | "green" | "teal";
  children: ReactNode;
}) {
  const grads: Record<string, string> = {
    blue: "linear-gradient(135deg,#0072bc,#003a70)",
    green: "linear-gradient(150deg,#166f45,#1a8a52)",
    teal: "linear-gradient(150deg,#0a6b62,#0d9488)",
  };
  return (
    <div className="rounded-[14px] bg-surface border border-border shadow-card overflow-hidden">
      <div className="px-[18px] py-[15px] text-white" style={{ background: grads[gradient] }}>
        <div className="text-[11px] uppercase tracking-wider font-semibold text-white/80">{caption}</div>
        <div className="mono text-[30px] font-semibold tracking-tight mt-1">{headline}</div>
        {headSub && <div className="text-[11.5px] text-white/80 mt-0.5">{headSub}</div>}
      </div>
      <div className="p-[18px]">{children}</div>
    </div>
  );
}

export function ORow({ k, v, tone }: { k: string; v: ReactNode; tone?: "pos" | "neg" }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-dashed border-border last:border-0">
      <span className="text-[12px] text-ink2">{k}</span>
      <span
        className={`mono text-[12.5px] font-semibold ${
          tone === "pos" ? "text-green" : tone === "neg" ? "text-red" : "text-ink"
        }`}
      >
        {v}
      </span>
    </div>
  );
}

/* composition bar + legend */
export function MixBar({
  parts,
}: {
  parts: { label: string; value: number; color: string; display: string }[];
}) {
  const total = Math.max(1, parts.reduce((s, p) => s + p.value, 0));
  return (
    <div>
      <div className="h-3 rounded-[7px] overflow-hidden flex border border-border my-3">
        {parts.map((p) => (
          <div key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />
        ))}
      </div>
      <div className="flex flex-col gap-[7px]">
        {parts.map((p) => (
          <div key={p.label} className="flex items-center gap-2 text-[11.5px]">
            <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: p.color }} />
            <span className="text-ink2">{p.label}</span>
            <span className="mono ml-auto text-ink2 font-semibold">{p.display}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Page scaffolding
 * ------------------------------------------------------------------ */
export function PageHead({
  title,
  crumb,
  meta,
  actions,
}: {
  title: string;
  crumb?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-[18px]">
      {crumb && <div className="flex items-center gap-2 text-[11.5px] text-ink3 mb-2.5">{crumb}</div>}
      <div className="flex items-start gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.2px] m-0">{title}</h1>
          {meta && <div className="flex items-center gap-2.5 mt-2 flex-wrap">{meta}</div>}
        </div>
        {actions && <div className="ml-auto flex gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-[13px] text-ink3 p-8">
      <span className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      {label}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="rounded-[10px] bg-red-soft text-[#a83a2b] px-4 py-3 text-[13px]">{message}</div>;
}
