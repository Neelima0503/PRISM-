"""Service layer: load entities, run the calc engine, shape API responses."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Session, select

from . import calc
from .models import (
    Approval,
    EffortLine,
    LedgerEntry,
    Period,
    Project,
    Submission,
    User,
)

TYPE_LABEL = {
    calc.OWN: "Own FTE",
    calc.FREELANCER: "Freelancer",
    calc.SUBCON: "Fixed Subcon",
}


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# core loading
# ---------------------------------------------------------------------------
def current_period(s: Session) -> Period:
    p = s.exec(select(Period).where(Period.status == "Open")).first()
    if p:
        return p
    # fall back to the last period by seq
    return s.exec(select(Period).order_by(Period.seq.desc())).first()


def _lines(s: Session, project_id: int) -> list[EffortLine]:
    return s.exec(select(EffortLine).where(EffortLine.project_id == project_id)).all()


def _calc_inputs(lines: list[EffortLine]) -> list[calc.LineInput]:
    return [calc.LineInput(
        resource_type=l.resource_type,
        rate=l.rate,
        baseline_days=l.baseline_days,
        actual_days=l.actual_days,
        etc_days=l.etc_days,
        subcon_fixed_price=l.subcon_fixed_price,
        completion_pct=l.completion_pct,
        baseline_cost=l.baseline_cost,
        actual_cost=l.actual_cost,
        etc_cost=l.etc_cost,
    ) for l in lines]


def _prior_ytd(s: Session, project: Project) -> float:
    """Latest frozen cumulative revenue; else the seeded snapshot."""
    rows = s.exec(
        select(LedgerEntry)
        .where(LedgerEntry.project_id == project.id, LedgerEntry.frozen == True)  # noqa: E712
        .order_by(LedgerEntry.seq.desc())
    ).all()
    if rows:
        return rows[0].cumulative_revenue
    return project.snap_prior_ytd


def compute(s: Session, project: Project) -> calc.ProjectResult:
    lines = _lines(s, project.id)
    return calc.project_calc(
        project.tcv, _calc_inputs(lines), prior_frozen_ytd=_prior_ytd(s, project))


# ---------------------------------------------------------------------------
# users
# ---------------------------------------------------------------------------
def list_users(s: Session) -> list[dict]:
    return [
        {"id": u.id, "name": u.name, "role": u.role, "email": u.email}
        for u in s.exec(select(User).order_by(User.id)).all()
    ]


def _user(s: Session, uid: Optional[int]) -> Optional[User]:
    return s.get(User, uid) if uid else None


# ---------------------------------------------------------------------------
# portfolio
# ---------------------------------------------------------------------------
def _visible_projects(s: Session, user: Optional[User]) -> list[Project]:
    projects = s.exec(select(Project).order_by(Project.id)).all()
    if not user or user.role in ("Finance", "Admin", "ReadOnly"):
        return projects
    if user.role == "PM":
        return [p for p in projects if p.pm_user_id == user.id]
    if user.role == "PD":
        return [p for p in projects if p.pd_user_id == user.id]
    return projects


def portfolio(s: Session, user_id: Optional[int]) -> dict:
    user = _user(s, user_id)
    projects = _visible_projects(s, user)
    period = current_period(s)

    tcv = recognised_ytd = current_month = eac = backlog = 0.0
    sold_cost = 0.0
    cards = []
    for p in projects:
        pr = compute(s, p)
        tcv += pr.tcv
        recognised_ytd += pr.cumulative_revenue
        current_month += pr.period_revenue
        eac += pr.eac
        sold_cost += pr.baseline_cost
        backlog += max(0.0, pr.tcv - pr.cumulative_revenue)
        cards.append({
            "id": p.id,
            "code": p.code,
            "name": p.name,
            "customer": p.customer,
            "description": p.description,
            "status": p.status,
            "health": calc.project_health(pr, p.sold_margin_pct),
            "workflowStatus": _workflow_status(s, p.id, period.label if period else ""),
            "tcv": pr.tcv,
            "poc": pr.poc,
            "forecastMargin": pr.forecast_margin,
            "forecastMarginPct": pr.forecast_margin_pct,
            "eac": pr.eac,
            "periodRevenue": pr.period_revenue,
            "cumulativeRevenue": pr.cumulative_revenue,
        })

    forecast_margin = tcv - eac
    kpis = {
        "tcv": round(tcv, 2),
        "currentMonthRevenue": round(current_month, 2),
        "ytdRecognised": round(recognised_ytd, 2),
        "forecastMargin": round(forecast_margin, 2),
        "forecastMarginPct": (forecast_margin / tcv) if tcv else 0.0,
        "soldMarginPct": ((tcv - sold_cost) / tcv) if tcv else 0.0,
        "backlog": round(backlog, 2),
        "recognisedPct": (recognised_ytd / tcv) if tcv else 0.0,
        "projectCount": len(cards),
    }
    return {
        "period": period.label if period else "",
        "user": {"id": user.id, "name": user.name, "role": user.role} if user else None,
        "kpis": kpis,
        "projects": cards,
    }


# ---------------------------------------------------------------------------
# project detail (Revenue Recognition screen)
# ---------------------------------------------------------------------------
def _line_view(l: EffortLine, lr: calc.LineResult) -> dict:
    return {
        "id": l.id,
        "module": l.module,
        "name": l.resource_line,
        "type": l.resource_type,
        "typeLabel": TYPE_LABEL.get(l.resource_type, l.resource_type),
        "grade": l.grade_level,
        "rate": l.rate,
        "vendor": l.vendor,
        "recognitionBasis": l.recognition_basis,
        "completionWindow": l.completion_window,
        "fixedPrice": l.subcon_fixed_price,
        "completionPct": l.completion_pct,
        "baselineDays": lr.baseline_days,
        "actualDays": lr.actual_days,
        "etcDays": lr.etc_days,
        "eacDays": lr.eac_days,
        "baselineCost": lr.baseline_cost,
        "actualCost": lr.actual_cost,
        "etcCost": lr.etc_cost,
        "eacCost": lr.eac_cost,
    }


def _ledger(s: Session, project_id: int) -> list[dict]:
    rows = s.exec(
        select(LedgerEntry)
        .where(LedgerEntry.project_id == project_id)
        .order_by(LedgerEntry.seq)
    ).all()
    return [{
        "period": r.period_label,
        "costToDate": r.cost_to_date,
        "eac": r.eac,
        "poc": r.poc,
        "cumulativeRevenue": r.cumulative_revenue,
        "priorYtd": r.prior_ytd,
        "periodRevenue": r.period_revenue,
        "frozen": r.frozen,
    } for r in rows]


def project_detail(s: Session, project_id: int) -> dict:
    p = s.get(Project, project_id)
    if not p:
        return {}
    lines = _lines(s, p.id)
    pr = calc.project_calc(
        p.tcv, _calc_inputs(lines), prior_frozen_ytd=_prior_ytd(s, p))
    period = current_period(s)
    prior = _prior_ytd(s, p)

    # live current-period ledger row (not frozen)
    ledger = _ledger(s, p.id)
    ledger.append({
        "period": period.label if period else "Current",
        "costToDate": pr.actual_cost,
        "eac": pr.eac,
        "poc": pr.poc,
        "cumulativeRevenue": pr.cumulative_revenue,
        "priorYtd": prior,
        "periodRevenue": pr.period_revenue,
        "frozen": False,
    })

    # commitment: PD-committed POC vs actual
    committed_revenue = round(p.committed_poc * pr.tcv - prior, 2)
    commitment = {
        "committedPoc": p.committed_poc,
        "committed": committed_revenue,
        "actualPoc": pr.poc,
        "actualRecognised": pr.period_revenue,
        "variance": round(pr.period_revenue - committed_revenue, 2),
        "variancePct": ((pr.period_revenue - committed_revenue) / committed_revenue)
        if committed_revenue else 0.0,
    }

    # cumulative effort trend with baseline-to-date and drift
    trend = _trend(p, lines, pr)

    # effort variance by category
    by_cat: dict[str, dict] = {}
    for l, lr in zip(lines, pr.lines):
        cat = TYPE_LABEL.get(l.resource_type, l.resource_type)
        c = by_cat.setdefault(cat, {"baseline": 0.0, "eac": 0.0, "actual": 0.0})
        if l.resource_type == calc.SUBCON:
            c["baseline"] += lr.baseline_cost
            c["eac"] += lr.eac_cost
            c["actual"] += lr.actual_cost
        else:
            c["baseline"] += lr.baseline_days
            c["eac"] += lr.eac_days
            c["actual"] += lr.actual_days
    variance = [
        {"category": k, "baseline": round(v["baseline"], 2),
         "eac": round(v["eac"], 2), "actual": round(v["actual"], 2),
         "variance": round(v["eac"] - v["baseline"], 2)}
        for k, v in by_cat.items()
    ]

    return {
        "id": p.id,
        "code": p.code,
        "name": p.name,
        "customer": p.customer,
        "businessUnit": p.business_unit,
        "description": p.description,
        "status": p.status,
        "health": calc.project_health(pr, p.sold_margin_pct),
        "workflowStatus": _workflow_status(s, p.id, period.label if period else ""),
        "financialYear": p.financial_year,
        "durationMonths": p.duration_months,
        "startDate": p.start_date,
        "plannedEndDate": p.planned_end_date,
        "period": period.label if period else "",
        "metrics": {
            "tcv": pr.tcv,
            "poc": pr.poc,
            "costToDate": pr.actual_cost,
            "etc": pr.etc_cost,
            "eac": pr.eac,
            "forecastMargin": pr.forecast_margin,
            "forecastMarginPct": pr.forecast_margin_pct,
            "soldMarginPct": p.sold_margin_pct,
            "baselineCost": pr.baseline_cost,
            "cumulativeRevenue": pr.cumulative_revenue,
            "priorYtd": prior,
            "periodRevenue": pr.period_revenue,
            "backlog": round(max(0.0, pr.tcv - pr.cumulative_revenue), 2),
        },
        "commitment": commitment,
        "lines": [_line_view(l, lr) for l, lr in zip(lines, pr.lines)],
        "variance": variance,
        "trend": trend,
        "ledger": ledger,
        "exceptions": calc.exceptions_for(pr, p.sold_margin_pct),
    }


def _trend(p: Project, lines: list[EffortLine], pr: calc.ProjectResult) -> list[dict]:
    """Cumulative effort trend Apr..Sep with linear baseline-to-date + drift."""
    from .seed import MONTHS
    months = MONTHS
    n = len(months)
    total_baseline_days = sum(
        l.baseline_days for l in lines if l.resource_type != calc.SUBCON)
    total_actual_days = sum(
        l.actual_days for l in lines if l.resource_type != calc.SUBCON)
    own_days = sum(l.actual_days for l in lines if l.resource_type == calc.OWN)
    free_days = sum(l.actual_days for l in lines if l.resource_type == calc.FREELANCER)

    rows = []
    for i, m in enumerate(months, start=1):
        frac = i / n
        baseline = round(total_baseline_days * frac, 1)
        # actuals ramp over the closed months, flat at the current total
        actual_frac = min(1.0, i / (n - 1)) if n > 1 else 1.0
        total = round(total_actual_days * actual_frac, 1)
        rows.append({
            "month": m,
            "baseline": baseline,
            "total": total,
            "own": round(own_days * actual_frac, 1),
            "freelancer": round(free_days * actual_frac, 1),
            "drift": round(total - baseline, 1),
        })
    return rows


# ---------------------------------------------------------------------------
# baseline view
# ---------------------------------------------------------------------------
def baseline_view(s: Session, project_id: int) -> dict:
    p = s.get(Project, project_id)
    if not p:
        return {}
    lines = _lines(s, p.id)
    pr = calc.project_calc(p.tcv, _calc_inputs(lines))
    resources, subcon = [], []
    for l, lr in zip(lines, pr.lines):
        v = _line_view(l, lr)
        (subcon if l.resource_type == calc.SUBCON else resources).append(v)
    return {
        "id": p.id,
        "code": p.code,
        "name": p.name,
        "customer": p.customer,
        "businessUnit": p.business_unit,
        "financialYear": p.financial_year,
        "durationMonths": p.duration_months,
        "startDate": p.start_date,
        "plannedEndDate": p.planned_end_date,
        "tcv": p.tcv,
        "baselineCost": pr.baseline_cost,
        "soldMargin": pr.sold_margin,
        "soldMarginPct": pr.sold_margin_pct,
        "resources": resources,
        "subcontractors": subcon,
    }


# ---------------------------------------------------------------------------
# PM submission  (Monthly Actuals & ETC)
# ---------------------------------------------------------------------------
def _workflow_status(s: Session, project_id: int, period_label: str) -> str:
    """Current-period submission status: Draft (default) / Submitted / Approved / Locked."""
    sub = s.exec(
        select(Submission)
        .where(Submission.project_id == project_id, Submission.period_label == period_label)
    ).first()
    return sub.status if sub else "Draft"


def _approval_for(s: Session, project_id: int, period_label: str) -> Optional[dict]:
    sub = s.exec(
        select(Submission)
        .where(Submission.project_id == project_id,
               Submission.period_label == period_label)
    ).first()
    if not sub:
        return None
    appr = s.exec(
        select(Approval).where(Approval.submission_id == sub.id)
        .order_by(Approval.id.desc())
    ).first()
    approver = _user(s, appr.approver_id) if appr else None
    return {
        "submissionId": sub.id,
        "status": sub.status,
        "submittedAt": sub.submitted_at.isoformat() if sub.submitted_at else None,
        "decision": appr.decision if appr else "Pending",
        "comments": appr.comments if appr else "",
        "approver": approver.name if approver else None,
    }


def _parse_sched(l: EffortLine) -> list[float]:
    """Return a 12-month md schedule aligned to MONTH12 (synthesise if missing)."""
    from .seed import MONTH12, CUR_IDX
    n = len(MONTH12)
    if l.sched_json:
        try:
            raw = json.loads(l.sched_json)
            by = {r["month"]: float(r["md"]) for r in raw}
            return [by.get(m, 0.0) for m in MONTH12]
        except Exception:
            pass
    # synthesise: actual over Apr..current, etc over rest
    def spread(total, k):
        if k <= 0:
            return []
        base = int(total) // k
        arr = [base] * k
        arr[-1] += int(round(total)) - base * k
        return arr
    return spread(l.actual_days, CUR_IDX + 1) + spread(l.etc_days, n - CUR_IDX - 1)


def submission_view(s: Session, project_id: int) -> dict:
    from .seed import MONTH12, CUR_IDX
    p = s.get(Project, project_id)
    if not p:
        return {}
    lines = _lines(s, p.id)
    pr = calc.project_calc(
        p.tcv, _calc_inputs(lines), prior_frozen_ytd=_prior_ytd(s, p))
    period = current_period(s)
    line_dicts = []
    for l, lr in zip(lines, pr.lines):
        d = _line_view(l, lr)
        d["sched"] = _parse_sched(l)
        line_dicts.append(d)
    return {
        "id": p.id,
        "code": p.code,
        "name": p.name,
        "customer": p.customer,
        "period": period.label if period else "",
        "months": MONTH12,
        "currentIdx": CUR_IDX,
        "tcv": p.tcv,
        "metrics": {
            "eac": pr.eac,
            "poc": pr.poc,
            "costToDate": pr.actual_cost,
            "periodRevenue": pr.period_revenue,
            "cumulativeRevenue": pr.cumulative_revenue,
            "priorYtd": _prior_ytd(s, p),
            "forecastMargin": pr.forecast_margin,
            "forecastMarginPct": pr.forecast_margin_pct,
            "soldMarginPct": p.sold_margin_pct,
        },
        "lines": line_dicts,
        "approval": _approval_for(s, p.id, period.label if period else ""),
    }


def save_submission(s: Session, project_id: int, payload: dict) -> dict:
    """Update actual/etc/completion on lines, then draft or submit."""
    p = s.get(Project, project_id)
    if not p:
        return {}
    from .seed import MONTH12, CUR_IDX
    period = current_period(s)
    label = period.label if period else ""
    existing = s.exec(
        select(Submission)
        .where(Submission.project_id == p.id, Submission.period_label == label)
    ).first()
    # a period is editable by the PM only while it is a Draft; once Submitted,
    # Approved or recognised/Locked it is frozen on the server too.
    if existing and existing.status in ("Submitted", "Approved", "Locked"):
        return submission_view(s, project_id)
    lines = {l.id: l for l in _lines(s, p.id)}
    for upd in payload.get("lines", []):
        l = lines.get(upd.get("id"))
        if not l:
            continue
        changed = False
        # month-grid save: a full 12-month schedule drives cumulative actual/ETC
        if upd.get("sched") is not None and l.resource_type != calc.SUBCON:
            sched = [float(x or 0) for x in upd["sched"]][: len(MONTH12)]
            sched += [0.0] * (len(MONTH12) - len(sched))
            l.sched_json = json.dumps(
                [{"month": MONTH12[i], "md": sched[i]} for i in range(len(MONTH12))])
            actual = sum(sched[: CUR_IDX + 1])
            etc = sum(sched[CUR_IDX + 1:])
            if actual != l.actual_days or etc != l.etc_days:
                l.actual_days, l.etc_days = actual, etc
                changed = True
            if changed:
                l.actual_cost = None
                l.etc_cost = None
                s.add(l)
            continue
        if l.resource_type == calc.SUBCON:
            if upd.get("completionPct") is not None:
                nv = max(0.0, min(1.0, float(upd["completionPct"])))
                if nv != l.completion_pct:
                    l.completion_pct = nv
                    changed = True
        else:
            if upd.get("actualDays") is not None:
                nv = float(upd["actualDays"])
                if nv != l.actual_days:
                    l.actual_days = nv
                    changed = True
            if upd.get("etcDays") is not None:
                nv = float(upd["etcDays"])
                if nv != l.etc_days:
                    l.etc_days = nv
                    changed = True
        # Once a PM edits a line, drop the seeded cost override so the figure
        # is driven by days x rate (completion % x price for subcon) and flows
        # through to the recognition on every screen.
        if changed:
            l.actual_cost = None
            l.etc_cost = None
            if l.resource_type != calc.SUBCON:
                # keep the month schedule consistent with the new cumulative figures
                def spread(total, k):
                    base = int(total) // k if k else 0
                    arr = [base] * k
                    if k:
                        arr[-1] += int(round(total)) - base * k
                    return arr
                sch = spread(l.actual_days, CUR_IDX + 1) + spread(l.etc_days, len(MONTH12) - CUR_IDX - 1)
                l.sched_json = json.dumps(
                    [{"month": MONTH12[i], "md": sch[i]} for i in range(len(MONTH12))])
            s.add(l)
    s.commit()

    lines_list = _lines(s, p.id)
    pr = calc.project_calc(
        p.tcv, _calc_inputs(lines_list), prior_frozen_ytd=_prior_ytd(s, p))
    period = current_period(s)
    label = period.label if period else ""

    sub = s.exec(
        select(Submission)
        .where(Submission.project_id == p.id, Submission.period_label == label)
    ).first()
    if not sub:
        sub = Submission(project_id=p.id, period_label=label)
    sub.eac = pr.eac
    sub.poc = pr.poc
    sub.period_revenue = pr.period_revenue
    sub.cumulative_revenue = pr.cumulative_revenue
    sub.updated_at = _utcnow()
    if payload.get("submit"):
        sub.status = "Submitted"
        sub.submitted_by = payload.get("userId")
        sub.submitted_at = _utcnow()
    else:
        sub.status = "Draft"
    s.add(sub)
    s.commit()
    return submission_view(s, project_id)


# ---------------------------------------------------------------------------
# PD review & approval
# ---------------------------------------------------------------------------
def review_view(s: Session, project_id: int) -> dict:
    p = s.get(Project, project_id)
    if not p:
        return {}
    detail = submission_view(s, project_id)
    pr_lines = _lines(s, p.id)
    pr = calc.project_calc(
        p.tcv, _calc_inputs(pr_lines), prior_frozen_ytd=_prior_ytd(s, p))
    detail["exceptions"] = calc.exceptions_for(pr, p.sold_margin_pct)
    detail["health"] = calc.project_health(pr, p.sold_margin_pct)
    detail["committedPoc"] = p.committed_poc
    return detail


def decide(s: Session, project_id: int, payload: dict) -> dict:
    p = s.get(Project, project_id)
    if not p:
        return {}
    period = current_period(s)
    label = period.label if period else ""
    sub = s.exec(
        select(Submission)
        .where(Submission.project_id == p.id, Submission.period_label == label)
    ).first()
    if not sub:
        return {"error": "No submission to review."}
    # the PD can only act on a Submitted period — not an Approved or locked one
    if sub.status != "Submitted":
        return review_view(s, project_id)
    decision = payload.get("decision", "Approved")  # Approved | Held | Rejected
    appr = Approval(
        submission_id=sub.id,
        decision=decision,
        comments=payload.get("comments", ""),
        approver_id=payload.get("userId"),
        decided_at=_utcnow(),
    )
    s.add(appr)
    if decision == "Approved":
        sub.status = "Approved"
    else:
        # Hold or Reject both reopen the submission so the PM can edit again
        sub.status = "Draft"
    s.add(sub)
    s.commit()
    return review_view(s, project_id)


def recognise(s: Session, project_id: int, payload: dict) -> dict:
    """Finance recognises & locks an approved submission for the period."""
    p = s.get(Project, project_id)
    if not p:
        return {}
    period = current_period(s)
    label = period.label if period else ""
    sub = s.exec(
        select(Submission)
        .where(Submission.project_id == p.id, Submission.period_label == label)
    ).first()
    if not sub or sub.status != "Approved":
        return {"error": "Only a PD-approved submission can be recognised & locked."}
    sub.status = "Locked"
    s.add(sub)
    s.commit()
    return project_detail(s, project_id)


# ---------------------------------------------------------------------------
# create project (baseline wizard)
# ---------------------------------------------------------------------------
def create_project(s: Session, payload: dict) -> dict:
    lines = []
    for r in payload.get("resources", []):
        rtype = r.get("type", calc.OWN)
        if rtype == calc.SUBCON:
            lines.append(EffortLine(
                project_id=0, module=r.get("module", ""),
                resource_line=r.get("name", ""), resource_type=calc.SUBCON,
                vendor=r.get("vendor", ""),
                recognition_basis=r.get("recognitionBasis", ""),
                completion_window=r.get("completionWindow", ""),
                subcon_fixed_price=float(r.get("fixedPrice", 0) or 0),
                completion_pct=0.0,
            ))
        else:
            days = float(r.get("totalMd", 0) or 0)
            monthly = r.get("monthly", []) or []
            lines.append(EffortLine(
                project_id=0, module=r.get("module", ""),
                resource_line=r.get("name", ""), resource_type=rtype,
                grade_level=r.get("grade", ""), rate=float(r.get("rate", 0) or 0),
                baseline_days=days, actual_days=0.0, etc_days=days,
                baseline_monthly=json.dumps(monthly),
            ))
    tcv = float(payload.get("contractValue", 0) or 0)
    pr = calc.project_calc(tcv, _calc_inputs(lines))

    pm_id = payload.get("pmUserId")
    proj = Project(
        code=payload.get("code") or f"PRJ-{int(_utcnow().timestamp())}",
        name=payload.get("name", "Untitled Project"),
        customer=payload.get("customer", ""),
        business_unit=payload.get("businessUnit", ""),
        description=payload.get("description", ""),
        tcv=tcv,
        financial_year=payload.get("financialYear", "FY2025"),
        duration_months=int(payload.get("durationMonths", 12) or 12),
        start_date=payload.get("startDate", ""),
        planned_end_date=payload.get("plannedEndDate", ""),
        status="On Track",
        pm_user_id=pm_id,
        pd_user_id=payload.get("pdUserId"),
        baseline_cost=pr.baseline_cost,
        sold_margin_pct=pr.sold_margin_pct,
        committed_poc=0.0,
        snap_prior_ytd=0.0,
        has_detail=True,
    )
    s.add(proj)
    s.commit()
    for l in lines:
        l.project_id = proj.id
        s.add(l)
    s.commit()
    return {"id": proj.id, "code": proj.code, "name": proj.name}
