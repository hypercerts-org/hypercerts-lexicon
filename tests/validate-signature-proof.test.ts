import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons.js";
import * as SignatureProof from "../generated/types/app/certified/signature/proof.js";

describe("app.certified.signature.proof", () => {
  it("should accept a valid proof with all fields", () => {
    const result = SignatureProof.validateMain({
      $type: "app.certified.signature.proof",
      cid: "bafyreie5737gdxlw5i64vngml6xvqeatqy3a4erphoqtso54z2eooh4zae",
      note: "Verified by platform quality assurance process",
      createdAt: "2024-06-15T12:00:00.000Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.cid).toBe(
        "bafyreie5737gdxlw5i64vngml6xvqeatqy3a4erphoqtso54z2eooh4zae",
      );
      expect(result.value.note).toBe(
        "Verified by platform quality assurance process",
      );
    }
  });

  it("should accept a proof with only the required cid field", () => {
    const result = SignatureProof.validateMain({
      $type: "app.certified.signature.proof",
      cid: "bafyreie5737gdxlw5i64vngml6xvqeatqy3a4erphoqtso54z2eooh4zae",
    });
    expect(result.success).toBe(true);
  });

  it("should reject when required field 'cid' is missing", () => {
    const result = validate(
      {
        note: "Some note",
        createdAt: "2024-06-15T12:00:00.000Z",
      },
      ids.AppCertifiedSignatureProof,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should require $type since proof is a record type", () => {
    const result = validate(
      {
        cid: "bafyreie5737gdxlw5i64vngml6xvqeatqy3a4erphoqtso54z2eooh4zae",
      },
      ids.AppCertifiedSignatureProof,
      "main",
      true,
    );
    expect(result.success).toBe(false);
  });

  it("should reject an invalid datetime format", () => {
    const result = validate(
      {
        cid: "bafyreie5737gdxlw5i64vngml6xvqeatqy3a4erphoqtso54z2eooh4zae",
        createdAt: "not-a-date",
      },
      ids.AppCertifiedSignatureProof,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });
});
