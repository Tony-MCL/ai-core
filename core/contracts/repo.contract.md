# Repo Contract (Default)

These rules apply to any opened workspace unless the user overrides them:

- Access scope: current workspace only
- Must read a file before patching it
- Patch-only edits; no direct writes without apply step
- Prefer minimal diffs
- Verify after apply when verification is configured
- No guessing: use tools to retrieve needed info
