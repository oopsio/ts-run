import { describe, it, expect, beforeAll, vi } from "vitest";
import { typecheck } from "../src/typecheck";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("typecheck", () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-run-typecheck-"));
  });

  it("should pass type checking for valid code", () => {
    const tsFile = path.join(tmpDir, "valid.ts");
    fs.writeFileSync(tsFile, 'const x: string = "hello";\nconsole.log(x);');

    expect(() => {
      typecheck(tsFile);
    }).not.toThrow();
  });

  it("should detect type errors in function calls", () => {
    const tsFile = path.join(tmpDir, "func-error.ts");
    fs.writeFileSync(
      tsFile,
      'const greet = (name: string): string => `Hello ${name}`;\ngreet(123);'
    );

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Pass true for strict mode to block on errors
    typecheck(tsFile, true);

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
