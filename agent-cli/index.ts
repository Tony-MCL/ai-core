// agent-cli/index.ts
// Minimal runnable CLI scaffold for ai-core.
// This is intentionally tiny: it proves the repo is buildable and gives us
// a place to hang commands like index/search/patch later.

import process from "node:process";

type Command =
  | "help"
  | "version"
  | "doctor";

const VERSION = "0.0.1";

function printHelp() {
  console.log(`
ai-core (MCL) — minimal CLI scaffold

Usage:
  npm run ai -- <command>

Commands:
  help        Show this help
  version     Print version
  doctor      Quick environment sanity check (node version, cwd)

Examples:
  npm run ai -- help
  npm run ai -- doctor
`.trim());
}

function cmdFromArgs(args: string[]): Command {
  const raw = (args[0] ?? "help").toLowerCase();
  if (raw === "--help" || raw === "-h") return "help";
  if (raw === "--version" || raw === "-v") return "version";
  if (raw === "help") return "help";
  if (raw === "version") return "version";
  if (raw === "doctor") return "doctor";
  return "help";
}

function doctor() {
  console.log("ai-core doctor");
  console.log(`- node: ${process.version}`);
  console.log(`- platform: ${process.platform} ${process.arch}`);
  console.log(`- cwd: ${process.cwd()}`);
  console.log("");
  console.log("Next: implement repo indexing + search + patch tools.");
}

function main() {
  const args = process.argv.slice(2);
  const cmd = cmdFromArgs(args);

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
    default:
      printHelp();
      return;
  }
}

main();
