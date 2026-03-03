// agent-cli/index.ts
import process from "node:process";
import path from "node:path";

import { indexRepo } from "../core/tools/indexRepo";
import { searchRepo } from "../core/tools/searchRepo";
import { readFileSafe } from "../core/tools/readFileSafe";
import { runVerify } from "../core/tools/runVerify";

type Command =
  | "help"
  | "version"
  | "doctor"
  | "index"
  | "search"
  | "read"
  | "verify";

const VERSION = "0.0.1";

function printHelp() {
  console.log(`
ai-core (MCL) — CLI scaffold (repo-aware tools)

Usage:
  npm run ai -- <command> [args]

Commands:
  help
  version
  doctor
  index                Create .cache/repo-map.json (repo map)
  search <query>       Search in repo (rg if available, otherwise fallback)
  read <path>          Read a file safely (size-limited)
  verify               Run build/typecheck verification if possible

Examples:
  npm run ai -- index
  npm run ai -- search "themePacks"
  npm run ai -- read src/app/App.tsx
  npm run ai -- verify
`.trim());
}

function cmdFromArgs(args: string[]): Command {
  const raw = (args[0] ?? "help").toLowerCase();
  if (raw === "--help" || raw === "-h") return "help";
  if (raw === "--version" || raw === "-v") return "version";
  if (raw === "help") return "help";
  if (raw === "version") return "version";
  if (raw === "doctor") return "doctor";
  if (raw === "index") return "index";
  if (raw === "search") return "search";
  if (raw === "read") return "read";
  if (raw === "verify") return "verify";
  return "help";
}

function doctor() {
  console.log("ai-core doctor");
  console.log(`- version: ${VERSION}`);
  console.log(`- node: ${process.version}`);
  console.log(`- platform: ${process.platform} ${process.arch}`);
  console.log(`- cwd: ${process.cwd()}`);
  console.log("");
  console.log("Tools available: index, search, read, verify");
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = cmdFromArgs(args);

  const rootDir = process.cwd();

  switch (cmd) {
    case "help":
      printHelp();
      return;
    case "version":
      console.log(VERSION);
      return;
    case "doctor":
      doctor();
      return;

    case "index": {
      const idx = await indexRepo({ rootDir });
      console.log(`Indexed ${idx.fileCount} files`);
      console.log(`Wrote: ${path.join(rootDir, ".cache", "repo-map.json")}`);
      return;
    }

    case "search": {
      const query = args[1];
      if (!query) {
        console.error("Missing query. Usage: npm run ai -- search <query>");
        process.exitCode = 2;
        return;
      }
      const { engine, hits } = await searchRepo({ rootDir, query, maxHits: 50 });
      console.log(`engine: ${engine}`);
      console.log(`hits: ${hits.length}`);
      for (const h of hits) {
        console.log(`${h.file}:${h.line}: ${h.text}`);
      }
      return;
    }

    case "read": {
      const relPath = args[1];
      if (!relPath) {
        console.error("Missing path. Usage: npm run ai -- read <path>");
        process.exitCode = 2;
        return;
      }
      const r = await readFileSafe({ rootDir, relPath });
      console.log(`file: ${r.relPath}`);
      console.log(`bytes: ${r.bytes}${r.truncated ? " (truncated)" : ""}`);
      console.log("----");
      console.log(r.content);
      return;
    }

    case "verify": {
      const res = await runVerify(rootDir);
      if (res.ok) {
        console.log(`OK: ${res.command}`);
      } else {
        console.error(`FAIL: ${res.command} (exit ${res.exitCode})`);
        process.exitCode = 1;
      }
      return;
    }

    default:
      printHelp();
      return;
  }
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exitCode = 1;
});
