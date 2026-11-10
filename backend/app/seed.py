"""Deterministic demo seed for PRISM Phase-1 — detailed baseline dataset.

Every project is seeded with module-grouped, L-level resource lines (as in the
baseline-setup mockup) plus fixed-price subcontract packages. Costs are computed
honestly from man-days x rate (no overrides), so the baseline reconciles exactly
(Nordwind planned cost $1,180,032, sold margin 36.2%) and POC/EAC are the honest
roll-up of the detailed lines.

Run:  PYTHONPATH=backend backend/.venv/Scripts/python.exe -m app.seedh
"""
from __future__ import annotations

from sqlmodel import Session, select

from . import calc
from .db import ENGINE, init_db
from .models import (
    Approval, EffortLine, LedgerEntry, Period, Project, Submission, User,
)

import json

MONTHS = ["Apr 2025", "May 2025", "Jun 2025", "Jul 2025", "Aug 2025", "Sep 2025"]
FROZEN_MONTHS = MONTHS[:-1]
# full financial year Apr 2025 → Mar 2026; current open period = Sep (index 5)
MONTH12 = ["Apr 2025", "May 2025", "Jun 2025", "Jul 2025", "Aug 2025", "Sep 2025",
           "Oct 2025", "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026"]
CUR_IDX = 5


def _spread(total, k):
    """Distribute a total across k months as integers that sum exactly."""
    if k <= 0:
        return []
    base = total // k
    arr = [base] * k
    arr[-1] += total - base * k
    return arr


def _schedule(actual, etc):
    """12-month md schedule: actuals over Apr..Sep, forecast (ETC) over Oct..Mar."""
    past = _spread(int(round(actual)), CUR_IDX + 1)
    future = _spread(int(round(etc)), len(MONTH12) - CUR_IDX - 1)
    sched = past + future
    return [{"month": MONTH12[i], "md": sched[i]} for i in range(len(MONTH12))]

# FY2025-26 rate card (USD/day)
RATE = {"L1": 288, "L2": 384, "L3": 496, "L4": 624, "L5": 768, "L6": 960, "L7": 1200}
FL = 560  # blended freelancer day rate

OWN, FREE, SUB = calc.OWN, calc.FREELANCER, calc.SUBCON


def _line(module, name, grade, rtype, rate, b, a, e):
    return EffortLine(
        project_id=0, module=module, resource_line=name, grade_level=grade,
        resource_type=rtype, rate=rate, baseline_days=b, actual_days=a, etc_days=e)


def _sub(module, vendor, window, fixed, completion):
    return EffortLine(
        project_id=0, module=module, resource_line=module, resource_type=SUB,
        vendor=vendor, recognition_basis="% Completion", completion_window=window,
        subcon_fixed_price=fixed, completion_pct=completion)


# ----- anchor: S/4HANA Finance Transformation (exact mockup lines) ----------
# (module, name, grade, type, rate, baseline_md, actual_md, etc_md)
NORDWIND = [
    _line("FI / GL & Closing", "Solution architect", "L6", OWN, RATE["L6"], 40, 23, 16),
    _line("FI / GL & Closing", "Senior consultant", "L5", OWN, RATE["L5"], 68, 39, 28),
    _line("FI / GL & Closing", "Consultant", "L3", OWN, RATE["L3"], 138, 79, 56),
    _line("FI / GL & Closing", "Associate", "L2", OWN, RATE["L2"], 90, 51, 36),
    _line("CO / Profitability", "Solution architect", "L6", OWN, RATE["L6"], 48, 35, 23),
    _line("CO / Profitability", "Senior consultant", "L4", OWN, RATE["L4"], 122, 90, 57),
    _line("CO / Profitability", "CO specialist (T&M)", "", FREE, FL, 148, 90, 72),
    _line("Treasury & Cash Mgmt", "Senior consultant", "L5", OWN, RATE["L5"], 38, 21, 15),
    _line("Treasury & Cash Mgmt", "Consultant", "L4", OWN, RATE["L4"], 80, 43, 31),
    _line("Treasury & Cash Mgmt", "Consultant", "L3", OWN, RATE["L3"], 90, 48, 34),
    _line("Data Migration & Cutover", "Migration lead", "L4", OWN, RATE["L4"], 68, 37, 34),
    _line("Data Migration & Cutover", "Consultant", "L3", OWN, RATE["L3"], 110, 61, 56),
    _line("Data Migration & Cutover", "ETL specialist (T&M)", "", FREE, FL, 145, 95, 47),
    _line("SD/MM Integration", "Solution architect", "L6", OWN, RATE["L6"], 38, 27, 15),
    _line("SD/MM Integration", "Senior consultant", "L5", OWN, RATE["L5"], 78, 55, 32),
    _line("SD/MM Integration", "Consultant", "L4", OWN, RATE["L4"], 112, 79, 45),
    _line("SD/MM Integration", "Associate", "L2", OWN, RATE["L2"], 131, 93, 53),
    _line("SD/MM Integration", "Integration dev (T&M)", "", FREE, FL, 205, 110, 113),
    _sub("BTP Integration & Fiori build", "Cobalt Systems GmbH", "Jul–Dec 2025", 92_000, 0.60),
    _sub("Basis & cutover support", "Cobalt Systems GmbH", "Dec 2025–Mar 2026", 56_000, 0.20),
]


def _gen(defs, eac_cost, poc):
    """Build detailed day-rate lines that honestly roll up to eac_cost & poc."""
    bl = sum(r * b for (_m, _n, _g, _t, r, b) in defs)
    actual_cost = poc * eac_cost
    etc_cost = eac_cost - actual_cost
    out = []
    for (m, n, g, t, r, b) in defs:
        w = (r * b) / bl if bl else 0
        a = round(actual_cost * w / r)
        e = round(etc_cost * w / r)
        out.append(_line(m, n, g, t, r, b, a, e))
    return out


PROJECTS = [
    dict(code="PRJ-2025-0418", name="S/4HANA Finance Transformation", customer="Nordwind Logistics AG",
         bu="SAP Finance — EMEA", country="Germany", status="Watch", tcv=1_850_000,
         desc="Fixed-price S/4HANA core finance & logistics implementation.",
         lines=NORDWIND, prior_ytd=862_300, committed_poc=0.592),
    dict(code="PRJ-2025-0392", name="SuccessFactors Rollout", customer="Helvetia Pharma",
         bu="SuccessFactors — EMEA", country="Switzerland", status="On Track", tcv=640_000,
         desc="SuccessFactors Employee Central & Payroll rollout.", prior_ytd=396_800, committed_poc=0.74,
         lines=_gen([
             ("Employee Central", "Solution architect", "L6", OWN, RATE["L6"], 60),
             ("Employee Central", "Senior consultant", "L5", OWN, RATE["L5"], 180),
             ("Employee Central", "Consultant", "L3", OWN, RATE["L3"], 180),
             ("Employee Central", "Associate", "L2", OWN, RATE["L2"], 120),
             ("Payroll", "Consultant", "L4", OWN, RATE["L4"], 90),
             ("Payroll", "Functional consultant (T&M)", "", FREE, FL, 150),
         ], 470_000, 0.72)),
    dict(code="PRJ-2025-0451", name="S/4HANA Greenfield", customer="Meridian Foods",
         bu="S/4HANA — APAC", country="Singapore", status="On Track", tcv=2_400_000,
         desc="Greenfield S/4HANA supply-chain implementation.", prior_ytd=834_000, committed_poc=0.43,
         lines=_gen([
             ("Supply Chain", "Solution architect", "L6", OWN, RATE["L6"], 260),
             ("Supply Chain", "Principal consultant", "L5", OWN, RATE["L5"], 350),
             ("Supply Chain", "Senior consultant", "L4", OWN, RATE["L4"], 420),
             ("Warehouse Mgmt", "Senior consultant", "L4", OWN, RATE["L4"], 300),
             ("Warehouse Mgmt", "Consultant", "L3", OWN, RATE["L3"], 500),
             ("Warehouse Mgmt", "Technical dev (T&M)", "", FREE, 600, 400),
             ("Localization", "Consultant", "L3", OWN, RATE["L3"], 240),
             ("Localization", "Associate", "L2", OWN, RATE["L2"], 260),
         ], 1_690_000, 0.41)),
    dict(code="PRJ-2025-0407", name="BTP Integration Suite", customer="Pacific Utilities",
         bu="BTP — APAC", country="Australia", status="At Risk", tcv=980_000,
         desc="SAP BTP integration & Fiori build (onerous — EAC above TCV).", prior_ytd=666_960, committed_poc=0.77,
         lines=_gen([
             ("Integration", "Principal consultant", "L5", OWN, RATE["L5"], 240),
             ("Integration", "Senior consultant", "L4", OWN, RATE["L4"], 280),
             ("BTP Platform", "Senior consultant", "L4", OWN, RATE["L4"], 180),
             ("BTP Platform", "Integration dev (T&M)", "", FREE, 600, 250),
             ("Fiori", "Consultant", "L3", OWN, RATE["L3"], 200),
             ("Fiori", "Associate", "L2", OWN, RATE["L2"], 40),
         ], 1_010_000, 0.752)),
    dict(code="PRJ-2025-0463", name="SAP Analytics Cloud Planning", customer="Lotus Retail",
         bu="Analytics — APAC", country="Thailand", status="On Track", tcv=520_000,
         desc="SAP Analytics Cloud planning & reporting.", prior_ytd=79_600, committed_poc=0.25,
         lines=_gen([
             ("Planning", "Principal consultant", "L5", OWN, RATE["L5"], 120),
             ("Planning", "Senior consultant", "L4", OWN, RATE["L4"], 180),
             ("Reporting", "Consultant", "L3", OWN, RATE["L3"], 240),
             ("Reporting", "Associate", "L2", OWN, RATE["L2"], 160),
         ], 392_000, 0.23)),
    dict(code="PRJ-2025-0478", name="Ariba Procurement", customer="Surya Industries",
         bu="Ariba — India", country="India", status="On Track", tcv=430_000,
         desc="SAP Ariba source-to-pay procurement.", prior_ytd=31_600, committed_poc=0.14,
         lines=_gen([
             ("Sourcing", "Senior consultant", "L4", OWN, RATE["L4"], 160),
             ("Procurement", "Consultant", "L3", OWN, RATE["L3"], 280),
             ("Procurement", "Associate", "L2", OWN, RATE["L2"], 210),
         ], 322_000, 0.12)),
]

NORDWIND_LEDGER = [
    ("Apr 2025", 78_000, 1_195_000, 0.065, 120_800, 0, 120_800),
    ("May 2025", 168_000, 1_205_000, 0.139, 257_900, 120_800, 137_100),
    ("Jun 2025", 286_000, 1_218_000, 0.235, 434_400, 257_900, 176_500),
    ("Jul 2025", 432_000, 1_232_000, 0.351, 648_700, 434_400, 214_300),
    ("Aug 2025", 578_000, 1_240_000, 0.466, 862_300, 648_700, 213_600),
]


def _ci(lines):
    return [calc.LineInput(
        resource_type=l.resource_type, rate=l.rate, baseline_days=l.baseline_days,
        actual_days=l.actual_days, etc_days=l.etc_days, subcon_fixed_price=l.subcon_fixed_price,
        completion_pct=l.completion_pct) for l in lines]


def _ledger_ramp(project_id, pr, prior_ytd):
    rows, n, prev = [], len(FROZEN_MONTHS), 0.0
    for i, label in enumerate(FROZEN_MONTHS, start=1):
        cum = round(prior_ytd * (i / n), 2)
        poc = (cum / pr.tcv) if pr.tcv else 0.0
        rows.append(LedgerEntry(
            project_id=project_id, period_label=label, seq=i, cost_to_date=round(poc * pr.eac, 2),
            eac=pr.eac, poc=poc, cumulative_revenue=cum, prior_ytd=round(prev, 2),
            period_revenue=round(cum - prev, 2), frozen=True, locked_by="Sai R."))
        prev = cum
    return rows


def seed():
    init_db()
    with Session(ENGINE) as s:
        for model in (Approval, Submission, LedgerEntry, EffortLine, Project, Period, User):
            for row in s.exec(select(model)).all():
                s.delete(row)
        s.commit()

        users = [
            User(name="Anita Rao", role="PM", email="anita.rao@nttdata.com"),
            User(name="M. Schäfer", role="PD", email="m.schaefer@nttdata.com"),
            User(name="Sai R.", role="Finance", email="sai.r@nttdata.com"),
        ]
        s.add_all(users)
        s.commit()
        pm, pd = users[0], users[1]

        s.add_all([Period(label=m, seq=i + 1, status="Frozen" if m in FROZEN_MONTHS else "Open")
                   for i, m in enumerate(MONTHS)])
        s.commit()

        for pdef in PROJECTS:
            pr = calc.project_calc(pdef["tcv"], _ci(pdef["lines"]), prior_frozen_ytd=pdef["prior_ytd"])
            proj = Project(
                code=pdef["code"], name=pdef["name"], customer=pdef["customer"],
                business_unit=pdef["bu"], description=pdef["desc"], tcv=pdef["tcv"],
                financial_year="FY2025-26", duration_months=12, start_date="2025-04-01",
                planned_end_date="2026-03-31", status=pdef["status"], pm_user_id=pm.id, pd_user_id=pd.id,
                baseline_cost=pr.baseline_cost, sold_margin_pct=pr.sold_margin_pct,
                committed_poc=pdef["committed_poc"], snap_prior_ytd=pdef["prior_ytd"], has_detail=True)
            s.add(proj)
            s.commit()
            for l in pdef["lines"]:
                l.project_id = proj.id
                if l.resource_type != SUB:
                    l.sched_json = json.dumps(_schedule(l.actual_days, l.etc_days))
                s.add(l)
            if pdef["code"] == "PRJ-2025-0418":
                for i, (label, cost, eac, poc, cum, prior, mrev) in enumerate(NORDWIND_LEDGER, start=1):
                    s.add(LedgerEntry(project_id=proj.id, period_label=label, seq=i, cost_to_date=cost,
                                      eac=eac, poc=poc, cumulative_revenue=cum, prior_ytd=prior,
                                      period_revenue=mrev, frozen=True, locked_by="Sai R."))
            else:
                s.add_all(_ledger_ramp(proj.id, pr, pdef["prior_ytd"]))
            s.commit()

    print("Seed complete: 6 projects with detailed module/level baselines (Sep open).")


if __name__ == "__main__":
    seed()
