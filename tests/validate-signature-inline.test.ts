import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons.js";
import * as SignatureInline from "../generated/types/app/certified/signature/inline.js";

describe("app.certified.signature.inline", () => {
  it("should accept a valid inline signature", () => {
    const result = SignatureInline.validateMain({
      $type: "app.certified.signature.inline",
      signature: new Uint8Array([1, 2, 3, 4]),
      key: "did:plc:abc123#signing",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.key).toBe("did:plc:abc123#signing");
    }
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
