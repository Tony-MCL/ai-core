// core/tools/fsWalk.ts
import fs from "node:fs/promises";
import path from "node:path";

export type WalkOptions = {
  rootDir: string;
  excludes: string[];
  exts?: string[];       // if provided, only include files with these extensions
  maxFiles?: number;     // safety limit
};

function isExcluded(relPath: string, excludes: string[]) {
  // Excludes match on any path segment
  const parts = relPath.split(/[\\/]/g).filter(Boolean);
  return parts.some((p) => excludes.includes(p));
}

export async function walkFiles(opts: WalkOptions): Promise<string[]> {
  const { rootDir, excludes, exts, maxFiles = 50_000 } = opts;

  const out: string[] = [];
  const stack: string[] = [rootDir];

  while (stack.length > 0) {
    const dir = stack.pop()!;
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      const rel = path.relative(rootDir, full);

      if (isExcluded(rel, excludes)) continue;

      if (ent.isDirectory()) {
        stack.push(full);
        continue;
      }

      if (!ent.isFile()) continue;

      if (exts && exts.length > 0) {
        const ext = path.extname(ent.name).toLowerCase();
        if (!exts.includes(ext)) continue;
      }

      out.push(rel);

      if (out.length >= maxFiles) {
        return out;
      }
    }
  }

  return out;
}
