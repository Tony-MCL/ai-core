# ai-core (Morning Coffee Labs)

Local-first AI agent core with:
- strict tool-driven workflow (no “context dump”)
- patch-only code changes with explicit apply
- repo-scoped access + global learning (patterns/playbooks)
- roles (Petey first)

## Status
Bootstrapping repo structure + contracts + MVP spec.

## Goals
- Build a local agent CLI first
- Add VS Code extension UI later (side panel + diff + apply)

## Key principles
- Workspace-only file access
- Always read before change
- Patch-only changes (unified diff)
- Verify via build/typecheck when configured
- Repo memory overrides global memory
