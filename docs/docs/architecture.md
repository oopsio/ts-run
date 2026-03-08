# Internal Architecture

The ts-run execution lifecycle consists of three distinct phases:

### Phase 1: Transpilation
The system reads the source file and determines if it contains TypeScript or TSX syntax. Using `@swc/core`, the source is transformed into ECMAScript-compliant JavaScript. Decorators and metadata are supported to ensure compatibility with modern frameworks.

### Phase 2: Static Analysis
When the `--typecheck` flag is present, the tool initializes a TypeScript Program using the compiler API. It resolves dependencies and identifies diagnostics. Unlike the transpilation phase, this step is IO-heavy as it checks the entire dependency graph.

### Phase 3: Virtual Machine Execution
The final JavaScript code is loaded into a Node.js `vm` module. A custom sandbox is created to provide global objects that the script expects, such as `process`, `console`, and `Buffer`. 

The execution context also maps `__dirname` and `__filename` to the original source location to ensure relative file paths work correctly within the executed script.
