import { describe, it, expect, beforeAll } from "vitest";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("integration", () => {
  let tmpDir: string;
  // Use fileURLToPath style logic to find project root reliably
  const projectRoot = path.resolve(__dirname, "..");
  const binPath = path.join(projectRoot, "bin", "ts-run.js");

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-run-integration-"));
  });

  it("should execute a real TypeScript file end-to-end", { timeout: 30000 }, () => {
    return new Promise<void>((resolve, reject) => {
      const tsFile = path.join(tmpDir, "real.ts");
      fs.writeFileSync(
        tsFile,
        'const numbers: number[] = [1, 2, 3, 4, 5];\nconst sum = numbers.reduce((a, b) => a + b, 0);\nconsole.log(sum);'
      );

      // We run the bin file directly. 
      // If your package.json has "type": "module", Node should handle it.
      const child = spawn(process.execPath, [binPath, tsFile], {
        cwd: projectRoot,
        env: { ...process.env, NODE_ENV: "test" },
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      let errorOutput = "";

      child.stdout.on("data", (data) => (output += data.toString()));
      child.stderr.on("data", (data) => (errorOutput += data.toString()));

      child.on("close", (code) => {
        if (code !== 0) {
          return reject(new Error(`Process exited with code ${code}. Stderr: ${errorOutput}`));
        }
        expect(output.trim()).toBe("15");
        resolve();
      });

      child.on("error", reject);
    });
  });

  it("should handle async code with await", { timeout: 30000 }, () => {
    return new Promise<void>((resolve, reject) => {
      const tsFile = path.join(tmpDir, "async.ts");
      fs.writeFileSync(
        tsFile,
        'const wait = (ms: number) => new Promise(r => setTimeout(r, ms));\nasync function main() { await wait(10); console.log("done"); }\nmain();'
      );

      const child = spawn(process.execPath, [binPath, tsFile], {
        cwd: projectRoot,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      let errorOutput = "";

      child.stdout.on("data", (data) => (output += data.toString()));
      child.stderr.on("data", (data) => (errorOutput += data.toString()));

      child.on("close", (code) => {
        if (code !== 0) {
          return reject(new Error(`Process exited with code ${code}. Stderr: ${errorOutput}`));
        }
        expect(output.trim()).toBe("done");
        resolve();
      });

      child.on("error", reject);
    });
  });

  it("should detect type errors via --typecheck flag", { timeout: 30000 }, () => {
    return new Promise<void>((resolve, reject) => {
      const tsFile = path.join(tmpDir, "bad-types.ts");
      fs.writeFileSync(
        tsFile,
        'const x: string = 42;\nconsole.log(x);'
      );

      const child = spawn(process.execPath, [binPath, tsFile, "--typecheck"], {
        cwd: projectRoot,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let errorOutput = "";
      child.stderr.on("data", (data) => (errorOutput += data.toString()));

      child.on("close", (code) => {
        try {
          expect(code).toBe(1);
          expect(errorOutput).toContain("error TS");
          resolve();
        } catch (e) {
          reject(new Error(`Assertion failed. Code: ${code}, Stderr: ${errorOutput}`));
        }
      });

      child.on("error", reject);
    });
  });
});