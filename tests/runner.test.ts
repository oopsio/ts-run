import { describe, it, expect, beforeAll, vi } from "vitest";
import { runFile } from "../src/runner";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("runner", () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-run-runner-"));
  });

  it("should execute a simple TypeScript file", async () => {
    const tsFile = path.join(tmpDir, "simple.ts");
    fs.writeFileSync(tsFile, 'console.log("test executed");');

    const consoleSpy = vi.spyOn(console, "log");
    await runFile({ filePath: tsFile });

    expect(consoleSpy).toHaveBeenCalledWith("test executed");
  });

  it("should execute file with variables", async () => {
    const tsFile = path.join(tmpDir, "vars.ts");
    fs.writeFileSync(tsFile, 'const x = 10;\nconst y = 20;\nconsole.log(x + y);');

    const consoleSpy = vi.spyOn(console, "log");
    await runFile({ filePath: tsFile });

    expect(consoleSpy).toHaveBeenCalledWith(30);
  });

  it("should execute file with function calls", async () => {
    const tsFile = path.join(tmpDir, "functions.ts");
    fs.writeFileSync(
      tsFile,
      'const greet = (name: string) => `Hello, ${name}`;\nconsole.log(greet("World"));'
    );

    const consoleSpy = vi.spyOn(console, "log");
    await runFile({ filePath: tsFile });

    expect(consoleSpy).toHaveBeenCalledWith("Hello, World");
  });

  it("should handle errors gracefully", async () => {
    const tsFile = path.join(tmpDir, "error.ts");
    fs.writeFileSync(tsFile, 'throw new Error("test error");');

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit called");
    });

    await expect(runFile({ filePath: tsFile })).rejects.toThrow();
    exitSpy.mockRestore();
  });

  it("should provide __dirname and __filename", async () => {
    const tsFile = path.join(tmpDir, "context.ts");
    fs.writeFileSync(
      tsFile,
      'console.log(typeof __dirname === "string");\nconsole.log(typeof __filename === "string");'
    );

    const consoleSpy = vi.spyOn(console, "log");
    await runFile({ filePath: tsFile });

    expect(consoleSpy).toHaveBeenCalledWith(true);
  });
});
