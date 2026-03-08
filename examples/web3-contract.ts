// Web3 Contract Interaction with Strong Types

// Type definitions (normally from viem)
type Hex = `0x${string}`;
type Address = `0x${string}`;

/**
 * Contract ABI Entry types
 */
type ABIType =
  | "function"
  | "constructor"
  | "event"
  | "fallback"
  | "receive";

type StateMutability =
  | "pure"
  | "view"
  | "nonpayable"
  | "payable";

/**
 * ABI Parameter
 */
interface AbiParameter {
  name: string;
  type: string;
  internalType?: string;
  components?: AbiParameter[];
  indexed?: boolean;
}

/**
 * ABI Function
 */
interface AbiFunction {
  type: "function";
  name: string;
  inputs: AbiParameter[];
  outputs?: AbiParameter[];
  stateMutability: StateMutability;
  constant?: boolean;
  payable?: boolean;
}

/**
 * ABI Event
 */
interface AbiEvent {
  type: "event";
  name: string;
  inputs: (AbiParameter & { indexed?: boolean })[];
  anonymous?: boolean;
}

type AbiItem = AbiFunction | AbiEvent;

/**
 * Contract instance with type-safe methods
 */
interface ContractABI extends Array<AbiItem> {}

/**
 * Function call result
 */
interface FunctionResult {
  outputs: unknown[];
  txHash?: Hex;
  blockNumber?: bigint;
}

/**
 * Contract read/write call options
 */
interface ReadOptions {
  from?: Address;
  blockTag?: "latest" | "pending" | bigint;
}

interface WriteOptions {
  from: Address;
  value?: bigint;
  gas?: bigint;
  gasPrice?: bigint;
}

/**
 * Smart Contract Interface
 */
interface SmartContract {
  address: Address;
  abi: ContractABI;
  call<T>(
    functionName: string,
    args: unknown[],
    options?: ReadOptions
  ): Promise<T>;
  send(
    functionName: string,
    args: unknown[],
    options: WriteOptions
  ): Promise<Hex>;
  on(eventName: string, callback: (data: unknown) => void): void;
}

/**
 * Implementation
 */
class ContractInstance implements SmartContract {
  address: Address;
  abi: ContractABI;
  private listeners: Map<string, ((data: unknown) => void)[]> = new Map();

  constructor(address: Address, abi: ContractABI) {
    this.address = address;
    this.abi = abi;
  }

  private findFunction(name: string): AbiFunction | undefined {
    return this.abi.find(
      (item) => item.type === "function" && item.name === name
    ) as AbiFunction | undefined;
  }

  async call<T>(
    functionName: string,
    args: unknown[],
    _options?: ReadOptions
  ): Promise<T> {
    const fn = this.findFunction(functionName);
    if (!fn) {
      throw new Error(`Function ${functionName} not found in ABI`);
    }

    if (fn.stateMutability !== "view" && fn.stateMutability !== "pure") {
      throw new Error(`Function ${functionName} is not a view/pure function`);
    }

    // Simulate function call
    console.log(`Calling ${functionName}(${args.join(", ")})`);
    return {} as T;
  }

  async send(
    functionName: string,
    args: unknown[],
    _options: WriteOptions
  ): Promise<Hex> {
    const fn = this.findFunction(functionName);
    if (!fn) {
      throw new Error(`Function ${functionName} not found in ABI`);
    }

    if (fn.stateMutability === "view" || fn.stateMutability === "pure") {
      throw new Error(`Function ${functionName} is a view/pure function`);
    }

    // Simulate function send
    console.log(
      `Sending ${functionName}(${args.join(", ")}) from ${_options.from}`
    );
    return "0x" as Hex;
  }

  on(eventName: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(callback);
  }

  emit(eventName: string, data: unknown): void {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }
}

/**
 * Sample ERC-20 ABI
 */
const ERC20_ABI: ContractABI = [
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
];

/**
 * Type-safe contract interaction
 */
async function demonstrateContractInteraction(): Promise<void> {
  const tokenAddress = "0x1234567890123456789012345678901234567890" as Address;
  const userAddress = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address;
  const recipientAddress = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;

  const token = new ContractInstance(tokenAddress, ERC20_ABI);

  // Read balance
  console.log("\n=== Reading Balance ===");
  const balance = await token.call<bigint>("balanceOf", [userAddress]);
  console.log(`Balance of ${userAddress}:`, balance);

  // Send transfer
  console.log("\n=== Sending Transfer ===");
  const txHash = await token.send(
    "transfer",
    [recipientAddress, BigInt(1000)],
    { from: userAddress }
  );
  console.log(`Transaction hash: ${txHash}`);

  // Listen to events
  console.log("\n=== Listening to Events ===");
  token.on("Transfer", (data) => {
    console.log("Transfer event:", data);
  });

  // Emit event
  token.emit("Transfer", {
    from: userAddress,
    to: recipientAddress,
    value: BigInt(1000),
  });

  // Error handling for invalid calls
  console.log("\n=== Error Handling ===");
  try {
    // Try to call a write function as read
    await token.call("transfer", [recipientAddress, BigInt(1000)]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`Caught expected error: ${message}`);
  }
}

// Run demo
(async () => {
  await demonstrateContractInteraction();
})();
