import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons.js";
import * as CreatedVia from "../generated/types/app/certified/actor/createdVia.js";

describe("app.certified.actor.createdVia", () => {
  it("should accept a minimal valid record (required clientId and createdAt)", () => {
    const result = CreatedVia.validateMain({
      $type: ids.AppCertifiedActorCreatedVia,
      clientId: "https://app.certified.one/oauth/client-metadata.json",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.clientId).toBe(
        "https://app.certified.one/oauth/client-metadata.json",
      );
    }
  });

  it("should accept a record with inline signatures", () => {
    const result = CreatedVia.validateMain({
      $type: ids.AppCertifiedActorCreatedVia,
      clientId: "https://app.certified.one/oauth/client-metadata.json",
      createdAt: "2024-01-01T00:00:00.000Z",
      signatures: [
        {
          $type: "app.certified.signature.defs#inline",
          signature: new Uint8Array([1, 2, 3]),
          key: "did:plc:abc123#atproto",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should reject a record missing required clientId", () => {
    const result = validate(
      { createdAt: "2024-01-01T00:00:00.000Z" },
      ids.AppCertifiedActorCreatedVia,
      "main",
      false,
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("should reject a record missing required createdAt", () => {
    const result = validate(
      { clientId: "https://app.certified.one/oauth/client-metadata.json" },
      ids.AppCertifiedActorCreatedVia,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a record with a non-uri clientId", () => {
    const result = validate(
      {
        clientId: "not a uri",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      ids.AppCertifiedActorCreatedVia,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a record with an invalid createdAt format", () => {
    const result = validate(
      {
        clientId: "https://app.certified.one/oauth/client-metadata.json",
        createdAt: "not-a-datetime",
      },
      ids.AppCertifiedActorCreatedVia,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });
});
