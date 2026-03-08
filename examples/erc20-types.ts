// ERC-20 Token with strong TypeScript types

// Type definitions (normally from viem)
type Hex = `0x${string}`;
type Address = `0x${string}`;

/**
 * ERC-20 Token Standard Events
 */
interface TransferEvent {
  from: Address;
  to: Address;
  value: bigint;
  blockNumber: bigint;
  transactionHash: Hex;
  indexed: true;
}

interface ApprovalEvent {
  owner: Address;
  spender: Address;
  value: bigint;
  blockNumber: bigint;
  indexed: true;
}

type ERC20Event = TransferEvent | ApprovalEvent;

/**
 * ERC-20 Token Metadata
 */
interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
}

/**
 * ERC-20 Balance Information
 */
interface BalanceInfo {
  address: Address;
  balance: bigint;
  allowance: Map<Address, bigint>;
  lastUpdated: Date;
}

/**
 * ERC-20 Contract ABI Types
 */
interface ERC20ABI {
  // Read Functions
  name(): Promise<string>;
  symbol(): Promise<string>;
  decimals(): Promise<number>;
  totalSupply(): Promise<bigint>;
  balanceOf(account: Address): Promise<bigint>;
  allowance(owner: Address, spender: Address): Promise<bigint>;

  // Write Functions
  transfer(to: Address, amount: bigint): Promise<Hex>;
  approve(spender: Address, amount: bigint): Promise<Hex>;
  transferFrom(
    from: Address,
    to: Address,
    amount: bigint
  ): Promise<Hex>;

  // Events
  on<T extends ERC20Event>(
    event: string,
    callback: (event: T) => void
  ): void;
}

/**
 * ERC-20 Token Controller
 */
class ERC20Token {
  private metadata: TokenMetadata;
  private balances: Map<Address, bigint>;
  private allowances: Map<Address, Map<Address, bigint>>;
  private events: ERC20Event[];

  constructor(
    name: string,
    symbol: string,
    decimals: number,
    initialSupply: bigint
  ) {
    this.metadata = {
      name,
      symbol,
      decimals,
      totalSupply: initialSupply,
    };
    this.balances = new Map();
    this.allowances = new Map();
    this.events = [];
  }

  /**
   * Get token metadata
   */
  getMetadata(): Readonly<TokenMetadata> {
    return Object.freeze({ ...this.metadata });
  }

  /**
   * Check balance of an account
   */
  getBalance(account: Address): bigint {
    return this.balances.get(account) ?? BigInt(0);
  }

  /**
   * Check approved amount
   */
  getAllowance(owner: Address, spender: Address): bigint {
    return this.allowances.get(owner)?.get(spender) ?? BigInt(0);
  }

  /**
   * Transfer tokens between accounts
   */
  transfer(from: Address, to: Address, amount: bigint): void {
    const fromBalance = this.getBalance(from);
    if (fromBalance < amount) {
      throw new Error(
        `Insufficient balance. Have ${fromBalance}, need ${amount}`
      );
    }

    this.balances.set(from, fromBalance - amount);
    const toBalance = this.getBalance(to);
    this.balances.set(to, toBalance + amount);

    this.events.push({
      from,
      to,
      value: amount,
      blockNumber: BigInt(0),
      transactionHash: "0x" as Hex,
      indexed: true,
    } as TransferEvent);
  }

  /**
   * Approve spender for amount
   */
  approve(owner: Address, spender: Address, amount: bigint): void {
    if (!this.allowances.has(owner)) {
      this.allowances.set(owner, new Map());
    }

    this.allowances.get(owner)!.set(spender, amount);

    this.events.push({
      owner,
      spender,
      value: amount,
      blockNumber: BigInt(0),
      indexed: true,
    } as ApprovalEvent);
  }

  /**
   * Get all events
   */
  getEvents(): ReadonlyArray<ERC20Event> {
    return Object.freeze([...this.events]);
  }

  /**
   * Get full balance info
   */
  getBalanceInfo(address: Address): BalanceInfo {
    const allowance = new Map(
      Array.from(this.allowances.get(address)?.entries() ?? [])
    );

    return {
      address,
      balance: this.getBalance(address),
      allowance,
      lastUpdated: new Date(),
    };
  }
}

// Usage Example
function demonstrateERC20(): void {
  const token = new ERC20Token("MyToken", "MTK", 18, BigInt(1000000));

  const alice = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address;
  const bob = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;

  console.log("Token Metadata:", token.getMetadata());

  // Approve Bob to spend Alice's tokens
  token.approve(alice, bob, BigInt(1000));

  // Check allowance
  const allowance = token.getAllowance(alice, bob);
  console.log(`Bob can spend ${allowance} tokens from Alice`);

  // Get balance info
  const balanceInfo = token.getBalanceInfo(alice);
  console.log("Alice Balance Info:", balanceInfo);
}

demonstrateERC20();
