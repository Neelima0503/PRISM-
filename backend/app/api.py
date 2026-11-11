"""FastAPI route definitions for PRISM Phase-1."""
from __future__ import annotations


from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from . import service
from .db import get_session

router = APIRouter(prefix="/api")


# ---- request models -------------------------------------------------------
class LineUpdate(BaseModel):
    id: int
    actualDays: Optional[float] = None
    etcDays: Optional[float] = None
    completionPct: Optional[float] = None
    sched: Optional[list[float]] = None


class SubmissionIn(BaseModel):
    userId: Optional[int] = None
    submit: bool = False
    lines: list[LineUpdate] = []


class DecisionIn(BaseModel):
    userId: Optional[int] = None
    decision: str = "Approved"  # Approved | Held | Rejected
    comments: str = ""


class MonthMd(BaseModel):
    month: str = ""
    md: float = 0.0


class NewResource(BaseModel):
    module: str = ""
    name: str = ""
    type: str = "Own_FTE"
    grade: str = ""
    rate: float = 0.0
    totalMd: float = 0.0
    monthly: list[MonthMd] = []
    # subcon
    vendor: str = ""
    recognitionBasis: str = ""
    completionWindow: str = ""
    fixedPrice: float = 0.0


class NewProject(BaseModel):
    code: str = ""
    name: str
    customer: str = ""
    businessUnit: str = ""
    description: str = ""
    contractValue: float = 0.0
    financialYear: str = "FY2025"
    durationMonths: int = 12
    startDate: str = ""
    plannedEndDate: str = ""
    pmUserId: Optional[int] = None
    pdUserId: Optional[int] = None
    resources: list[NewResource] = []


# ---- endpoints ------------------------------------------------------------
@router.get("/users")
def users():
    with get_session() as s:
        return service.list_users(s)


@router.get("/portfolio")
def portfolio(user_id: Optional[int] = None):
    with get_session() as s:
        return service.portfolio(s, user_id)


@router.get("/projects/{project_id}")
def project_detail(project_id: int):
    with get_session() as s:
        d = service.project_detail(s, project_id)
        if not d:
            raise HTTPException(404, "Project not found")
        return d


@router.post("/projects")
def create_project(body: NewProject):
    with get_session() as s:
        return service.create_project(s, body.model_dump())


@router.get("/projects/{project_id}/baseline")
def baseline(project_id: int):
    with get_session() as s:
        d = service.baseline_view(s, project_id)
        if not d:
            raise HTTPException(404, "Project not found")
        return d


@router.get("/projects/{project_id}/submission")
def submission(project_id: int):
    with get_session() as s:
        d = service.submission_view(s, project_id)
        if not d:
            raise HTTPException(404, "Project not found")
        return d


@router.post("/projects/{project_id}/submission")
def save_submission(project_id: int, body: SubmissionIn):
    with get_session() as s:
        return service.save_submission(s, project_id, body.model_dump())


@router.get("/projects/{project_id}/review")
def review(project_id: int):
    with get_session() as s:
        d = service.review_view(s, project_id)
        if not d:
            raise HTTPException(404, "Project not found")
        return d


@router.post("/projects/{project_id}/review")
def decide(project_id: int, body: DecisionIn):
    with get_session() as s:
        return service.decide(s, project_id, body.model_dump())


class RecogniseIn(BaseModel):
    userId: Optional[int] = None


@router.post("/projects/{project_id}/recognise")
def recognise(project_id: int, body: RecogniseIn):
    with get_session() as s:
        return service.recognise(s, project_id, body.model_dump())
