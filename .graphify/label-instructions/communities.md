# Community Labeling

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the community listing below
and write 2-5 word plain-language names for each.

## Language

Write every name in English (en). Do not switch languages.

## Communities

Community 0: ui.tsx, Button(, Card(, Chip(, CTile(, ErrorBox(, Field(, Input(, SectionTitle(, Select(, Spinner(, STATUS
Community 1: Approval, EffortLine, LedgerEntry, Period, Project, Submission, User, Deterministic demo seed for PRISM Phase-1.  Run directly to , main.py, health(, PRISM FastAPI application entry point.  Run:     cd backend , _startup(
Community 2: useAuth(, Layout.tsx, BellIcon(, GridIcon(, Layout(, Logo(, NAV, NavItem(, PlusIcon(, useAsync.ts, AsyncState, useAsync(
Community 3: submission_view(, service.py, _approval_for(, baseline_view(, _calc_inputs(, compute(, create_project(, current_period(, decide(, _ledger(, _line_view(, _lines(
Community 4: StatTile(, Portfolio.tsx, ChartIcon(, CheckIcon(, DollarIcon(, Metric(, Portfolio(, ProjectRow(, PulseIcon(, StackIcon(, api.ts, Baseline
Community 5: api.py, baseline(, create_project(, decide(, DecisionIn, LineUpdate, NewProject, NewResource, portfolio(, project_detail(, FastAPI route definitions for PRISM Phase-1., review(
Community 6: calc.py, exceptions_for(, line_calc(, LineInput, LineResult, project_calc(, project_health(, ProjectResult, PRISM pure calculation engine.  This module is the single so, Full project roll-up and the revenue chain.      ``prior_fro, RAG health from the computed result., Auto-generated QC exceptions for a project result.
Community 7: db.py, get_session(, init_db(, SQLite engine + session helpers.
Community 8: __init__.py
Community 9: vite.config.ts
Community 10: vite-env.d.ts

## Instructions

Write a single JSON object mapping each community id (as a string) to its
2-5 word name to: c:\PRISM_code\.graphify\label-instructions\communities.json

Example:
```json
{
  "0": "Authentication Flow",
  "1": "Authentication Flow",
  "2": "Authentication Flow"
}
```

Then re-run `graphify update` (or `graphify label`) to ingest the names.
