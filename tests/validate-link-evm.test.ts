import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons.js";
import * as EvmLink from "../generated/types/app/certified/link/evm.js";

const EIP712_DOMAIN = {
  name: "IdentityLink",
  version: "1",
} as const;

const EIP712_TYPES = {
  LinkAttestation: [
    { name: "did", type: "string" },
    { name: "evmAddress", type: "address" },
    { name: "chainId", type: "uint256" },
    { name: "timestamp", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
} as const;

// Hardhat account #0 — well-known test key, not a secret
const TEST_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

async function signEvmLinkRecord() {
  const { privateKeyToAccount } = await import("viem/accounts");
  const { getAddress } = await import("viem");

  const account = privateKeyToAccount(TEST_PRIVATE_KEY);
  const did = "did:plc:ewvi7nxzyoun6zhxrhs64oiz";
  const chainId = 1;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = "0";

  const signature = await account.signTypedData({
    domain: { ...EIP712_DOMAIN, chainId: BigInt(chainId) },
    types: EIP712_TYPES,
    primaryType: "LinkAttestation",
    message: {
      did,
      evmAddress: account.address,
      chainId: BigInt(chainId),
      timestamp: BigInt(timestamp),
      nonce: BigInt(nonce),
    },
  });

  return {
    address: getAddress(account.address),
    proof: {
      $type: "app.certified.link.evm#eip712Proof",
      signature,
      message: {
        $type: "app.certified.link.evm#eip712Message",
        did,
        evmAddress: getAddress(account.address),
        chainId: String(chainId),
        timestamp,
        nonce,
      },
    },
    createdAt: new Date().toISOString(),
  };
}

describe("app.certified.link.evm", () => {
  it("should accept a record with a real EIP-712 signature", async () => {
    const record = await signEvmLinkRecord();

    const result = EvmLink.validateMain({
      $type: ids.AppCertifiedLinkEvm,
      ...record,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.address).toBe(record.address);
    }
  });

  it("should accept a 64-byte compact (EIP-2098) signature", async () => {
    const record = await signEvmLinkRecord();

    // Convert 65-byte signature to 64-byte EIP-2098 compact form
    const fullSig = record.proof.signature;
    const r = fullSig.slice(2, 66);
    const s = BigInt(`0x${fullSig.slice(66, 130)}`);
    const v = parseInt(fullSig.slice(130, 132), 16);
    const yParity = v - 27;
    const compactS = (BigInt(yParity) << 255n) | s;
    const compactSig = `0x${r}${compactS.toString(16).padStart(64, "0")}`;

    expect(compactSig.length).toBe(130);

    const compactRecord = {
      $type: ids.AppCertifiedLinkEvm,
      ...record,
      proof: { ...record.proof, signature: compactSig },
    };
    const result = EvmLink.validateMain(compactRecord);
    expect(result.success).toBe(true);
  });

  it("should reject a record missing required fields", () => {
    const result = validate(
      { address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
      ids.AppCertifiedLinkEvm,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a signature that is too short", () => {
    const result = validate(
      {
        address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        proof: {
          $type: "app.certified.link.evm#eip712Proof",
          signature: "0xdead",
          message: {
            $type: "app.certified.link.evm#eip712Message",
            did: "did:plc:test",
            evmAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
            chainId: "1",
            timestamp: "1709500000",
            nonce: "0",
          },
        },
        createdAt: "2024-03-04T00:00:00Z",
      },
      ids.AppCertifiedLinkEvm,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });
});
