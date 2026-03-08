# ts-run Examples

Comprehensive examples demonstrating TypeScript features with `ts-run`.

## React JSX Example

**File:** `react-app.tsx`

Demonstrates:
- React component types (`FC`, `ReactNode`)
- Props interfaces with optional properties
- TypeScript union types for variants
- React hooks with typed state (`useState`)
- Event handlers with proper types

```bash
ts-run examples/react-app.tsx
```

## ERC-20 Token Implementation

**File:** `erc20-types.ts`

Demonstrates:
- Template literal types (`Hex`, `Address`)
- Discriminated unions for events
- Generic type constraints
- Interface composition
- Map collections with types
- ReadonlyArray usage
- Class-based implementation

```bash
ts-run examples/erc20-types.ts
```

Outputs token metadata, allowances, and balance information with strong type safety.

## Advanced TypeScript Types

**File:** `advanced-types.ts`

Demonstrates:
- `Result<T, E>` pattern (Either/Result monad)
- Discriminated unions for API responses
- Utility types (`Pick`, `Omit`, `Partial`, `Required`, `Readonly`)
- Conditional types with `infer`
- Generic constraints with `keyof`
- Const assertions for literal types
- Builder pattern with method chaining
- Function overloading
- Template literal types

```bash
ts-run examples/advanced-types.ts
```

Covers Result types, API response handling, query builders, formatted output, and more.

## Web3 Contract Interaction

**File:** `web3-contract.ts`

Demonstrates:
- ABI (Application Binary Interface) type definitions
- Discriminated union types for ABI items
- Function state mutability enums
- Generic interfaces for smart contracts
- Type-safe contract method calls
- Event listener patterns
- Error handling with type guards

```bash
ts-run examples/web3-contract.ts
```

Simulates ERC-20 contract interactions with read/write methods and event emission.

## Running All Examples

```bash
# Individual examples
ts-run examples/erc20-types.ts
ts-run examples/advanced-types.ts
ts-run examples/web3-contract.ts

# With type checking
ts-run examples/erc20-types.ts --typecheck
ts-run examples/advanced-types.ts --typecheck
```

## Type Features Covered

### Basic Types
- Interfaces
- Type aliases
- Unions
- Generics

### Advanced Patterns
- Discriminated unions
- Conditional types
- Mapped types
- Template literal types
- Const assertions

### Practical Examples
- React components
- Blockchain interactions
- API response handling
- Error handling patterns
- Builder patterns
- Event systems

### Type Safety
- Generic constraints
- Function overloads
- Type guards
- Readonly variants
- Branded types

## Learning Resources

These examples demonstrate:
1. **Type-safe React** - Component props, state management
2. **Financial types** - ERC-20 tokens, allowances, transfers
3. **Advanced patterns** - Result types, discriminated unions, builders
4. **Contract interactions** - ABI definitions, type-safe calls
5. **Error handling** - Type guards and error discrimination

Each example is executable with ts-run and includes inline documentation.

## Notes

- Examples don't require external dependencies (self-contained types)
- JSX is fully supported with automatic preact runtime
- All types are validated by TypeScript compiler
- Run with `--typecheck` flag to verify type safety
