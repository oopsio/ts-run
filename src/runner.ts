import * as vm from "vm";
import * as path from "path";
import * as module from "module";
import { transpileFile } from "./transpile.js";
import { typecheck } from "./typecheck.js";
import { startWatch } from "./watch.js";

/**
 * Options for running a TypeScript file.
 */
export interface RunOptions {
  filePath: string;
  watch?: boolean;
  typecheck?: boolean;
}

/**
 * Run a TypeScript file.
 *
 * Transpiles the file using SWC, optionally type-checks it,
 * and executes it in a Node.js VM context.
 *
 * @param options Run options including file path and flags
 * @param options.filePath Path to the TypeScript file
 * @param options.watch Enable watch mode for auto-restart
 * @param options.typecheck Enable strict type checking (blocks on errors)
 *
 * @example
 * ```typescript
 * await runFile({ filePath: "app.ts", watch: true });
 * ```
 */
export async function runFile(options: RunOptions): Promise<void> {
  const { filePath, watch: watchMode, typecheck: enableTypecheck } = options;

  if (watchMode) {
    startWatch({ filePath, args: [] });
    return;
  }

  // Type check: non-blocking by default, blocking with --typecheck flag
  typecheck(filePath, enableTypecheck);

  const code = transpileFile(filePath);
  const cwd = process.cwd();
  const absolutePath = path.resolve(cwd, filePath);
  const dirname = path.dirname(absolutePath);
  const filename = path.basename(absolutePath);

  const require = module.createRequire(import.meta.url);
  const __dirname = dirname;
  const __filename = absolutePath;

  const context = {
    require,
    module: { exports: {} },
    exports: {},
    __dirname,
    __filename,
    process,
    console,
    Buffer,
    global,
    clearInterval,
    clearTimeout,
    setInterval,
    setTimeout,
    setImmediate,
    clearImmediate,
  };

  const script = new vm.Script(code, {
    filename: absolutePath,
    lineOffset: 0,
    columnOffset: 0,
  });

  try {
    script.runInNewContext(context, {
      timeout: 60000, // 60 seconds
    });

    const result = context.module.exports as Record<string, unknown>;
    if (result && typeof result.default === "function") {
      await (result.default as () => Promise<void>)();
    }
  } catch (error) {
    console.error(`Error executing ${filePath}:`);
    console.error(error);
    process.exit(1);
  }
}
