import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons.js";
import * as SignatureInline from "../generated/types/app/certified/signature/inline.js";

describe("app.certified.signature.inline", () => {
  it("should accept a valid inline signature with all fields", () => {
    const result = SignatureInline.validateMain({
      $type: "app.certified.signature.inline",
      signatureType: "ES256K",
      signature: new Uint8Array([1, 2, 3, 4]),
      key: "did:plc:abc123#signing",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.key).toBe("did:plc:abc123#signing");
      expect(result.value.signatureType).toBe("ES256K");
    }
  });

  it("should accept a signature without optional signatureType", () => {
    const result = SignatureInline.validateMain({
      $type: "app.certified.signature.inline",
      signature: new Uint8Array([1, 2, 3, 4]),
      key: "did:plc:abc123#signing",
    });
    expect(result.success).toBe(true);
  });

  it("should accept all known algorithm identifiers", () => {
    for (const alg of ["ES256", "ES256K", "Ed25519"]) {
      const result = SignatureInline.validateMain({
        $type: "app.certified.signature.inline",
        signatureType: alg,
        signature: new Uint8Array([0xde, 0xad]),
        key: "did:plc:test#key-1",
      });
      expect(result.success).toBe(true);
    }
  });

  it("should accept unknown algorithm identifiers (knownValues is open)", () => {
    const result = SignatureInline.validateMain({
      $type: "app.certified.signature.inline",
      signatureType: "PS256",
      signature: new Uint8Array([0xca, 0xfe]),
      key: "did:web:example.com#key-1",
    });
    expect(result.success).toBe(true);
  });

  it("should reject when required field 'signature' is missing", () => {
    const result = validate(
      {
        key: "did:plc:abc123#signing",
      },
      ids.AppCertifiedSignatureInline,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject when required field 'key' is missing", () => {
    const result = validate(
      {
        signature: new Uint8Array([1, 2, 3]),
      },
      ids.AppCertifiedSignatureInline,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });
});
