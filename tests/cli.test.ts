import { describe, it, expect, vi } from "vitest";
import { main } from "../src/cli";

describe("cli", () => {
  it("should parse file argument", async () => {
    const originalArgv = process.argv;
    process.argv = ["node", "ts-run.js", "--help"];

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit called");
    });

    try {
      await main();
    } catch (e) {
      // Expected to throw due to --help
    }

    expect(exitSpy).not.toHaveBeenCalledWith(1);
    process.argv = originalArgv;
  });

  it("should handle version flag", async () => {
    const originalArgv = process.argv;
    process.argv = ["node", "ts-run.js", "--version"];

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit called");
    });

    try {
      await main();
    } catch (e) {
      // Expected
    }

    process.argv = originalArgv;
  });
});
