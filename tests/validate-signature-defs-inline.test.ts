import { describe, it, expect } from "vitest";
import { validate } from "../generated/lexicons.js";
import { validateInline } from "../generated/types/app/certified/signature/defs.js";

describe("app.certified.signature.defs#inline", () => {
  it("should accept a valid inline signature", () => {
    const result = validateInline({
      $type: "app.certified.signature.defs#inline",
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
      "app.certified.signature.defs",
      "inline",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject when required field 'key' is missing", () => {
    const result = validate(
      {
        signature: new Uint8Array([1, 2, 3]),
      },
      "app.certified.signature.defs",
      "inline",
      false,
    );
    expect(result.success).toBe(false);
  });
});
