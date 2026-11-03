"""PRISM FastAPI application entry point.

Run:
    cd backend && .venv/Scripts/python.exe -m uvicorn app.main:app --port 8000 --reload
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select

from .api import router
from .db import ENGINE, init_db
from .models import Project

app = FastAPI(title="PRISM", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
def _startup() -> None:
    init_db()
    # Auto-seed on first run (empty DB).
    from sqlmodel import Session
    with Session(ENGINE) as s:
        if not s.exec(select(Project)).first():
            from .seed import seed
            seed()


@app.get("/api/health")
def health():
    return {"status": "ok"}
