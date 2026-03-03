# Guardrails

Non-negotiable rules enforced by runtime (not just prompt):

1) Workspace-only access
- Agent can only access the currently opened repo/workspace
- No access to arbitrary disk paths unless explicitly allowed

2) Read before change
- A file must be read before a patch can target it

3) Patch-only edits
- Agent outputs unified diff patches
- Changes are applied only with explicit user approval

4) No file shortening / no “replacement files”
- Agent must not replace whole files unless explicitly requested
- Default is minimal diffs

5) Verify after apply (when configured)
- Run typecheck/build/test tasks and report status
- If verification fails: propose a follow-up patch

6) No guessing
- If information is missing, agent must use tools to retrieve it
