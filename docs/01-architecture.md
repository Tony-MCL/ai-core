# Architecture

## Layers

1) Agent Core (generic)
- model runner (local)
- tool runtime (file/search/patch/shell)
- retrieval/indexing (repo map + embeddings optional)
- memory (repo + global)
- policy/guardrails enforcement

2) Roles (specialized)
- system prompt + constraints
- tool allowlist
- default workflows

3) UI / Clients
- CLI (v1)
- VS Code extension (v2) calling a local agent server

## Key design choices
- Tool-driven agent: never load entire repo into context
- Patch-only code edits: unified diff + explicit apply
- Workspace-only access by default
- Deterministic verification loop (tsc/build/test)
