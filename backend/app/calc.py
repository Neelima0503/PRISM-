"""PRISM pure calculation engine.

This module is the single source of truth for the PRISM financial chain. It has
NO database or framework dependencies -- every function takes plain numbers /
dataclasses and returns plain numbers. That keeps the IFRS-15 cost-based POC
logic testable in isolation and identical everywhere it is used.

The chain (per prism-scope-document v1.0):

    Remaining man-days x Rate      -> Remaining (ETC) Cost
    Actual Cost + ETC Cost         -> EAC (Estimate At Completion)
    Actual Cost / EAC              -> POC   (cost-based Percent Of Completion)
    TCV x POC                      -> Cumulative Recognised Revenue
    Cumulative - Frozen Prior YTD  -> Current Period Revenue
    TCV - EAC                      -> Forecast Margin

Non-negotiable distinctions encoded here:
  * baseline vs actual vs forecast are separate inputs,
  * cumulative revenue != current-period revenue,
  * negative current-period revenue is legitimate (catch-up / reversal),
  * Fixed Subcon ETC is fixed_price x (1 - completion%), not days x rate.
"""
from __future__ import annotations

from dataclasses import dataclass, field

# Resource types -- exactly three per scope C-07.
OWN = "Own_FTE"
FREELANCER = "Freelancer"
SUBCON = "Fixed_Subcon"


def _round2(x: float) -> float:
    return round(x + 0.0, 2)


@dataclass
class LineInput:
    """One effort/resource line as fed to the engine.

    Cost normally derives from days x rate, but the reconciled demo dataset
    carries figures that are not a clean days x rate, so a line may instead
    supply explicit costs. When an explicit cost field is not None it wins;
    otherwise the engine computes it. Days are retained for display either way.
    """

    resource_type: str = OWN
    rate: float = 0.0            # daily rate (Own / Freelancer)
    baseline_days: float = 0.0
    actual_days: float = 0.0
    etc_days: float = 0.0
    # Fixed_Subcon only:
    subcon_fixed_price: float = 0.0
    completion_pct: float = 0.0  # 0..1, PM-entered % complete
    # Optional explicit cost overrides (seeded reconciled data):
    baseline_cost: float | None = None
    actual_cost: float | None = None
    etc_cost: float | None = None


@dataclass
class LineResult:
    resource_type: str
    baseline_cost: float
    actual_cost: float
    etc_cost: float
    eac_cost: float
    baseline_days: float
    actual_days: float
    etc_days: float
    eac_days: float


def line_calc(line: LineInput) -> LineResult:
    """Cost roll-up for a single resource line.

    Explicit cost overrides win; otherwise Fixed_Subcon uses completion % on
    the fixed price and day-rate lines use days x rate.
    """
    if line.resource_type == SUBCON:
        fp = line.subcon_fixed_price
        comp = max(0.0, min(1.0, line.completion_pct))
        baseline_cost = line.baseline_cost if line.baseline_cost is not None else fp
        actual_cost = line.actual_cost if line.actual_cost is not None else fp * comp
        etc_cost = line.etc_cost if line.etc_cost is not None else fp * (1.0 - comp)
        return LineResult(
            resource_type=SUBCON,
            baseline_cost=_round2(baseline_cost),
            actual_cost=_round2(actual_cost),
            etc_cost=_round2(etc_cost),
            eac_cost=_round2(actual_cost + etc_cost),
            baseline_days=line.baseline_days,
            actual_days=line.actual_days,
            etc_days=line.etc_days,
            eac_days=line.actual_days + line.etc_days,
        )

    rate = line.rate
    baseline_cost = (
        line.baseline_cost if line.baseline_cost is not None else line.baseline_days * rate
    )
    actual_cost = (
        line.actual_cost if line.actual_cost is not None else line.actual_days * rate
    )
    etc_cost = line.etc_cost if line.etc_cost is not None else line.etc_days * rate
    return LineResult(
        resource_type=line.resource_type,
        baseline_cost=_round2(baseline_cost),
        actual_cost=_round2(actual_cost),
        etc_cost=_round2(etc_cost),
        eac_cost=_round2(actual_cost + etc_cost),
        baseline_days=line.baseline_days,
        actual_days=line.actual_days,
        etc_days=line.etc_days,
        eac_days=line.actual_days + line.etc_days,
    )


@dataclass
class ProjectResult:
    tcv: float
    baseline_cost: float
    actual_cost: float
    etc_cost: float
    eac: float
    poc: float               # 0..1
    cumulative_revenue: float
    prior_frozen_ytd: float
    period_revenue: float
    forecast_margin: float
    forecast_margin_pct: float
    sold_margin: float
    sold_margin_pct: float
    # effort day roll-up
    baseline_days: float
    actual_days: float
    etc_days: float
    eac_days: float
    lines: list[LineResult] = field(default_factory=list)


def project_calc(
    tcv: float,
    lines: list[LineInput],
    prior_frozen_ytd: float = 0.0,
) -> ProjectResult:
    """Full project roll-up and the revenue chain.

    ``prior_frozen_ytd`` is the cumulative revenue already frozen in prior
    closed periods; the current period only recognises the delta.
    """
    results = [line_calc(l) for l in lines]

    baseline_cost = _round2(sum(r.baseline_cost for r in results))
    actual_cost = _round2(sum(r.actual_cost for r in results))
    etc_cost = _round2(sum(r.etc_cost for r in results))
    eac = _round2(actual_cost + etc_cost)

    poc = (actual_cost / eac) if eac > 0 else 0.0

    cumulative_revenue = _round2(tcv * poc)
    period_revenue = _round2(cumulative_revenue - prior_frozen_ytd)

    forecast_margin = _round2(tcv - eac)
    forecast_margin_pct = (forecast_margin / tcv) if tcv > 0 else 0.0

    sold_margin = _round2(tcv - baseline_cost)
    sold_margin_pct = (sold_margin / tcv) if tcv > 0 else 0.0

    return ProjectResult(
        tcv=_round2(tcv),
        baseline_cost=baseline_cost,
        actual_cost=actual_cost,
        etc_cost=etc_cost,
        eac=eac,
        poc=poc,
        cumulative_revenue=cumulative_revenue,
        prior_frozen_ytd=_round2(prior_frozen_ytd),
        period_revenue=period_revenue,
        forecast_margin=forecast_margin,
        forecast_margin_pct=forecast_margin_pct,
        sold_margin=sold_margin,
        sold_margin_pct=sold_margin_pct,
        baseline_days=sum(r.baseline_days for r in results),
        actual_days=sum(r.actual_days for r in results),
        etc_days=sum(r.etc_days for r in results),
        eac_days=sum(r.eac_days for r in results),
        lines=results,
    )


# ---------------------------------------------------------------------------
# Auto-generated exceptions (scope: Option A, RAG health).
# ---------------------------------------------------------------------------
RED = "Red"
AMBER = "Amber"
GREEN = "Green"


def project_health(pr: ProjectResult, sold_margin_pct: float) -> str:
    """RAG health from the computed result."""
    if pr.eac > pr.tcv:  # onerous
        return RED
    if pr.forecast_margin_pct < sold_margin_pct - 0.05:  # >5pp erosion
        return RED
    if pr.forecast_margin_pct < sold_margin_pct - 0.02:
        return AMBER
    return GREEN


def exceptions_for(pr: ProjectResult, sold_margin_pct: float) -> list[dict]:
    """Auto-generated QC exceptions for a project result."""
    out: list[dict] = []
    if pr.eac > pr.tcv:
        out.append({
            "code": "ONEROUS",
            "severity": RED,
            "message": f"EAC ({pr.eac:,.0f}) exceeds TCV ({pr.tcv:,.0f}) — onerous contract.",
        })
    if pr.forecast_margin_pct < sold_margin_pct - 0.05:
        out.append({
            "code": "MARGIN_EROSION",
            "severity": RED,
            "message": (
                f"Forecast margin {pr.forecast_margin_pct*100:.1f}% is more than "
                f"5pp below sold margin {sold_margin_pct*100:.1f}%."
            ),
        })
    elif pr.forecast_margin_pct < sold_margin_pct - 0.02:
        out.append({
            "code": "MARGIN_WATCH",
            "severity": AMBER,
            "message": (
                f"Forecast margin {pr.forecast_margin_pct*100:.1f}% slipping below "
                f"sold margin {sold_margin_pct*100:.1f}%."
            ),
        })
    return out
