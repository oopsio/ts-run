const greet = (name: string): string => {
  return `Hello, ${name}!`;
};

// Type error: passing number instead of string
console.log(greet(123));
