// core/tools/runVerify.ts
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

export type VerifyResult = {
  ok: boolean;
  command: string;
  exitCode: number | null;
};

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function runCmd(cwd: string, cmd: string, args: string[]): Promise<number | null> {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
    p.on("close", (code) => resolve(code));
    p.on("error", () => resolve(null));
  });
}

export async function runVerify(rootDir: string): Promise<VerifyResult> {
  const pkgPath = path.join(rootDir, "package.json");
  const hasPkg = await fileExists(pkgPath);

  if (hasPkg) {
    try {
      const raw = await fs.readFile(pkgPath, "utf8");
      const pkg = JSON.parse(raw) as { scripts?: Record<string, string> };
      const scripts = pkg.scripts ?? {};
      if (scripts["build"]) {
        const code = await runCmd(rootDir, "npm", ["run", "build"]);
        return { ok: code === 0, command: "npm run build", exitCode: code };
      }
      if (scripts["test"]) {
        const code = await runCmd(rootDir, "npm", ["run", "test"]);
        return { ok: code === 0, command: "npm run test", exitCode: code };
      }
    } catch {
      // fall through
    }
  }

  // Fallback: try tsc -b if tsconfig exists
  const tsconfig = path.join(rootDir, "tsconfig.json");
  if (await fileExists(tsconfig)) {
    const code = await runCmd(rootDir, "npx", ["tsc", "-b"]);
    return { ok: code === 0, command: "npx tsc -b", exitCode: code };
  }

  return { ok: true, command: "(no verify configured)", exitCode: 0 };
}
