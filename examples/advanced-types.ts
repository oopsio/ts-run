// Advanced TypeScript types examples

/**
 * Generic Result type (Either/Result pattern)
 */
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

function Ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Promise utilities with type safety
 */
async function safeAsync<T>(
  fn: () => Promise<T>
): Promise<Result<T, Error>> {
  try {
    return Ok(await fn());
  } catch (error) {
    return Err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Discriminated Union for API responses
 */
interface SuccessResponse<T> {
  status: "success";
  data: T;
  timestamp: Date;
}

interface ErrorResponse {
  status: "error";
  code: string;
  message: string;
  timestamp: Date;
}

interface LoadingResponse {
  status: "loading";
  progress: number;
}

type ApiResponse<T> =
  | SuccessResponse<T>
  | ErrorResponse
  | LoadingResponse;

function handleResponse<T>(response: ApiResponse<T>): void {
  switch (response.status) {
    case "success": {
      const { data, timestamp } = response;
      console.log(`Success at ${timestamp}:`, data);
      break;
    }
    case "error": {
      const { code, message } = response;
      console.error(`Error ${code}: ${message}`);
      break;
    }
    case "loading": {
      const { progress } = response;
      console.log(`Loading: ${Math.round(progress * 100)}%`);
      break;
    }
  }
}

/**
 * Advanced mapped types and utility types
 */
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

// Make all properties readonly
type ReadonlyUser = Readonly<User>;

// Make all properties optional
type PartialUser = Partial<User>;

// Pick specific properties
type UserPreview = Pick<User, "id" | "name">;

// Exclude properties
type UserWithoutEmail = Omit<User, "email">;

// Make properties required
type RequiredUser = Required<PartialUser>;

/**
 * Conditional types and type inference
 */
type Flatten<T> = T extends Array<infer U> ? U : T;

type Str = Flatten<string[]>; // string
type Num = Flatten<number>; // number

/**
 * Generic constraints
 */
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

/**
 * Const assertions for literal types
 */
const directions = ["up", "down", "left", "right"] as const;
type Direction = (typeof directions)[number]; // "up" | "down" | "left" | "right"

/**
 * Builder pattern with types
 */
interface QueryOptions {
  where?: Record<string, unknown>;
  limit?: number;
  offset?: number;
  orderBy?: string;
}

class QueryBuilder<T> {
  private options: QueryOptions = {};

  where(conditions: Record<string, unknown>): this {
    this.options.where = conditions;
    return this;
  }

  limit(limit: number): this {
    this.options.limit = limit;
    return this;
  }

  offset(offset: number): this {
    this.options.offset = offset;
    return this;
  }

  orderBy(field: string): this {
    this.options.orderBy = field;
    return this;
  }

  build(): QueryOptions {
    return { ...this.options };
  }
}

/**
 * Overloaded function signatures
 */
function format(value: string | number | boolean): string;
function format(value: Date): string;
function format(value: unknown[]): string;
function format(value: any): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return `[${value.join(", ")}]`;
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}

/**
 * Tuple types and rest parameters
 */
type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;

type _TupleOf<
  T,
  N extends number,
  R extends unknown[]
> = R["length"] extends N ? R : _TupleOf<T, N, [T, ...R]>;

/**
 * Template literal types
 */
type EventName = `${string}Changed`;
type ChangeEvent<T extends string> = `${T}Changed`;

const eventName: EventName = "userChanged"; // OK
// const invalid: EventName = "userCreated"; // Error

/**
 * Demonstration
 */
async function demonstrateAdvancedTypes(): Promise<void> {
  // Result type usage
  const result = await safeAsync(() => Promise.resolve(42));
  if (result.ok) {
    console.log("Result value:", result.value);
  }

  // API Response usage
  const response: ApiResponse<{ id: number }> = {
    status: "success",
    data: { id: 1 },
    timestamp: new Date(),
  };
  handleResponse(response);

  // Query builder
  const query = new QueryBuilder<User>()
    .where({ active: true })
    .limit(10)
    .orderBy("name")
    .build();

  console.log("Built query:", query);

  // Format examples
  console.log("Formatted string:", format("hello"));
  console.log("Formatted number:", format(42));
  console.log("Formatted date:", format(new Date()));
  console.log("Formatted array:", format([1, 2, 3]));

  // Direction type
  const dir: Direction = "up"; // OK
  console.log("Direction:", dir);
}

// Run demonstration
(async () => {
  await demonstrateAdvancedTypes();
})();
