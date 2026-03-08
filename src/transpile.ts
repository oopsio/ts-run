import { transformSync } from "@swc/core";
import * as fs from "fs";

/**
 * Options for TypeScript transpilation.
 */
export interface TranspileOptions {
  enableJsx?: boolean;
}

/**
 * Transpile a TypeScript file to JavaScript using SWC.
 *
 * Handles:
 * - Type annotation removal
 * - JSX transformation (with preact automatic runtime)
 * - Decorator support
 * - ES module output
 *
 * @param filePath Path to the TypeScript file
 * @param options Transpilation options
 * @returns Transpiled JavaScript code as a string
 *
 * @example
 * ```typescript
 * const code = transpileFile("app.ts");
 * ```
 */
export function transpileFile(
  filePath: string,
  options: TranspileOptions = {}
): string {
  const source = fs.readFileSync(filePath, "utf-8");
  const isTypeScript = filePath.endsWith(".ts") || filePath.endsWith(".tsx");
  const isTsx = filePath.endsWith(".tsx");

  const parserConfig: any = isTypeScript
    ? {
        syntax: "typescript",
        tsx: isTsx || options.enableJsx,
        decorators: true,
      }
    : {
        syntax: "ecmascript",
        jsx: options.enableJsx || false,
      };

  const result = transformSync(source, {
    filename: filePath,
    jsc: {
      parser: parserConfig,
      transform: {
        react: {
          runtime: "automatic",
          importSource: "preact",
        },
      },
    },
    module: {
      type: "es6",
    },
  });

  return result.code;
}
