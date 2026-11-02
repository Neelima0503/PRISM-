# Node Description Batch 3 of 5

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

- "app_calc_exceptions_for": "exceptions_for()" | kind=code-symbol | source=backend/app/calc.py:L193 | neighbors=[calc.py, Auto-generated QC exceptions for a proj…]
- "app_calc_lineinput": "LineInput" | kind=code-symbol | source=backend/app/calc.py:L38 | neighbors=[calc.py, One effort/resource line as fed to the …]
- "app_calc_lineresult": "LineResult" | kind=code-symbol | source=backend/app/calc.py:L52 | neighbors=[calc.py, line_calc()]
- "app_calc_project_health": "project_health()" | kind=code-symbol | source=backend/app/calc.py:L182 | neighbors=[calc.py, RAG health from the computed result.]
- "app_calc_projectresult": "ProjectResult" | kind=code-symbol | source=backend/app/calc.py:L102 | neighbors=[calc.py, project_calc()]
- "app_main_rationale_1": "PRISM FastAPI application entry point.  Run:     cd backend && .venv/Scripts/pyt" | kind=entity | source=backend/app/main.py:L1 | neighbors=[main.py, Project]
- "app_seed_calc_inputs": "_calc_inputs()" | kind=code-symbol | source=backend/app/seed.py:L53 | neighbors=[seed.py, seed()]
- "app_seed_lines_for": "_lines_for()" | kind=code-symbol | source=backend/app/seed.py:L31 | neighbors=[seed.py, seed()]
- "app_service_ledger": "_ledger()" | kind=code-symbol | source=backend/app/service.py:L185 | neighbors=[service.py, project_detail()]
- "app_service_visible_projects": "_visible_projects()" | kind=code-symbol | source=backend/app/service.py:L93 | neighbors=[service.py, portfolio()]
- "components_layout_layout": "Layout()" | kind=code-symbol | source=frontend/src/components/Layout.tsx:L54 | neighbors=[Layout.tsx, main.tsx]
- "components_ui_field": "Field()" | kind=code-symbol | source=frontend/src/components/ui.tsx:L287 | neighbors=[ui.tsx, NewProject.tsx]
- "components_ui_select": "Select()" | kind=code-symbol | source=frontend/src/components/ui.tsx:L276 | neighbors=[ui.tsx, NewProject.tsx]
- "components_ui_stattile": "StatTile()" | kind=code-symbol | source=frontend/src/components/ui.tsx:L57 | neighbors=[ui.tsx, Portfolio.tsx]
- "components_ui_stepper": "Stepper()" | kind=code-symbol | source=frontend/src/components/ui.tsx:L160 | neighbors=[ui.tsx, NewProject.tsx]
- "lib_calcpreview_preview": "preview()" | kind=code-symbol | source=frontend/src/lib/calcPreview.ts:L28 | neighbors=[calcPreview.ts, NewProject.tsx]
- "lib_format_k": "k()" | kind=code-symbol | source=frontend/src/lib/format.ts:L17 | neighbors=[format.ts, ProjectDetail.tsx]
- "lib_format_signed": "signed()" | kind=code-symbol | source=frontend/src/lib/format.ts:L29 | neighbors=[format.ts, ProjectDetail.tsx]
- "src_api_line": "Line" | kind=code-symbol | source=frontend/src/api.ts:L62 | neighbors=[PmSubmission.tsx, api.ts]
- "src_api_portfoliocard": "PortfolioCard" | kind=code-symbol | source=frontend/src/api.ts:L28 | neighbors=[Portfolio.tsx, api.ts]
- "src_api_projectdetail": "ProjectDetail" | kind=code-symbol | source=frontend/src/api.ts:L91 | neighbors=[ProjectDetail.tsx, api.ts]
- "src_auth_authprovider": "AuthProvider()" | kind=code-symbol | source=frontend/src/auth.tsx:L21 | neighbors=[auth.tsx, main.tsx]
- "app_api_baseline": "baseline()" | kind=code-symbol | source=backend/app/api.py:L94 | neighbors=[api.py]
- "app_api_create_project": "create_project()" | kind=code-symbol | source=backend/app/api.py:L88 | neighbors=[api.py]
- "app_api_decide": "decide()" | kind=code-symbol | source=backend/app/api.py:L127 | neighbors=[api.py]
- "app_api_portfolio": "portfolio()" | kind=code-symbol | source=backend/app/api.py:L73 | neighbors=[api.py]
- "app_api_project_detail": "project_detail()" | kind=code-symbol | source=backend/app/api.py:L79 | neighbors=[api.py]
- "app_api_rationale_1": "FastAPI route definitions for PRISM Phase-1." | kind=entity | source=backend/app/api.py:L1 | neighbors=[api.py]
- "app_api_review": "review()" | kind=code-symbol | source=backend/app/api.py:L118 | neighbors=[api.py]
- "app_api_save_submission": "save_submission()" | kind=code-symbol | source=backend/app/api.py:L112 | neighbors=[api.py]
- "app_api_submission": "submission()" | kind=code-symbol | source=backend/app/api.py:L103 | neighbors=[api.py]
- "app_api_users": "users()" | kind=code-symbol | source=backend/app/api.py:L67 | neighbors=[api.py]
- "app_calc_rationale_1": "PRISM pure calculation engine.  This module is the single source of truth for th" | kind=entity | source=backend/app/calc.py:L1 | neighbors=[calc.py]
- "app_calc_rationale_129": "Full project roll-up and the revenue chain.      ``prior_frozen_ytd`` is the cum" | kind=entity | source=backend/app/calc.py:L129 | neighbors=[project_calc()]
- "app_calc_rationale_183": "RAG health from the computed result." | kind=entity | source=backend/app/calc.py:L183 | neighbors=[project_health()]
- "app_calc_rationale_194": "Auto-generated QC exceptions for a project result." | kind=entity | source=backend/app/calc.py:L194 | neighbors=[exceptions_for()]
- "app_calc_rationale_39": "One effort/resource line as fed to the engine." | kind=entity | source=backend/app/calc.py:L39 | neighbors=[LineInput]
- "app_calc_rationale_65": "Cost roll-up for a single resource line." | kind=entity | source=backend/app/calc.py:L65 | neighbors=[line_calc()]
- "app_db_get_session": "get_session()" | kind=code-symbol | source=backend/app/db.py:L23 | neighbors=[db.py]
- "app_db_init_db": "init_db()" | kind=code-symbol | source=backend/app/db.py:L16 | neighbors=[db.py]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: c:\PRISM_code\.graphify\description-instructions\batch-002.json

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
