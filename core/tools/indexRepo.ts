// core/tools/indexRepo.ts
import fs from "node:fs/promises";
import path from "node:path";
import { DEFAULT_EXCLUDES, DEFAULT_TEXT_EXTS } from "./defaults";
import { walkFiles } from "./fsWalk";

export type RepoIndex = {
  rootDir: string;
  createdAt: string;
  excludes: string[];
  exts: string[];
  fileCount: number;
  files: string[];
};

export type IndexRepoOptions = {
  rootDir: string;
  outFile?: string;          // default: .cache/repo-map.json
  excludes?: string[];
  exts?: string[];
  maxFiles?: number;
};

export async function indexRepo(opts: IndexRepoOptions): Promise<RepoIndex> {
  const rootDir = opts.rootDir;
  const excludes = opts.excludes ?? DEFAULT_EXCLUDES;
  const exts = opts.exts ?? DEFAULT_TEXT_EXTS;

  const files = await walkFiles({
    rootDir,
    excludes,
    exts,
    maxFiles: opts.maxFiles ?? 50_000
  });

  const idx: RepoIndex = {
    rootDir,
    createdAt: new Date().toISOString(),
    excludes,
    exts,
    fileCount: files.length,
    files
  };

  const outFile = opts.outFile ?? path.join(rootDir, ".cache", "repo-map.json");
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(idx, null, 2), "utf8");

  return idx;
}
