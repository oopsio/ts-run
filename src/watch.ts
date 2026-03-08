import { watch } from "chokidar";
import * as path from "path";
import type { ChildProcess } from "child_process";
import { spawn } from "child_process";

/**
 * Options for watch mode.
 */
export interface WatchOptions {
  filePath: string;
  args: string[];
}

/**
 * Start watching a TypeScript file for changes and auto-restart.
 *
 * Watches the project directory for file changes and restarts execution
 * when changes are detected. Debounces rapid file changes by 100ms.
 * Clears module cache before restarting to ensure fresh state.
 *
 * @param options Watch options including file path
 * @param options.filePath Path to the TypeScript file to watch
 * @param options.args Additional arguments (reserved for future use)
 *
 * @example
 * ```typescript
 * startWatch({ filePath: "server.ts", args: [] });
 * ```
 */
export function startWatch(options: WatchOptions): void {
  const { filePath, args } = options;
  const cwd = process.cwd();
  const projectRoot = path.dirname(path.resolve(cwd, filePath));

  let childProcess: ChildProcess | null = null;

  const watcher = watch(projectRoot, {
    persistent: true,
    ignored: /(node_modules|\.git|dist)/,
  });

  function restart(): void {
    if (childProcess) {
      childProcess.kill();
      childProcess = null;
    }

    console.log(`\n[${new Date().toLocaleTimeString()}] Restarting...`);

    // Clear require cache for Node.js modules
    for (const key of Object.keys(require.cache)) {
      delete require.cache[key];
    }

    // Re-execute the file
    childProcess = spawn("node", ["--loader", "./bin/ts-run.js", filePath], {
      cwd,
      stdio: "inherit",
    });
  }

  let debounceTimer: NodeJS.Timeout | null = null;

  watcher.on("change", (changedPath: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      console.log(`[${new Date().toLocaleTimeString()}] ${changedPath} changed`);
      restart();
    }, 100);
  });

  console.log(`Watching ${projectRoot} for changes...`);
  restart();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    if (childProcess) {
      childProcess.kill();
    }
    watcher.close();
    process.exit(0);
  });
}
