import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { runFile } from "./runner.js";

/**
 * CLI entry point for ts-run.
 * Parses command-line arguments and executes the TypeScript file.
 *
 * Usage:
 *   ts-run file.ts
 *   ts-run file.ts --watch
 *   ts-run file.ts --typecheck
 */
export async function main(): Promise<void> {
  const argv = await yargs(hideBin(process.argv))
    .command(
      "* <file>",
      "Run a TypeScript file",
      (yargs) =>
        yargs.positional("file", {
          describe: "TypeScript file to run",
          type: "string",
          demandOption: true,
        }),
      () => {}
    )
    .option("watch", {
      alias: "w",
      describe: "Watch for changes and restart",
      type: "boolean",
      default: false,
    })
    .option("typecheck", {
      alias: "t",
      describe: "Run TypeScript type checking",
      type: "boolean",
      default: false,
    })
    .help()
    .alias("help", "h")
    .version()
    .alias("version", "v")
    .strict(false)
    .parseAsync();

  const filePath = argv.file as string;
  const watch = argv.watch as boolean;
  const typecheck = argv.typecheck as boolean;

  try {
    await runFile({ filePath, watch, typecheck });
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}
