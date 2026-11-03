// Typed API client for the PRISM backend (proxied at /api).

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.detail) msg = body.detail;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export interface User {
  id: number;
  name: string;
  role: string;
  email: string;
}

export interface PortfolioCard {
  id: number;
  code: string;
  name: string;
  customer: string;
  description: string;
  status: string;
  health: string;
  workflowStatus: string;
  tcv: number;
  poc: number;
  forecastMargin: number;
  forecastMarginPct: number;
  eac: number;
  periodRevenue: number;
  cumulativeRevenue: number;
}

export interface Portfolio {
  period: string;
  user: { id: number; name: string; role: string } | null;
  kpis: {
    tcv: number;
    currentMonthRevenue: number;
    ytdRecognised: number;
    forecastMargin: number;
    forecastMarginPct: number;
    soldMarginPct: number;
    backlog: number;
    recognisedPct: number;
    projectCount: number;
  };
  projects: PortfolioCard[];
}

export interface Line {
  id: number;
  module: string;
  name: string;
  type: string;
  typeLabel: string;
  grade: string;
  rate: number;
  vendor: string;
  recognitionBasis: string;
  completionWindow: string;
  fixedPrice: number;
  completionPct: number;
  baselineDays: number;
  actualDays: number;
  etcDays: number;
  eacDays: number;
  baselineCost: number;
  actualCost: number;
  etcCost: number;
  eacCost: number;
  sched?: number[];
}

export interface Exception {
  code: string;
  severity: string;
  message: string;
}

export interface ProjectDetail {
  id: number;
  code: string;
  name: string;
  customer: string;
  businessUnit: string;
  description: string;
  status: string;
  health: string;
  workflowStatus: string;
  financialYear: string;
  durationMonths: number;
  startDate: string;
  plannedEndDate: string;
  period: string;
  metrics: {
    tcv: number;
    poc: number;
    costToDate: number;
    etc: number;
    eac: number;
    forecastMargin: number;
    forecastMarginPct: number;
    soldMarginPct: number;
    baselineCost: number;
    cumulativeRevenue: number;
    priorYtd: number;
    periodRevenue: number;
    backlog: number;
  };
  commitment: {
    committedPoc: number;
    committed: number;
    actualPoc: number;
    actualRecognised: number;
    variance: number;
    variancePct: number;
  };
  lines: Line[];
  variance: {
    category: string;
    baseline: number;
    eac: number;
    actual: number;
    variance: number;
  }[];
  trend: {
    month: string;
    baseline: number;
    total: number;
    own: number;
    freelancer: number;
    drift: number;
  }[];
  ledger: {
    period: string;
    costToDate: number;
    eac: number;
    poc: number;
    cumulativeRevenue: number;
    priorYtd: number;
    periodRevenue: number;
    frozen: boolean;
  }[];
  exceptions: Exception[];
}

export interface Baseline {
  id: number;
  code: string;
  name: string;
  customer: string;
  businessUnit: string;
  financialYear: string;
  durationMonths: number;
  startDate: string;
  plannedEndDate: string;
  tcv: number;
  baselineCost: number;
  soldMargin: number;
  soldMarginPct: number;
  resources: Line[];
  subcontractors: Line[];
}

export interface Submission {
  id: number;
  code: string;
  name: string;
  customer: string;
  period: string;
  months: string[];
  currentIdx: number;
  tcv: number;
  metrics: {
    eac: number;
    poc: number;
    costToDate: number;
    periodRevenue: number;
    cumulativeRevenue: number;
    priorYtd: number;
    forecastMargin: number;
    forecastMarginPct: number;
    soldMarginPct: number;
  };
  lines: Line[];
  approval: {
    submissionId: number;
    status: string;
    submittedAt: string | null;
    decision: string;
    comments: string;
    approver: string | null;
  } | null;
  // review view extras
  exceptions?: Exception[];
  health?: string;
  committedPoc?: number;
}

export const api = {
  users: () => req<User[]>("/users"),
  portfolio: (userId?: number) =>
    req<Portfolio>(`/portfolio${userId ? `?user_id=${userId}` : ""}`),
  project: (id: number) => req<ProjectDetail>(`/projects/${id}`),
  baseline: (id: number) => req<Baseline>(`/projects/${id}/baseline`),
  submission: (id: number) => req<Submission>(`/projects/${id}/submission`),
  saveSubmission: (id: number, body: unknown) =>
    req<Submission>(`/projects/${id}/submission`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  review: (id: number) => req<Submission>(`/projects/${id}/review`),
  decide: (id: number, body: unknown) =>
    req<Submission>(`/projects/${id}/review`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  recognise: (id: number, body: unknown) =>
    req<ProjectDetail>(`/projects/${id}/recognise`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  createProject: (body: unknown) =>
    req<{ id: number; code: string; name: string }>("/projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
