import { transformSync } from "@swc/core";
import * as fs from "fs";

const source = 'const greet = (name: string): string => `Hello ${name}`;\nconsole.log(greet("World"));';

const result = transformSync(source, {
  filename: "test.ts",
  jsc: {
    parser: {
      syntax: "typescript",
      tsx: false,
      decorators: true,
    },
    transform: {
      react: {
        runtime: "automatic",
        importSource: "preact",
      },
    },
  },
  module: {
    type: "es6",
  },
});

console.log("=== TRANSPILED CODE ===");
console.log(result.code);
