# Command Line Interface

Standard execution of a TypeScript file:
```bash
ts-run main.ts

```

### Type Checking

By default, ts-run prioritizes speed and does not block on type errors. To enforce type safety before execution, use the typecheck flag. This will cause the process to exit with a non-zero code if the TypeScript compiler detects errors.

```bash
ts-run main.ts --typecheck

```

### Development Watch Mode

To observe file changes and automatically restart the process:

```bash
ts-run main.ts --watch

```
