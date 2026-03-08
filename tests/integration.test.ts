import { describe, it, expect, beforeAll } from "vitest";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("integration", () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-run-integration-"));
  });

  it("should execute a real TypeScript file end-to-end", { timeout: 15000 }, () => {
    return new Promise<void>((resolve, reject) => {
      const tsFile = path.join(tmpDir, "real.ts");
      fs.writeFileSync(
        tsFile,
        'const numbers: number[] = [1, 2, 3, 4, 5];\nconst sum = numbers.reduce((a, b) => a + b, 0);\nconsole.log(sum);'
      );

      const child = spawn("node", ["bin/ts-run.js", tsFile], {
        cwd: "G:\\ts-run",
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      child.stdout.on("data", (data) => {
        output += data.toString();
      });

      child.on("close", (code) => {
        expect(code).toBe(0);
        expect(output.trim()).toBe("15");
        resolve();
      });

      child.on("error", reject);
    });
  });

  it("should handle async code with await", { timeout: 15000 }, () => {
    return new Promise<void>((resolve, reject) => {
      const tsFile = path.join(tmpDir, "async.ts");
      fs.writeFileSync(
        tsFile,
        'const wait = (ms: number) => new Promise(r => setTimeout(r, ms));\nasync function main() { await wait(10); console.log("done"); }\nmain();'
      );

      const child = spawn("node", ["bin/ts-run.js", tsFile], {
        cwd: "G:\\ts-run",
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      child.stdout.on("data", (data) => {
        output += data.toString();
      });

      child.on("close", (code) => {
        expect(code).toBe(0);
        expect(output.trim()).toBe("done");
        resolve();
      });

      child.on("error", reject);
    });
  });

  it("should detect type errors via --typecheck flag", () => {
    return new Promise<void>((resolve, reject) => {
      const tsFile = path.join(tmpDir, "bad-types.ts");
      fs.writeFileSync(
        tsFile,
        'const x: string = 42;\nconsole.log(x);'
      );

      const child = spawn("node", ["bin/ts-run.js", tsFile, "--typecheck"], {
        cwd: "G:\\ts-run",
        stdio: ["pipe", "pipe", "pipe"],
      });

      let errorOutput = "";
      child.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      child.on("close", (code) => {
        expect(code).toBe(1);
        expect(errorOutput).toContain("error TS");
        resolve();
      });

      child.on("error", reject);
    });
  });
});
