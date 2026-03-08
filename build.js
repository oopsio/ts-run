import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";

const isDev = process.argv.includes("--dev");

const entryPoints = [
  "src/cli.ts",
  "src/runner.ts",
  "src/transpile.ts",
  "src/typecheck.ts",
  "src/watch.ts",
];

async function buildUniversalBundle(minify) {
  const suffix = minify ? ".min" : "";
  const filename = `ts-run${suffix}.js`;

  return esbuild.build({
    entryPoints: ["src/cli.ts"],
    outfile: `dist/${filename}`,
    format: "iife",
    target: "es2022",
    platform: "node",
    minify: minify && !isDev,
    sourcemap: isDev ? "inline" : false,
    bundle: true,
    external: ["@swc/core", "typescript", "chokidar", "yargs"],
    globalName: "TsRun",
    define: {
      "process.env.NODE_ENV": isDev ? '"development"' : '"production"',
    },
  });
}

async function build() {
  console.log(`Building ts-run ${isDev ? "(dev)" : "(production)"}...`);

  try {
    // Build universal bundles
    console.log("\nBuilding universal bundles...");
    await Promise.all([
      buildUniversalBundle(false).then(() =>
        console.log("  ✓ ts-run.js (non-minified)")
      ),
      buildUniversalBundle(true).then(() =>
        console.log("  ✓ ts-run.min.js (minified)")
      ),
    ]);

    // Build bundled CLI entry for bin
    await esbuild.build({
      entryPoints: ["src/cli.ts"],
      outfile: "dist/cli-bundle.js",
      format: "esm",
      target: "es2022",
      platform: "node",
      minify: !isDev,
      sourcemap: isDev ? "inline" : false,
      bundle: true,
      external: ["@swc/core", "typescript", "chokidar", "yargs"],
      define: {
        "process.env.NODE_ENV": isDev ? '"development"' : '"production"',
      },
    });

    // Copy bin/ts-run.js with proper shebang
    const binContent = `#!/usr/bin/env node
import { main } from "../dist/cli.js";

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
`;
    fs.writeFileSync("bin/ts-run.js", binContent);

    console.log("\n✓ Build complete!");
    console.log("\nOutput files:");
    console.log("  ✓ ts-run.js (universal, non-minified)");
    console.log("  ✓ ts-run.min.js (universal, minified)");
    console.log("  ✓ cli-bundle.js (ESM module)");
    console.log("  ✓ bin/ts-run.js (Node CLI entry)");

    const distSize = getDirectorySize("dist");
    console.log(`\nTotal dist/ size: ${(distSize / 1024).toFixed(2)} KB`);

    // Print file sizes
    console.log("\nFile sizes:");
    const files = fs.readdirSync("dist").sort();
    for (const file of files) {
      const size = fs.statSync(path.join("dist", file)).size;
      if (size > 1000) {
        console.log(
          `  ${file.padEnd(30)} ${((size / 1024).toFixed(2) + " KB").padStart(10)}`
        );
      }
    }
  } catch (error) {
    console.error("✗ Build failed:", error);
    process.exit(1);
  }
}

function getDirectorySize(dir) {
  let size = 0;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      size += getDirectorySize(fullPath);
    } else {
      size += fs.statSync(fullPath).size;
    }
  }
  return size;
}

build();
