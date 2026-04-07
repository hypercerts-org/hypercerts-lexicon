import { describe, it, expect } from "vitest";
import { ids } from "../generated/lexicons.js";
import * as Activity from "../generated/types/org/hypercerts/claim/activity.js";

/**
 * Tests that the `signatures` property works correctly on record lexicons.
 * Uses activity as a representative — all 20 record lexicons share the
 * same signatures property definition.
 */
describe("signatures property on records", () => {
  const baseActivity = {
    title: "Test Activity",
    shortDescription: "A test activity for signature validation",
    createdAt: "2024-06-15T12:00:00.000Z",
  };

  it("should accept a record without signatures", () => {
    const result = Activity.validateMain({
      $type: ids.OrgHypercertsClaimActivity,
      ...baseActivity,
    });
    expect(result.success).toBe(true);
  });

  it("should accept a record with an inline signature", () => {
    const result = Activity.validateMain({
      $type: ids.OrgHypercertsClaimActivity,
      ...baseActivity,
      signatures: [
        {
          $type: "app.certified.signature.inline",
          signatureType: "ES256K",
          signature: new Uint8Array([1, 2, 3, 4]),
          key: "did:plc:platform123#signing",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should accept a record with a remote attestation (strongRef)", () => {
    const result = Activity.validateMain({
      $type: ids.OrgHypercertsClaimActivity,
      ...baseActivity,
      signatures: [
        {
          $type: "com.atproto.repo.strongRef",
          uri: "at://did:plc:verifier/app.certified.signature.proof/3k2abc",
          cid: "bafyreie5737gdxlw5i64vngml6xvqeatqy3a4erphoqtso54z2eooh4zae",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should accept a record with both inline and remote signatures", () => {
    const result = Activity.validateMain({
      $type: ids.OrgHypercertsClaimActivity,
      ...baseActivity,
      signatures: [
        {
          $type: "app.certified.signature.inline",
          signature: new Uint8Array([0xde, 0xad]),
          key: "did:plc:signer1#key-1",
        },
        {
          $type: "com.atproto.repo.strongRef",
          uri: "at://did:plc:verifier/app.certified.signature.proof/abc123",
          cid: "bafyreie5737gdxlw5i64vngml6xvqeatqy3a4erphoqtso54z2eooh4zae",
        },
        {
          $type: "app.certified.signature.inline",
          signatureType: "Ed25519",
          signature: new Uint8Array([0xca, 0xfe]),
          key: "did:plc:signer2#key-2",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should accept an empty signatures array", () => {
    const result = Activity.validateMain({
      $type: ids.OrgHypercertsClaimActivity,
      ...baseActivity,
      signatures: [],
    });
    expect(result.success).toBe(true);
  });
});
