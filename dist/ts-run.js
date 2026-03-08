"use strict";
var TsRun = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/cli.ts
  var cli_exports = {};
  __export(cli_exports, {
    main: () => main
  });
  var import_yargs = __toESM(__require("yargs"), 1);
  var import_helpers = __require("yargs/helpers");

  // src/runner.ts
  var vm = __toESM(__require("vm"), 1);
  var path3 = __toESM(__require("path"), 1);
  var module = __toESM(__require("module"), 1);

  // src/transpile.ts
  var import_core = __require("@swc/core");
  var fs = __toESM(__require("fs"), 1);
  function transpileFile(filePath, options = {}) {
    const source = fs.readFileSync(filePath, "utf-8");
    const isTypeScript = filePath.endsWith(".ts") || filePath.endsWith(".tsx");
    const isTsx = filePath.endsWith(".tsx");
    const parserConfig = isTypeScript ? {
      syntax: "typescript",
      tsx: isTsx || options.enableJsx,
      decorators: true
    } : {
      syntax: "ecmascript",
      jsx: options.enableJsx || false
    };
    const result = (0, import_core.transformSync)(source, {
      filename: filePath,
      jsc: {
        parser: parserConfig,
        transform: {
          react: {
            runtime: "automatic",
            importSource: "preact"
          }
        }
      },
      module: {
        type: "es6"
      }
    });
    return result.code;
  }

  // src/typecheck.ts
  var ts = __toESM(__require("typescript"), 1);
  var path = __toESM(__require("path"), 1);
  function typecheck(filePath, strict = false) {
    const cwd = process.cwd();
    const absolutePath = path.resolve(cwd, filePath);
    const configPath = ts.findConfigFile(cwd, ts.sys.fileExists, "tsconfig.json");
    let compilerOptions = {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      lib: ["es2022"],
      strict: true,
      skipLibCheck: true
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
      rootNames = [absolutePath];
    }
    const program = ts.createProgram(rootNames, compilerOptions);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length === 0) {
      if (strict) {
        console.log(`\u2713 No type errors in ${filePath}`);
      }
      return;
    }
    let hasError = false;
    for (const diagnostic of diagnostics) {
      if (diagnostic.file && (diagnostic.file.fileName.endsWith(".ts") || diagnostic.file.fileName.endsWith(".tsx"))) {
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

  // src/watch.ts
  var import_chokidar = __require("chokidar");
  var path2 = __toESM(__require("path"), 1);
  var import_child_process = __require("child_process");
  function startWatch(options) {
    const { filePath, args } = options;
    const cwd = process.cwd();
    const projectRoot = path2.dirname(path2.resolve(cwd, filePath));
    let childProcess = null;
    const watcher = (0, import_chokidar.watch)(projectRoot, {
      persistent: true,
      ignored: /(node_modules|\.git|dist)/
    });
    function restart() {
      if (childProcess) {
        childProcess.kill();
        childProcess = null;
      }
      console.log(`
[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Restarting...`);
      for (const key of Object.keys(__require.cache)) {
        delete __require.cache[key];
      }
      childProcess = (0, import_child_process.spawn)("node", ["--loader", "./bin/ts-run.js", filePath], {
        cwd,
        stdio: "inherit"
      });
    }
    let debounceTimer = null;
    watcher.on("change", (changedPath) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        console.log(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] ${changedPath} changed`);
        restart();
      }, 100);
    });
    console.log(`Watching ${projectRoot} for changes...`);
    restart();
    process.on("SIGINT", () => {
      if (childProcess) {
        childProcess.kill();
      }
      watcher.close();
      process.exit(0);
    });
  }

  // src/runner.ts
  var import_meta = {};
  async function runFile(options) {
    const { filePath, watch: watchMode, typecheck: enableTypecheck } = options;
    if (watchMode) {
      startWatch({ filePath, args: [] });
      return;
    }
    typecheck(filePath, enableTypecheck);
    const code = transpileFile(filePath);
    const cwd = process.cwd();
    const absolutePath = path3.resolve(cwd, filePath);
    const dirname4 = path3.dirname(absolutePath);
    const filename = path3.basename(absolutePath);
    const require2 = module.createRequire(import_meta.url);
    const __dirname = dirname4;
    const __filename = absolutePath;
    const context = {
      require: require2,
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
      clearImmediate
    };
    const script = new vm.Script(code, {
      filename: absolutePath,
      lineOffset: 0,
      columnOffset: 0
    });
    try {
      script.runInNewContext(context, {
        timeout: 6e4
        // 60 seconds
      });
      const result = context.module.exports;
      if (result && typeof result.default === "function") {
        await result.default();
      }
    } catch (error) {
      console.error(`Error executing ${filePath}:`);
      console.error(error);
      process.exit(1);
    }
  }

  // src/cli.ts
  async function main() {
    const argv = await (0, import_yargs.default)((0, import_helpers.hideBin)(process.argv)).command(
      "* <file>",
      "Run a TypeScript file",
      (yargs2) => yargs2.positional("file", {
        describe: "TypeScript file to run",
        type: "string",
        demandOption: true
      }),
      () => {
      }
    ).option("watch", {
      alias: "w",
      describe: "Watch for changes and restart",
      type: "boolean",
      default: false
    }).option("typecheck", {
      alias: "t",
      describe: "Run TypeScript type checking",
      type: "boolean",
      default: false
    }).help().alias("help", "h").version().alias("version", "v").strict(false).parseAsync();
    const filePath = argv.file;
    const watch2 = argv.watch;
    const typecheck2 = argv.typecheck;
    try {
      await runFile({ filePath, watch: watch2, typecheck: typecheck2 });
    } catch (error) {
      console.error("Error:", error);
      process.exit(1);
    }
  }
  return __toCommonJS(cli_exports);
})();
