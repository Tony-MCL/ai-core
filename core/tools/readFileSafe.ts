// core/tools/readFileSafe.ts
import fs from "node:fs/promises";
import path from "node:path";
import { MAX_READ_BYTES_DEFAULT } from "./defaults";

export type ReadFileSafeOptions = {
  rootDir: string;
  relPath: string;
  maxBytes?: number;
};

export type ReadFileSafeResult = {
  relPath: string;
  absPath: string;
  bytes: number;
  truncated: boolean;
  content: string;
};

function normalizeRel(rel: string) {
  return rel.replace(/\\/g, "/").replace(/^(\.\/)+/, "");
}

export async function readFileSafe(opts: ReadFileSafeOptions): Promise<ReadFileSafeResult> {
  const rootDir = opts.rootDir;
  const relPath = normalizeRel(opts.relPath);
  const absPath = path.resolve(rootDir, relPath);

  // Guard: file must stay within rootDir
  const relCheck = path.relative(rootDir, absPath);
  if (relCheck.startsWith("..") || path.isAbsolute(relCheck)) {
    throw new Error(`Refusing to read outside workspace: ${opts.relPath}`);
  }

  const maxBytes = opts.maxBytes ?? MAX_READ_BYTES_DEFAULT;
  const buf = await fs.readFile(absPath);
  const truncated = buf.byteLength > maxBytes;
  const slice = truncated ? buf.subarray(0, maxBytes) : buf;

  return {
    relPath,
    absPath,
    bytes: slice.byteLength,
    truncated,
    content: slice.toString("utf8")
  };
}
