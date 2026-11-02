# Node Description Batch 2 of 5

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
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "components_ui_sectiontitle": "SectionTitle()" | kind=code-symbol | source=frontend/src/components/ui.tsx:L26 | neighbors=[ui.tsx, Baseline.tsx, NewProject.tsx, PdReview.tsx, PmSubmission.tsx, Portfolio.tsx]
- "components_ui_spinner": "Spinner()" | kind=code-symbol | source=frontend/src/components/ui.tsx:L299 | neighbors=[ui.tsx, Baseline.tsx, Login.tsx, PdReview.tsx, PmSubmission.tsx, Portfolio.tsx]
- "lib_format_money": "money()" | kind=code-symbol | source=frontend/src/lib/format.ts:L3 | neighbors=[format.ts, Baseline.tsx, NewProject.tsx, PdReview.tsx, PmSubmission.tsx, Portfolio.tsx]
- "lib_format_pct": "pct()" | kind=code-symbol | source=frontend/src/lib/format.ts:L21 | neighbors=[format.ts, Baseline.tsx, NewProject.tsx, PdReview.tsx, PmSubmission.tsx, Portfolio.tsx]
- "lib_useasync": "useAsync.ts" | kind=code-symbol | source=frontend/src/lib/useAsync.ts:L1 | neighbors=[AsyncState, useAsync(), Baseline.tsx, Login.tsx, NewProject.tsx, Portfolio.tsx]
- "app_seed": "seed.py" | kind=code-symbol | source=backend/app/seed.py:L1 | neighbors=[_calc_inputs(), _ledger_ramp(), _lines_for(), seed(), SQLModel, Deterministic demo seed for PRISM Phase…]
- "app_service_current_period": "current_period()" | kind=code-symbol | source=backend/app/service.py:L34 | neighbors=[service.py, decide(), portfolio(), project_detail(), save_submission(), submission_view()]
- "app_service_review_view": "review_view()" | kind=code-symbol | source=backend/app/service.py:L467 | neighbors=[service.py, decide(), _calc_inputs(), _lines(), _prior_ytd(), submission_view()]
- "components_ui_ctile": "CTile()" | kind=code-symbol | source=frontend/src/components/ui.tsx:L90 | neighbors=[ui.tsx, Baseline.tsx, NewProject.tsx, PdReview.tsx, PmSubmission.tsx, ProjectDetail.tsx]
- "components_ui_errorbox": "ErrorBox()" | kind=code-symbol | source=frontend/src/components/ui.tsx:L308 | neighbors=[ui.tsx, Baseline.tsx, PdReview.tsx, PmSubmission.tsx, Portfolio.tsx, ProjectDetail.tsx]
- "lib_useasync_useasync": "useAsync()" | kind=code-symbol | source=frontend/src/lib/useAsync.ts:L10 | neighbors=[useAsync.ts, Baseline.tsx, Login.tsx, NewProject.tsx, Portfolio.tsx, ProjectDetail.tsx]
- "app_calc_line_calc": "line_calc()" | kind=code-symbol | source=backend/app/calc.py:L64 | neighbors=[calc.py, LineResult, _round2(), project_calc(), Cost roll-up for a single resource line.]
- "app_calc_project_calc": "project_calc()" | kind=code-symbol | source=backend/app/calc.py:L124 | neighbors=[calc.py, line_calc(), ProjectResult, _round2(), Full project roll-up and the revenue ch…]
- "app_service_compute": "compute()" | kind=code-symbol | source=backend/app/service.py:L70 | neighbors=[service.py, _calc_inputs(), _lines(), _prior_ytd(), portfolio()]
- "app_service_portfolio": "portfolio()" | kind=code-symbol | source=backend/app/service.py:L104 | neighbors=[service.py, compute(), current_period(), _user(), _visible_projects()]
- "basemodel": "BaseModel" | kind=code-symbol | neighbors=[DecisionIn, LineUpdate, NewProject, NewResource, SubmissionIn]
- "components_ui_button": "Button()" | kind=code-symbol | source=frontend/src/components/ui.tsx:L230 | neighbors=[ui.tsx, NewProject.tsx, PdReview.tsx, PmSubmission.tsx, ProjectDetail.tsx]
- "components_ui_status": "STATUS" | kind=code-symbol | source=frontend/src/components/ui.tsx:L116 | neighbors=[ui.tsx, PdReview.tsx, PmSubmission.tsx, Portfolio.tsx, ProjectDetail.tsx]
- "lib_calcpreview": "calcPreview.ts" | kind=code-symbol | source=frontend/src/lib/calcPreview.ts:L1 | neighbors=[preview(), PreviewLine, PreviewResult, NewProject.tsx, PmSubmission.tsx]
- "app_db": "db.py" | kind=code-symbol | source=backend/app/db.py:L1 | neighbors=[get_session(), init_db(), SQLModel, SQLite engine + session helpers.]
- "app_main": "main.py" | kind=code-symbol | source=backend/app/main.py:L1 | neighbors=[health(), _startup(), SQLModel, PRISM FastAPI application entry point. …]
- "app_seed_seed": "seed()" | kind=code-symbol | source=backend/app/seed.py:L157 | neighbors=[seed.py, _calc_inputs(), _ledger_ramp(), _lines_for()]
- "app_service_baseline_view": "baseline_view()" | kind=code-symbol | source=backend/app/service.py:L332 | neighbors=[service.py, _calc_inputs(), _line_view(), _lines()]
- "app_service_decide": "decide()" | kind=code-symbol | source=backend/app/service.py:L481 | neighbors=[service.py, current_period(), review_view(), _utcnow()]
- "app_service_line_view": "_line_view()" | kind=code-symbol | source=backend/app/service.py:L160 | neighbors=[service.py, baseline_view(), project_detail(), submission_view()]
- "app_service_utcnow": "_utcnow()" | kind=code-symbol | source=backend/app/service.py:L27 | neighbors=[service.py, create_project(), decide(), save_submission()]
- "src_api_user": "User" | kind=code-symbol | source=frontend/src/api.ts:L21 | neighbors=[Login.tsx, NewProject.tsx, api.ts, auth.tsx]
- "app_calc_round2": "_round2()" | kind=code-symbol | source=backend/app/calc.py:L33 | neighbors=[calc.py, line_calc(), project_calc()]
- "app_seed_ledger_ramp": "_ledger_ramp()" | kind=code-symbol | source=backend/app/seed.py:L131 | neighbors=[seed.py, Synthesise frozen Apr..Aug rows ramping…, seed()]
- "app_service_approval_for": "_approval_for()" | kind=code-symbol | source=backend/app/service.py:L364 | neighbors=[service.py, _user(), submission_view()]
- "app_service_create_project": "create_project()" | kind=code-symbol | source=backend/app/service.py:L516 | neighbors=[service.py, _calc_inputs(), _utcnow()]
- "app_service_trend": "_trend()" | kind=code-symbol | source=backend/app/service.py:L299 | neighbors=[service.py, project_detail(), Cumulative effort trend Apr..Sep with l…]
- "app_service_user": "_user()" | kind=code-symbol | source=backend/app/service.py:L86 | neighbors=[service.py, _approval_for(), portfolio()]
- "components_ui_input": "Input()" | kind=code-symbol | source=frontend/src/components/ui.tsx:L265 | neighbors=[ui.tsx, NewProject.tsx, PmSubmission.tsx]
- "src_api_submission": "Submission" | kind=code-symbol | source=frontend/src/api.ts:L175 | neighbors=[PdReview.tsx, PmSubmission.tsx, api.ts]
- "app_api_decisionin": "DecisionIn" | kind=code-symbol | source=backend/app/api.py:L29 | neighbors=[api.py, BaseModel]
- "app_api_lineupdate": "LineUpdate" | kind=code-symbol | source=backend/app/api.py:L16 | neighbors=[api.py, BaseModel]
- "app_api_newproject": "NewProject" | kind=code-symbol | source=backend/app/api.py:L49 | neighbors=[api.py, BaseModel]
- "app_api_newresource": "NewResource" | kind=code-symbol | source=backend/app/api.py:L35 | neighbors=[api.py, BaseModel]
- "app_api_submissionin": "SubmissionIn" | kind=code-symbol | source=backend/app/api.py:L23 | neighbors=[api.py, BaseModel]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: c:\PRISM_code\.graphify\description-instructions\batch-001.json

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
