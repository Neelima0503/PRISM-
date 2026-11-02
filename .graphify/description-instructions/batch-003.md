# Node Description Batch 4 of 5

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
LANGUAGE: each entry has a `lang=` marker giving the language of its source.
Write that entry's description in EXACTLY that language. Do not translate to
a single common language — match each node's source language individually.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "app_db_rationale_1": "SQLite engine + session helpers." | kind=entity | source=backend/app/db.py:L1 | neighbors=[db.py] | lang=en
- "app_main_health": "health()" | kind=code-symbol | source=backend/app/main.py:L40 | neighbors=[main.py] | lang=en
- "app_main_startup": "_startup()" | kind=code-symbol | source=backend/app/main.py:L29 | neighbors=[main.py] | lang=en
- "app_models_rationale_1": "SQLModel entities for PRISM Phase-1.  This is the *scoped* slice of the full 20-" | kind=entity | source=backend/app/models.py:L1 | neighbors=[models.py] | lang=en
- "app_models_rationale_81": "The frozen revenue ledger -- one immutable row per project per period." | kind=entity | source=backend/app/models.py:L81 | neighbors=[LedgerEntry] | lang=it
- "app_models_utcnow": "_utcnow()" | kind=code-symbol | source=backend/app/models.py:L15 | neighbors=[models.py] | lang=en
- "app_service_list_users": "list_users()" | kind=code-symbol | source=backend/app/service.py:L79 | neighbors=[service.py] | lang=en
- "components_layout_bellicon": "BellIcon()" | kind=code-symbol | source=frontend/src/components/Layout.tsx:L146 | neighbors=[Layout.tsx] | lang=en
- "components_layout_gridicon": "GridIcon()" | kind=code-symbol | source=frontend/src/components/Layout.tsx:L129 | neighbors=[Layout.tsx] | lang=en
- "components_layout_logo": "Logo()" | kind=code-symbol | source=frontend/src/components/Layout.tsx:L5 | neighbors=[Layout.tsx] | lang=en
- "components_layout_nav": "NAV" | kind=code-symbol | source=frontend/src/components/Layout.tsx:L20 | neighbors=[Layout.tsx] | lang=en
- "components_layout_navitem": "NavItem()" | kind=code-symbol | source=frontend/src/components/Layout.tsx:L25 | neighbors=[Layout.tsx] | lang=en
- "components_layout_plusicon": "PlusIcon()" | kind=code-symbol | source=frontend/src/components/Layout.tsx:L139 | neighbors=[Layout.tsx] | lang=en
- "components_ui_chip": "Chip()" | kind=code-symbol | source=frontend/src/components/ui.tsx:L145 | neighbors=[ui.tsx] | lang=en
- "components_ui_tabs": "Tabs()" | kind=code-symbol | source=frontend/src/components/ui.tsx:L199 | neighbors=[ui.tsx] | lang=en
- "components_ui_tints": "TINTS" | kind=code-symbol | source=frontend/src/components/ui.tsx:L49 | neighbors=[ui.tsx] | lang=en
- "lib_calcpreview_previewline": "PreviewLine" | kind=code-symbol | source=frontend/src/lib/calcPreview.ts:L4 | neighbors=[calcPreview.ts] | lang=en
- "lib_calcpreview_previewresult": "PreviewResult" | kind=code-symbol | source=frontend/src/lib/calcPreview.ts:L14 | neighbors=[calcPreview.ts] | lang=en
- "lib_format_days": "days()" | kind=code-symbol | source=frontend/src/lib/format.ts:L25 | neighbors=[format.ts] | lang=en
- "lib_useasync_asyncstate": "AsyncState" | kind=code-symbol | source=frontend/src/lib/useAsync.ts:L3 | neighbors=[useAsync.ts] | lang=en
- "pages_baseline_baseline": "Baseline()" | kind=code-symbol | source=frontend/src/pages/Baseline.tsx:L7 | neighbors=[Baseline.tsx] | lang=en
- "pages_login_login": "Login()" | kind=code-symbol | source=frontend/src/pages/Login.tsx:L15 | neighbors=[Login.tsx] | lang=en
- "pages_login_role_hint": "ROLE_HINT" | kind=code-symbol | source=frontend/src/pages/Login.tsx:L8 | neighbors=[Login.tsx] | lang=en
- "pages_newproject_newproject": "NewProject()" | kind=code-symbol | source=frontend/src/pages/NewProject.tsx:L39 | neighbors=[NewProject.tsx] | lang=en
- "pages_newproject_resrow": "ResRow" | kind=code-symbol | source=frontend/src/pages/NewProject.tsx:L20 | neighbors=[NewProject.tsx] | lang=en
- "pages_newproject_steps": "STEPS" | kind=code-symbol | source=frontend/src/pages/NewProject.tsx:L37 | neighbors=[NewProject.tsx] | lang=en
- "pages_newproject_subrow": "SubRow" | kind=code-symbol | source=frontend/src/pages/NewProject.tsx:L28 | neighbors=[NewProject.tsx] | lang=en
- "pages_pdreview_pdreview": "PdReview()" | kind=code-symbol | source=frontend/src/pages/PdReview.tsx:L9 | neighbors=[PdReview.tsx] | lang=en
- "pages_pmsubmission_pmsubmission": "PmSubmission()" | kind=code-symbol | source=frontend/src/pages/PmSubmission.tsx:L10 | neighbors=[PmSubmission.tsx] | lang=en
- "pages_portfolio_charticon": "ChartIcon()" | kind=code-symbol | source=frontend/src/pages/Portfolio.tsx:L158 | neighbors=[Portfolio.tsx] | lang=en
- "pages_portfolio_checkicon": "CheckIcon()" | kind=code-symbol | source=frontend/src/pages/Portfolio.tsx:L151 | neighbors=[Portfolio.tsx] | lang=en
- "pages_portfolio_dollaricon": "DollarIcon()" | kind=code-symbol | source=frontend/src/pages/Portfolio.tsx:L137 | neighbors=[Portfolio.tsx] | lang=en
- "pages_portfolio_metric": "Metric()" | kind=code-symbol | source=frontend/src/pages/Portfolio.tsx:L9 | neighbors=[Portfolio.tsx] | lang=en
- "pages_portfolio_portfolio": "Portfolio()" | kind=code-symbol | source=frontend/src/pages/Portfolio.tsx:L66 | neighbors=[Portfolio.tsx] | lang=en
- "pages_portfolio_projectrow": "ProjectRow()" | kind=code-symbol | source=frontend/src/pages/Portfolio.tsx:L28 | neighbors=[Portfolio.tsx] | lang=en
- "pages_portfolio_pulseicon": "PulseIcon()" | kind=code-symbol | source=frontend/src/pages/Portfolio.tsx:L144 | neighbors=[Portfolio.tsx] | lang=en
- "pages_portfolio_stackicon": "StackIcon()" | kind=code-symbol | source=frontend/src/pages/Portfolio.tsx:L165 | neighbors=[Portfolio.tsx] | lang=en
- "pages_projectdetail_cat_color": "CAT_COLOR" | kind=code-symbol | source=frontend/src/pages/ProjectDetail.tsx:L23 | neighbors=[ProjectDetail.tsx] | lang=en
- "pages_projectdetail_exportexcel": "exportExcel()" | kind=code-symbol | source=frontend/src/pages/ProjectDetail.tsx:L29 | neighbors=[ProjectDetail.tsx] | lang=en
- "pages_projectdetail_projectdetail": "ProjectDetail()" | kind=code-symbol | source=frontend/src/pages/ProjectDetail.tsx:L61 | neighbors=[ProjectDetail.tsx] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: c:\PRISM_code\.graphify\description-instructions\batch-003.json

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
