import * as ts from "typescript";
import * as path from "path";

/**
 * Type-check a TypeScript file using the TypeScript compiler API.
 *
 * Reports type errors to stderr. In strict mode (--typecheck flag),
 * exits with code 1 on type errors. In normal mode, just reports warnings.
 *
 * @param filePath Path to the TypeScript file to check
 * @param strict Whether to exit on type errors (true = strict mode)
 *
 * @example
 * ```typescript
 * // Report warnings only
 * typecheck("app.ts", false);
 *
 * // Exit on errors
 * typecheck("app.ts", true);
 * ```
 */
export function typecheck(filePath: string, strict: boolean = false): void {
  const cwd = process.cwd();
  const absolutePath = path.resolve(cwd, filePath);
  const configPath = ts.findConfigFile(cwd, ts.sys.fileExists, "tsconfig.json");

  let compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ["es2022"],
    strict: true,
    skipLibCheck: true,
  };

  let rootNames = [absolutePath];

  if (configPath) {
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(configPath)
    );
    compilerOptions = { ...compilerOptions, ...parsedConfig.options };
    // Only include the target file, not all files from tsconfig
    rootNames = [absolutePath];
  }

  const program = ts.createProgram(rootNames, compilerOptions);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  if (diagnostics.length === 0) {
    if (strict) {
      console.log(`✓ No type errors in ${filePath}`);
    }
    return;
  }

  let hasError = false;
  for (const diagnostic of diagnostics) {
    if (
      diagnostic.file &&
      (diagnostic.file.fileName.endsWith(".ts") ||
        diagnostic.file.fileName.endsWith(".tsx"))
    ) {
      hasError = true;
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start || 0
      );
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.error(
        `${diagnostic.file.fileName}:${line + 1}:${character + 1} - error TS${diagnostic.code}: ${message}`
      );
    }
  }

  if (hasError && strict) {
    process.exit(1);
  }
}
