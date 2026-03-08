# ts-run

ts-run is a CLI tool designed to execute TypeScript files with minimal overhead. It bypasses the slow startup times of traditional compilers by using SWC for transpilation while maintaining the ability to perform full type checking when required.

## Core Capabilities

* Fast Transpilation: Uses the SWC rust-based compiler for near-instant JS generation.
* Type Safety: Integrates the TypeScript Compiler API for optional strict validation.
* Live Reloading: Built-in watch mode for development workflows.
* Environment Parity: Simulates a standard Node.js environment including CJS/ESM compatibility.