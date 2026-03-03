# Playbook: Safe refactor with minimal blast radius

1) Identify target module + dependency surface
2) Add types/tests before refactor if missing (when cheap)
3) Refactor in small patches
4) Verify after each patch
5) Update docs/decisions if a new pattern is introduced
