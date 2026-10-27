import { describe, it, expect } from "vitest";
import { validate } from "../generated/lexicons.js";
import { validateCreatedVia } from "../generated/types/app/certified/signature/defs.js";

describe("app.certified.signature.defs#createdVia", () => {
  it("should accept a valid createdVia signature", () => {
    const result = validateCreatedVia({
      $type: "app.certified.signature.defs#createdVia",
      signature: new Uint8Array([1, 2, 3, 4]),
      key: "did:web:app.example#platform-signing",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.key).toBe("did:web:app.example#platform-signing");
    }
  });

  it("should reject when required field 'signature' is missing", () => {
    const result = validate(
      {
        key: "did:web:app.example#platform-signing",
      },
      "app.certified.signature.defs",
      "createdVia",
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
      "createdVia",
      false,
    );
    expect(result.success).toBe(false);
  });
});
