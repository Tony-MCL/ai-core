# Playbook: Add an i18n key safely

1) Locate i18n source of truth (dict files)
2) Add new key(s) in all supported languages (or define fallback policy)
3) Replace hardcoded string(s)
4) Search for other occurrences
5) Verify: typecheck/build
6) If UI has snapshots/tests, update them
