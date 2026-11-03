// Formatting helpers (single-currency USD this phase).

export function money(n: number | null | undefined, opts: { compact?: boolean } = {}): string {
  const v = n ?? 0;
  if (opts.compact) {
    const a = Math.abs(v);
    if (a >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (a >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  }
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function k(n: number | null | undefined): string {
  return `$${((n ?? 0) / 1000).toFixed(0)}k`;
}

export function pct(fraction: number | null | undefined, digits = 1): string {
  return `${((fraction ?? 0) * 100).toFixed(digits)}%`;
}

export function days(n: number | null | undefined): string {
  return `${(n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} md`;
}

export function signed(n: number | null | undefined): string {
  const v = n ?? 0;
  return (v >= 0 ? "+" : "") + v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// Role-aware wording for the submission workflow status.
export function workflowText(status: string, role?: string): string {
  switch (status) {
    case "Submitted":
      if (role === "PD") return "Submitted — awaiting your approval";
      if (role === "Finance") return "Submitted — pending PD approval";
      return "Submitted — awaiting PD";
    case "Approved":
      if (role === "Finance") return "Approved — ready to recognise";
      return "Approved";
    case "Locked":
      return "Recognised & locked";
    default:
      return "Draft — not submitted";
  }
}

export const WF_COLOR: Record<string, { bg: string; fg: string }> = {
  Draft: { bg: "#eef1f5", fg: "#54657a" },
  Submitted: { bg: "var(--color-primary-soft)", fg: "#003a70" },
  Approved: { bg: "var(--color-green-soft)", fg: "#157045" },
  Locked: { bg: "var(--color-teal-soft)", fg: "#0a6b62" },
};
