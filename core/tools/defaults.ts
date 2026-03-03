// core/tools/defaults.ts
export const DEFAULT_EXCLUDES = [
  ".git",
  "node_modules",
  "dist",
  "build",
  "out",
  "coverage",
  ".cache",
  ".tmp",
  ".next",
  ".turbo",
  ".vite",
  ".pnpm-store"
];

export const DEFAULT_TEXT_EXTS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".css",
  ".scss",
  ".html",
  ".yml",
  ".yaml",
  ".toml",
  ".txt"
];

export const MAX_READ_BYTES_DEFAULT = 300_000; // ~300 KB safety limit
