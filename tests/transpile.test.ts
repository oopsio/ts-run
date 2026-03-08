import { describe, it, expect, beforeAll } from "vitest";
import { transpileFile } from "../src/transpile";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("transpile", () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-run-test-"));
  });

  it("should transpile a simple TypeScript file", () => {
    const tsFile = path.join(tmpDir, "test.ts");
    fs.writeFileSync(tsFile, 'const x: string = "hello";\nconsole.log(x);');

    const result = transpileFile(tsFile);
    expect(result).toContain("console.log");
    expect(result).not.toContain(":");
  });

  it("should handle JSX syntax", () => {
    const tsxFile = path.join(tmpDir, "test.tsx");
    fs.writeFileSync(tsxFile, 'const App = () => <div>Hello</div>;\nexport default App;');

    const result = transpileFile(tsxFile, { enableJsx: true });
    expect(result).toContain("_jsx");
    expect(result).not.toContain("<div>");
    expect(result).toContain("export default App");
  });

  it("should preserve imports", () => {
    const tsFile = path.join(tmpDir, "test-import.ts");
    fs.writeFileSync(
      tsFile,
      'import { x } from "./module";\nconsole.log(x);'
    );

    const result = transpileFile(tsFile);
    expect(result).toContain("import");
    expect(result).toContain("./module");
  });

  it("should remove TypeScript type annotations", () => {
    const tsFile = path.join(tmpDir, "types.ts");
    fs.writeFileSync(
      tsFile,
      "const greet = (name: string): string => `Hello ${name}`;"
    );

    const result = transpileFile(tsFile);
    expect(result).not.toContain(": string");
    expect(result).toContain("greet");
    // SWC may transpile arrow to function, both are valid
    expect(/function|=>/.test(result)).toBe(true);
  });

  it("should handle decorators", () => {
    const tsFile = path.join(tmpDir, "decorators.ts");
    fs.writeFileSync(
      tsFile,
      "@deprecated\nclass MyClass {}\nexport default MyClass;"
    );

    const result = transpileFile(tsFile);
    expect(result).toBeDefined();
  });
});
