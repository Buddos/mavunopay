import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDTEZY73O47FREBTUDDFTBTINS7ZI2FTW37XGTISP22HEK3DGA5DA67Y",
  }
} as const


export interface AllocationInfo {
  amount: i128;
  key: string;
  pct: u32;
}


export interface AllocationRule {
  key: string;
  pct: u32;
}


export interface AllocationResult {
  allocations: Array<AllocationInfo>;
  amount: i128;
  farmer: string;
}

export interface ClientMethods {
  /**
   * Construct and simulate a allocate_payment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Allocate an incoming payment according to farmer's rules
   * Returns the allocation breakdown
   */
  allocate_payment: ({farmer, amount}: {farmer: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<AllocationResult>>>

  /**
   * Construct and simulate a get_allocation_rules transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get allocation rules for a farmer
   */
  get_allocation_rules: ({farmer}: {farmer: string}, options?: MethodOptions) => Promise<AssembledTransaction<Array<AllocationRule>>>

  /**
   * Construct and simulate a set_allocation_rules transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set allocation rules for a farmer (admin-only or farmer-authorized)
   * Rules must sum to 100%
   */
  set_allocation_rules: ({farmer, rules}: {farmer: string, rules: Array<AllocationRule>}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_allocation_history transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get allocation history for a farmer
   */
  get_allocation_history: ({farmer}: {farmer: string}, options?: MethodOptions) => Promise<AssembledTransaction<Array<AllocationResult>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAADkFsbG9jYXRpb25JbmZvAAAAAAADAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAAA2tleQAAAAAQAAAAAAAAAANwY3QAAAAABA==",
        "AAAAAQAAAAAAAAAAAAAADkFsbG9jYXRpb25SdWxlAAAAAAACAAAAAAAAAANrZXkAAAAAEAAAAAAAAAADcGN0AAAAAAQ=",
        "AAAAAQAAAAAAAAAAAAAAEEFsbG9jYXRpb25SZXN1bHQAAAADAAAAAAAAAAthbGxvY2F0aW9ucwAAAAPqAAAH0AAAAA5BbGxvY2F0aW9uSW5mbwAAAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAABmZhcm1lcgAAAAAAEw==",
        "AAAAAAAAAFlBbGxvY2F0ZSBhbiBpbmNvbWluZyBwYXltZW50IGFjY29yZGluZyB0byBmYXJtZXIncyBydWxlcwpSZXR1cm5zIHRoZSBhbGxvY2F0aW9uIGJyZWFrZG93bgAAAAAAABBhbGxvY2F0ZV9wYXltZW50AAAAAgAAAAAAAAAGZmFybWVyAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAD6QAAB9AAAAAQQWxsb2NhdGlvblJlc3VsdAAAAAM=",
        "AAAAAAAAACFHZXQgYWxsb2NhdGlvbiBydWxlcyBmb3IgYSBmYXJtZXIAAAAAAAAUZ2V0X2FsbG9jYXRpb25fcnVsZXMAAAABAAAAAAAAAAZmYXJtZXIAAAAAABMAAAABAAAD6gAAB9AAAAAOQWxsb2NhdGlvblJ1bGUAAA==",
        "AAAAAAAAAFpTZXQgYWxsb2NhdGlvbiBydWxlcyBmb3IgYSBmYXJtZXIgKGFkbWluLW9ubHkgb3IgZmFybWVyLWF1dGhvcml6ZWQpClJ1bGVzIG11c3Qgc3VtIHRvIDEwMCUAAAAAABRzZXRfYWxsb2NhdGlvbl9ydWxlcwAAAAIAAAAAAAAABmZhcm1lcgAAAAAAEwAAAAAAAAAFcnVsZXMAAAAAAAPqAAAH0AAAAA5BbGxvY2F0aW9uUnVsZQAAAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAACNHZXQgYWxsb2NhdGlvbiBoaXN0b3J5IGZvciBhIGZhcm1lcgAAAAAWZ2V0X2FsbG9jYXRpb25faGlzdG9yeQAAAAAAAQAAAAAAAAAGZmFybWVyAAAAAAATAAAAAQAAA+oAAAfQAAAAEEFsbG9jYXRpb25SZXN1bHQ=" ]),
      options
    )
  }
  public readonly fromJSON = {
    allocate_payment: this.txFromJSON<Result<AllocationResult>>,
        get_allocation_rules: this.txFromJSON<Array<AllocationRule>>,
        set_allocation_rules: this.txFromJSON<Result<void>>,
        get_allocation_history: this.txFromJSON<Array<AllocationResult>>
  }
}