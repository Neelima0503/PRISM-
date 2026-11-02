# Node Description Batch 5 of 5

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

- "pages_projectdetail_trendtooltip": "TrendTooltip()" | kind=code-symbol | source=frontend/src/pages/ProjectDetail.tsx:L46 | neighbors=[ProjectDetail.tsx]
- "src_api_baseline": "Baseline" | kind=code-symbol | source=frontend/src/api.ts:L157 | neighbors=[api.ts]
- "src_api_exception": "Exception" | kind=code-symbol | source=frontend/src/api.ts:L85 | neighbors=[api.ts]
- "src_api_portfolio": "Portfolio" | kind=code-symbol | source=frontend/src/api.ts:L45 | neighbors=[api.ts]
- "src_api_req": "req()" | kind=code-symbol | source=frontend/src/api.ts:L3 | neighbors=[api.ts]
- "src_auth_authctx": "AuthCtx" | kind=code-symbol | source=frontend/src/auth.tsx:L7 | neighbors=[auth.tsx]
- "src_auth_ctx": "Ctx" | kind=code-symbol | source=frontend/src/auth.tsx:L14 | neighbors=[auth.tsx]
- "src_main_app": "App()" | kind=code-symbol | source=frontend/src/main.tsx:L30 | neighbors=[main.tsx]
- "src_main_requireapprover": "RequireApprover()" | kind=code-symbol | source=frontend/src/main.tsx:L23 | neighbors=[main.tsx]
- "src_main_requireauth": "RequireAuth()" | kind=code-symbol | source=frontend/src/main.tsx:L16 | neighbors=[main.tsx]
- "app_init": "__init__.py" | kind=code-symbol | source=backend/app/__init__.py:L1
- "frontend_vite_config": "vite.config.ts" | kind=code-symbol | source=frontend/vite.config.ts:L1
- "src_vite_env_d": "vite-env.d.ts" | kind=code-symbol | source=frontend/src/vite-env.d.ts:L1

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: c:\PRISM_code\.graphify\description-instructions\batch-004.json

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
