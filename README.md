# ts-run

A lightweight TypeScript runtime that transpiles and executes TypeScript files with SWC, optional type checking, and watch mode support.

## Quick Start

```bash
ts-run file.ts              # Run TypeScript file
ts-run file.ts --typecheck # Type check before running
ts-run file.ts --watch     # Auto-restart on changes
```

## What It Does

Runs TypeScript and TSX files directly without compilation to disk. Type errors are reported but don't block execution by default. Use `--typecheck` to fail on type errors. Supports JSX with automatic preact runtime.

## Install

```bash
npm install -g ts-run
```

## Build

```bash
npm run build              # Production bundle (16KB)
npm test                   # Run test suite (17 tests)
```

## License

MIT, 2026-present oopsio
