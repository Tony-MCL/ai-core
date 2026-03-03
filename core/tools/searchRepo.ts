// core/tools/searchRepo.ts
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { DEFAULT_EXCLUDES, DEFAULT_TEXT_EXTS } from "./defaults";
import { walkFiles } from "./fsWalk";

export type SearchHit = {
  file: string;
  line: number;
  text: string;
};

export type SearchOptions = {
  rootDir: string;
  query: string;
  maxHits?: number;
  excludes?: string[];
  exts?: string[];
};

async function hasRipgrep(): Promise<boolean> {
  return new Promise((resolve) => {
    const p = spawn("rg", ["--version"], { stdio: "ignore" });
    p.on("error", () => resolve(false));
    p.on("exit", (code) => resolve(code === 0));
  });
}

async function searchWithRg(opts: SearchOptions): Promise<SearchHit[]> {
  const { rootDir, query } = opts;
  const maxHits = opts.maxHits ?? 50;
  const excludes = opts.excludes ?? DEFAULT_EXCLUDES;

  // rg command:
  // --no-heading --line-number
  // --max-count maxHits (max per file, but good enough for MVP)
  const args = [
    "--no-heading",
    "--line-number",
    "--fixed-strings",
    "--max-count",
    String(maxHits)
  ];

  for (const ex of excludes) {
    args.push("--glob", `!**/${ex}/**`);
  }

  // Restrict to typical text files
  const exts = (opts.exts ?? DEFAULT_TEXT_EXTS).map((e) => e.replace(/^\./, ""));
  for (const ext of exts) {
    args.push("--type-add", `mcl:${ext}`);
  }
  args.push("--type", "mcl");

  args.push(query);
  args.push(".");

  const hits: SearchHit[] = [];

  await new Promise<void>((resolve, reject) => {
    const p = spawn("rg", args, { cwd: rootDir });

    let stdout = "";
    let stderr = "";

    p.stdout.on("data", (d) => (stdout += d.toString("utf8")));
    p.stderr.on("data", (d) => (stderr += d.toString("utf8")));

    p.on("error", reject);
    p.on("close", (code) => {
      if (code !== 0 && stdout.trim().length === 0) {
        // rg returns 1 when no matches; treat as ok
        if (code === 1) return resolve();
        return reject(new Error(stderr || `rg exited with code ${code}`));
      }

      const lines = stdout.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        // format: file:line:text
        const first = line.indexOf(":");
        const second = line.indexOf(":", first + 1);
        if (first < 0 || second < 0) continue;
        const file = line.slice(0, first);
        const lineNoStr = line.slice(first + 1, second);
        const text = line.slice(second + 1);
        const lineNo = Number(lineNoStr);
        if (!Number.isFinite(lineNo)) continue;

        hits.push({ file, line: lineNo, text });
        if (hits.length >= maxHits) break;
      }

      resolve();
    });
  });

  return hits.slice(0, maxHits);
}

async function searchFallback(opts: SearchOptions): Promise<SearchHit[]> {
  const { rootDir, query } = opts;
  const maxHits = opts.maxHits ?? 50;
  const excludes = opts.excludes ?? DEFAULT_EXCLUDES;
  const exts = opts.exts ?? DEFAULT_TEXT_EXTS;

  const files = await walkFiles({ rootDir, excludes, exts, maxFiles: 50_000 });
  const hits: SearchHit[] = [];

  for (const rel of files) {
    const abs = path.join(rootDir, rel);
    let content = "";
    try {
      content = await fs.readFile(abs, "utf8");
    } catch {
      continue;
    }

    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(query)) {
        hits.push({ file: rel, line: i + 1, text: lines[i] });
        if (hits.length >= maxHits) return hits;
      }
    }
  }

  return hits;
}

export async function searchRepo(opts: SearchOptions): Promise<{ engine: "rg" | "fallback"; hits: SearchHit[] }> {
  const useRg = await hasRipgrep();
  if (useRg) {
    const hits = await searchWithRg(opts);
    return { engine: "rg", hits };
  }
  const hits = await searchFallback(opts);
  return { engine: "fallback", hits };
}
