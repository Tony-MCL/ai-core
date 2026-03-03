# Global Patterns (Draft)

This file is a curated library of reusable patterns across projects.

## Patch-only workflow
- Read relevant files first
- Propose minimal unified diff
- Apply only after approval
- Run verify, then iterate if needed

## i18n workflow (generic)
- Find existing i18n structure
- Add key(s) to dict/source of truth
- Replace hardcoded strings
- Verify build/typecheck
