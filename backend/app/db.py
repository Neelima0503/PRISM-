"""SQLite engine + session helpers."""
from __future__ import annotations

from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine

DB_PATH = Path(__file__).resolve().parent.parent / "prism.db"
ENGINE = create_engine(
    f"sqlite:///{DB_PATH}",
    echo=False,
    connect_args={"check_same_thread": False},
)


def init_db() -> None:
    # Import models so metadata is populated before create_all.
    from . import models  # noqa: F401

    SQLModel.metadata.create_all(ENGINE)


def get_session() -> Session:
    return Session(ENGINE)
