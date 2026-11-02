# Node Description Batch 1 of 5

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the prompt below and write
your JSON answer to the answer file.

## Prompt

You are documenting nodes in a knowledge graph.
For each entry below, write ONE concise factual plain-language sentence
describing what it is or does. Use only the provided context.
For a code symbol (kind=code-symbol — a function, class, or constant),
describe what the function/symbol does based on its name, source location
and neighbors — e.g. "Resolves the configured ontology profile from graphify.yaml.".
For an entity node (any other kind — e.g. a person, place, event, object),
describe what the entity is and its role, grounded in its type, its
relations (neighbors) and the provided citations/evidence — e.g.
"Lady Carfax, a wealthy heiress who disappears en route to Lausanne.".
Ground entity descriptions in the citations/evidence when present; do not
speculate beyond the context, so a node with no supporting context may be
left out of the reply.
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "pages_newproject": "NewProject.tsx" | kind=code-symbol | source=frontend/src/pages/NewProject.tsx:L1 | neighbors=[ui.tsx, Button(), Card(), CTile(), Field(), Input()]
- "pages_portfolio": "Portfolio.tsx" | kind=code-symbol | source=frontend/src/pages/Portfolio.tsx:L1 | neighbors=[ui.tsx, Card(), ErrorBox(), SectionTitle(), Spinner(), StatTile()]
- "pages_projectdetail": "ProjectDetail.tsx" | kind=code-symbol | source=frontend/src/pages/ProjectDetail.tsx:L1 | neighbors=[ui.tsx, Button(), Card(), CTile(), ErrorBox(), SectionTitle()]
- "app_service": "service.py" | kind=code-symbol | source=backend/app/service.py:L1 | neighbors=[_approval_for(), baseline_view(), _calc_inputs(), compute(), create_project(), current_period()]
- "components_ui": "ui.tsx" | kind=code-symbol | source=frontend/src/components/ui.tsx:L1 | neighbors=[Button(), Card(), Chip(), CTile(), ErrorBox(), Field()]
- "pages_pmsubmission": "PmSubmission.tsx" | kind=code-symbol | source=frontend/src/pages/PmSubmission.tsx:L1 | neighbors=[ui.tsx, Button(), Card(), CTile(), ErrorBox(), Input()]
- "pages_pdreview": "PdReview.tsx" | kind=code-symbol | source=frontend/src/pages/PdReview.tsx:L1 | neighbors=[ui.tsx, Button(), Card(), CTile(), ErrorBox(), SectionTitle()]
- "src_api": "api.ts" | kind=code-symbol | source=frontend/src/api.ts:L1 | neighbors=[Baseline.tsx, Login.tsx, NewProject.tsx, PdReview.tsx, PmSubmission.tsx, Portfolio.tsx]
- "app_api": "api.py" | kind=code-symbol | source=backend/app/api.py:L1 | neighbors=[baseline(), create_project(), decide(), DecisionIn, LineUpdate, NewProject]
- "pages_baseline": "Baseline.tsx" | kind=code-symbol | source=frontend/src/pages/Baseline.tsx:L1 | neighbors=[ui.tsx, Card(), CTile(), ErrorBox(), SectionTitle(), Spinner()]
- "src_main": "main.tsx" | kind=code-symbol | source=frontend/src/main.tsx:L1 | neighbors=[Layout.tsx, Layout(), Baseline.tsx, Login.tsx, NewProject.tsx, PdReview.tsx]
- "src_auth": "auth.tsx" | kind=code-symbol | source=frontend/src/auth.tsx:L1 | neighbors=[Layout.tsx, Login.tsx, NewProject.tsx, PdReview.tsx, PmSubmission.tsx, Portfolio.tsx]
- "pages_login": "Login.tsx" | kind=code-symbol | source=frontend/src/pages/Login.tsx:L1 | neighbors=[ui.tsx, Spinner(), useAsync.ts, useAsync(), Login(), ROLE_HINT]
- "sqlmodel": "SQLModel" | kind=code-symbol | neighbors=[db.py, main.py, models.py, Approval, EffortLine, LedgerEntry]
- "lib_format": "format.ts" | kind=code-symbol | source=frontend/src/lib/format.ts:L1 | neighbors=[days(), k(), money(), pct(), signed(), Baseline.tsx]
- "app_models": "models.py" | kind=code-symbol | source=backend/app/models.py:L1 | neighbors=[Approval, EffortLine, LedgerEntry, Period, Project, Submission]
- "components_layout": "Layout.tsx" | kind=code-symbol | source=frontend/src/components/Layout.tsx:L1 | neighbors=[BellIcon(), GridIcon(), Layout(), Logo(), NAV, NavItem()]
- "app_calc": "calc.py" | kind=code-symbol | source=backend/app/calc.py:L1 | neighbors=[exceptions_for(), line_calc(), LineInput, LineResult, project_calc(), project_health()]
- "app_models_ledgerentry": "LedgerEntry" | kind=code-symbol | source=backend/app/models.py:L80 | neighbors=[models.py, SQLModel, The frozen revenue ledger -- one immuta…, Deterministic demo seed for PRISM Phase…, Synthesise frozen Apr..Aug rows ramping…, Service layer: load entities, run the c…]
- "app_models_project": "Project" | kind=code-symbol | source=backend/app/models.py:L27 | neighbors=[PRISM FastAPI application entry point. …, models.py, SQLModel, Deterministic demo seed for PRISM Phase…, Synthesise frozen Apr..Aug rows ramping…, Service layer: load entities, run the c…]
- "app_service_submission_view": "submission_view()" | kind=code-symbol | source=backend/app/service.py:L387 | neighbors=[service.py, review_view(), save_submission(), _approval_for(), _calc_inputs(), current_period()]
- "src_auth_useauth": "useAuth()" | kind=code-symbol | source=frontend/src/auth.tsx:L50 | neighbors=[Layout.tsx, Login.tsx, NewProject.tsx, PdReview.tsx, PmSubmission.tsx, Portfolio.tsx]
- "app_models_approval": "Approval" | kind=code-symbol | source=backend/app/models.py:L112 | neighbors=[models.py, SQLModel, Deterministic demo seed for PRISM Phase…, Synthesise frozen Apr..Aug rows ramping…, Service layer: load entities, run the c…, Cumulative effort trend Apr..Sep with l…]
- "app_models_effortline": "EffortLine" | kind=code-symbol | source=backend/app/models.py:L51 | neighbors=[models.py, SQLModel, Deterministic demo seed for PRISM Phase…, Synthesise frozen Apr..Aug rows ramping…, Service layer: load entities, run the c…, Cumulative effort trend Apr..Sep with l…]
- "app_models_period": "Period" | kind=code-symbol | source=backend/app/models.py:L73 | neighbors=[models.py, SQLModel, Deterministic demo seed for PRISM Phase…, Synthesise frozen Apr..Aug rows ramping…, Service layer: load entities, run the c…, Cumulative effort trend Apr..Sep with l…]
- "app_models_submission": "Submission" | kind=code-symbol | source=backend/app/models.py:L98 | neighbors=[models.py, SQLModel, Deterministic demo seed for PRISM Phase…, Synthesise frozen Apr..Aug rows ramping…, Service layer: load entities, run the c…, Cumulative effort trend Apr..Sep with l…]
- "app_models_user": "User" | kind=code-symbol | source=backend/app/models.py:L20 | neighbors=[models.py, SQLModel, Deterministic demo seed for PRISM Phase…, Synthesise frozen Apr..Aug rows ramping…, Service layer: load entities, run the c…, Cumulative effort trend Apr..Sep with l…]
- "app_seed_rationale_1": "Deterministic demo seed for PRISM Phase-1.  Run directly to (re)seed:  PYTHONPAT" | kind=entity | source=backend/app/seed.py:L1 | neighbors=[Approval, EffortLine, LedgerEntry, Period, Project, Submission]
- "app_seed_rationale_132": "Synthesise frozen Apr..Aug rows ramping cumulative revenue up to prior_ytd." | kind=entity | source=backend/app/seed.py:L132 | neighbors=[Approval, EffortLine, LedgerEntry, Period, Project, Submission]
- "app_service_calc_inputs": "_calc_inputs()" | kind=code-symbol | source=backend/app/service.py:L46 | neighbors=[service.py, baseline_view(), compute(), create_project(), project_detail(), review_view()]
- "app_service_project_detail": "project_detail()" | kind=code-symbol | source=backend/app/service.py:L203 | neighbors=[service.py, _calc_inputs(), current_period(), _ledger(), _line_view(), _lines()]
- "app_service_rationale_1": "Service layer: load entities, run the calc engine, shape API responses." | kind=entity | source=backend/app/service.py:L1 | neighbors=[Approval, EffortLine, LedgerEntry, Period, Project, Submission]
- "app_service_rationale_300": "Cumulative effort trend Apr..Sep with linear baseline-to-date + drift." | kind=entity | source=backend/app/service.py:L300 | neighbors=[Approval, EffortLine, LedgerEntry, Period, Project, Submission]
- "app_service_rationale_418": "Update actual/etc/completion on lines, then draft or submit." | kind=entity | source=backend/app/service.py:L418 | neighbors=[Approval, EffortLine, LedgerEntry, Period, Project, Submission]
- "app_service_rationale_59": "Latest frozen cumulative revenue; else the seeded snapshot." | kind=entity | source=backend/app/service.py:L59 | neighbors=[Approval, EffortLine, LedgerEntry, Period, Project, Submission]
- "app_service_save_submission": "save_submission()" | kind=code-symbol | source=backend/app/service.py:L417 | neighbors=[service.py, Update actual/etc/completion on lines, …, _calc_inputs(), current_period(), _lines(), _prior_ytd()]
- "src_api_api": "api" | kind=code-symbol | source=frontend/src/api.ts:L207 | neighbors=[Baseline.tsx, Login.tsx, NewProject.tsx, PdReview.tsx, PmSubmission.tsx, Portfolio.tsx]
- "app_service_lines": "_lines()" | kind=code-symbol | source=backend/app/service.py:L42 | neighbors=[service.py, baseline_view(), compute(), project_detail(), review_view(), save_submission()]
- "app_service_prior_ytd": "_prior_ytd()" | kind=code-symbol | source=backend/app/service.py:L58 | neighbors=[service.py, compute(), project_detail(), Latest frozen cumulative revenue; else …, review_view(), save_submission()]
- "components_ui_card": "Card()" | kind=code-symbol | source=frontend/src/components/ui.tsx:L6 | neighbors=[ui.tsx, Baseline.tsx, NewProject.tsx, PdReview.tsx, PmSubmission.tsx, Portfolio.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: c:\PRISM_code\.graphify\description-instructions\batch-000.json

Keep each description factual and concise (one sentence). No markdown, no prose
outside the JSON object. It is acceptable to omit a node if context is
insufficient — but include every node you can ground confidently.

Example answer format:
```json
{
  "node_id_1": "Resolves the configured ontology profile from graphify.yaml.",
  "node_id_2": "Colonel James Barclay, an antagonist in The Crooked Man."
}
```
