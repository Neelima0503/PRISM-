"""SQLModel entities for PRISM Phase-1.

This is the *scoped* slice of the full 20-entity model (see prism-data-model):
the tables the five Phase-1 screens actually read/write. Single-currency USD
this phase. Money is stored as float USD; percentages as 0..1 fractions.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


def _utcnow() -> datetime:
    # SQLModel/SQLAlchemy want tz-aware datetimes.
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    role: str  # PM | PD | Finance | Admin | ReadOnly
    email: str = ""


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str                       # e.g. PRJ-NORDWIND
    name: str
    customer: str = ""
    business_unit: str = ""
    description: str = ""
    tcv: float = 0.0                # total contract value (USD)
    financial_year: str = "FY2025"
    duration_months: int = 12
    start_date: str = ""            # ISO date string
    planned_end_date: str = ""
    status: str = "On Track"        # On Track | At Risk | Watch | Delayed
    pm_user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    pd_user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    # Derived-at-baseline snapshots (immutable reference):
    baseline_cost: float = 0.0
    sold_margin_pct: float = 0.0
    committed_poc: float = 0.0      # PD-committed POC for the period
    snap_prior_ytd: float = 0.0     # frozen prior-YTD revenue seed
    has_detail: bool = True
    created_at: datetime = Field(default_factory=_utcnow)


class EffortLine(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    module: str = ""
    resource_line: str = ""         # person / crew label
    resource_type: str = "Own_FTE"  # Own_FTE | Freelancer | Fixed_Subcon
    grade_level: str = ""           # L1..L7 / band
    rate: float = 0.0               # daily rate (Own / Freelancer)
    baseline_days: float = 0.0
    actual_days: float = 0.0
    etc_days: float = 0.0
    # Explicit cost overrides (reconciled seed data); None → derive from days x rate
    baseline_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    etc_cost: Optional[float] = None
    # Fixed_Subcon fields:
    vendor: str = ""
    recognition_basis: str = ""     # % Completion | Milestone | On Delivery
    completion_window: str = ""
    subcon_fixed_price: float = 0.0
    completion_pct: float = 0.0     # 0..1
    # Optional per-month breakdowns (JSON strings):
    baseline_monthly: str = ""      # [{"month": "...", "md": .., "rate": ..}]
    sched_json: str = ""            # [md, md, ...] one per month over the FY (actuals + forecast)


class Period(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    label: str                      # "Sep 2025"
    seq: int = 0                    # ordering
    status: str = "Not_Opened"      # Not_Opened | Open | Frozen


class LedgerEntry(SQLModel, table=True):
    """The frozen revenue ledger -- one immutable row per project per period."""

    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    period_label: str
    seq: int = 0
    cost_to_date: float = 0.0
    eac: float = 0.0
    poc: float = 0.0
    cumulative_revenue: float = 0.0
    prior_ytd: float = 0.0
    period_revenue: float = 0.0
    frozen: bool = True
    locked_by: str = ""
    locked_at: datetime = Field(default_factory=_utcnow)


class Submission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    period_label: str
    status: str = "Draft"           # Draft | Submitted | Approved | Locked
    eac: float = 0.0
    poc: float = 0.0
    period_revenue: float = 0.0
    cumulative_revenue: float = 0.0
    submitted_by: Optional[int] = Field(default=None, foreign_key="user.id")
    submitted_at: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=_utcnow)


class Approval(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    submission_id: int = Field(foreign_key="submission.id")
    decision: str = "Pending"       # Approved | Held | Rejected | Pending
    comments: str = ""
    approver_id: Optional[int] = Field(default=None, foreign_key="user.id")
    decided_at: Optional[datetime] = None
