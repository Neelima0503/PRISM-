# Graph Report - .  (2026-10-21)

## Corpus Check
- Corpus is ~12,464 words - fits in a single context window. You may not need a graph.

## Summary
- 173 nodes · 384 edges · 8 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output
- Edge kinds: contains: 129 · imports: 87 · imports_from: 49 · calls: 47 · uses: 43 · rationale_for: 17 · inherits: 12


## Input Scope
- Requested: all
- Resolved: all (source: configured-default)
- Included files: 25 · Candidates: recursive
- Excluded: 0 untracked · 0 ignored · 0 sensitive · 0 missing committed
## God Nodes (most connected - your core abstractions)
1. `Project` - 9 edges
2. `LedgerEntry` - 9 edges
3. `submission_view()` - 9 edges
4. `useAuth()` - 9 edges
5. `User` - 8 edges
6. `EffortLine` - 8 edges
7. `Period` - 8 edges
8. `Submission` - 8 edges
9. `Approval` - 8 edges
10. `Deterministic demo seed for PRISM Phase-1.  Run directly to (re)seed:  PYTHONPAT` - 8 edges

## Surprising Connections (you probably didn't know these)
- `PRISM FastAPI application entry point.  Run:     cd backend && .venv/Scripts/pyt` --uses--> `Project`  [INFERRED]
  backend/app/main.py → backend/app/models.py
- `Deterministic demo seed for PRISM Phase-1.  Run directly to (re)seed:  PYTHONPAT` --uses--> `Approval`  [INFERRED]
  backend/app/seed.py → backend/app/models.py
- `Deterministic demo seed for PRISM Phase-1.  Run directly to (re)seed:  PYTHONPAT` --uses--> `EffortLine`  [INFERRED]
  backend/app/seed.py → backend/app/models.py
- `Deterministic demo seed for PRISM Phase-1.  Run directly to (re)seed:  PYTHONPAT` --uses--> `LedgerEntry`  [INFERRED]
  backend/app/seed.py → backend/app/models.py
- `Deterministic demo seed for PRISM Phase-1.  Run directly to (re)seed:  PYTHONPAT` --uses--> `Period`  [INFERRED]
  backend/app/seed.py → backend/app/models.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (25): Button(), Card(), CTile(), ErrorBox(), Field(), Input(), SectionTitle(), Select() (+17 more)

### Community 1 - "Community 1"
Cohesion: 0.21
Nodes (21): PRISM FastAPI application entry point.  Run:     cd backend && .venv/Scripts/pyt, Approval, EffortLine, LedgerEntry, Period, Project, SQLModel entities for PRISM Phase-1.  This is the *scoped* slice of the full 20-, The frozen revenue ledger -- one immutable row per project per period. (+13 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (10): Layout(), NAV, AsyncState, useAsync(), ROLE_HINT, User, AuthCtx, AuthProvider() (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.26
Nodes (20): _approval_for(), baseline_view(), _calc_inputs(), compute(), create_project(), current_period(), decide(), _ledger() (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (7): StatTile(), Baseline, Exception, Line, Portfolio, PortfolioCard, ProjectDetail

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (7): DecisionIn, LineUpdate, NewProject, NewResource, FastAPI route definitions for PRISM Phase-1., SubmissionIn, BaseModel

### Community 6 - "Community 6"
Cohesion: 0.18
Nodes (14): exceptions_for(), line_calc(), LineInput, LineResult, project_calc(), project_health(), ProjectResult, PRISM pure calculation engine.  This module is the single source of truth for th (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.50
Nodes (1): SQLite engine + session helpers.

## Knowledge Gaps
- **25 isolated node(s):** `FastAPI route definitions for PRISM Phase-1.`, `PRISM pure calculation engine.  This module is the single source of truth for th`, `One effort/resource line as fed to the engine.`, `Cost roll-up for a single resource line.`, `Full project roll-up and the revenue chain.      ``prior_frozen_ytd`` is the cum` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 7`** (1 nodes): `SQLite engine + session helpers.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Service layer: load entities, run the calc engine, shape API responses.` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `Community 2` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `Project` (e.g. with `PRISM FastAPI application entry point.  Run:     cd backend && .venv/Scripts/pyt` and `Deterministic demo seed for PRISM Phase-1.  Run directly to (re)seed:  PYTHONPAT`) actually correct?**
  _`Project` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `LedgerEntry` (e.g. with `Deterministic demo seed for PRISM Phase-1.  Run directly to (re)seed:  PYTHONPAT` and `Synthesise frozen Apr..Aug rows ramping cumulative revenue up to prior_ytd.`) actually correct?**
  _`LedgerEntry` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `FastAPI route definitions for PRISM Phase-1.`, `PRISM pure calculation engine.  This module is the single source of truth for th`, `One effort/resource line as fed to the engine.` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11074197120708748 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11594202898550725 - nodes in this community are weakly interconnected._