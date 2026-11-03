// Client-side mirror of the backend calc engine, for live form previews.
// The backend remains the source of truth; this only drives instant feedback.

export interface PreviewLine {
  type: string;
  rate: number;
  actualDays: number;
  etcDays: number;
  fixedPrice: number;
  completionPct: number;
  baselineDays: number;
}

export interface PreviewResult {
  baselineCost: number;
  actualCost: number;
  etcCost: number;
  eac: number;
  poc: number;
  cumulativeRevenue: number;
  periodRevenue: number;
  forecastMargin: number;
  forecastMarginPct: number;
  soldMargin: number;
  soldMarginPct: number;
}

export function preview(tcv: number, lines: PreviewLine[], priorYtd = 0): PreviewResult {
  let baselineCost = 0;
  let actualCost = 0;
  let etcCost = 0;
  for (const l of lines) {
    if (l.type === "Fixed_Subcon") {
      const comp = Math.max(0, Math.min(1, l.completionPct || 0));
      baselineCost += l.fixedPrice;
      actualCost += l.fixedPrice * comp;
      etcCost += l.fixedPrice * (1 - comp);
    } else {
      baselineCost += (l.baselineDays || 0) * l.rate;
      actualCost += (l.actualDays || 0) * l.rate;
      etcCost += (l.etcDays || 0) * l.rate;
    }
  }
  const eac = actualCost + etcCost;
  const poc = eac > 0 ? actualCost / eac : 0;
  const cumulativeRevenue = tcv * poc;
  const periodRevenue = cumulativeRevenue - priorYtd;
  const forecastMargin = tcv - eac;
  const soldMargin = tcv - baselineCost;
  return {
    baselineCost,
    actualCost,
    etcCost,
    eac,
    poc,
    cumulativeRevenue,
    periodRevenue,
    forecastMargin,
    forecastMarginPct: tcv > 0 ? forecastMargin / tcv : 0,
    soldMargin,
    soldMarginPct: tcv > 0 ? soldMargin / tcv : 0,
  };
}
