import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons";
import * as FundingReceipt from "../generated/types/org/hypercerts/funding/receipt";

const validBase = {
  to: { $type: "app.certified.defs#did", did: "did:plc:recipient123" },
  amount: "1000.00",
  currency: "USD",
  createdAt: "2024-01-01T00:00:00Z",
};

describe("org.hypercerts.funding.receipt", () => {
  it("should accept a valid record with all required fields", () => {
    const result = FundingReceipt.validateMain({
      $type: ids.OrgHypercertsFundingReceipt,
      ...validBase,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.to).toMatchObject({ did: "did:plc:recipient123" });
      expect(result.value.amount).toBe("1000.00");
      expect(result.value.currency).toBe("USD");
    }
  });

  it("should accept a valid record without the optional 'from' field (anonymous sender)", () => {
    const result = FundingReceipt.validateMain({
      $type: ids.OrgHypercertsFundingReceipt,
      ...validBase,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.from).toBeUndefined();
    }
  });

  it("should accept a valid record with 'from' as a DID", () => {
    const result = FundingReceipt.validateMain({
      $type: ids.OrgHypercertsFundingReceipt,
      ...validBase,
      from: { $type: "app.certified.defs#did", did: "did:plc:abc123" },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.from).toMatchObject({ did: "did:plc:abc123" });
    }
  });

  it("should accept 'to' as a strongRef", () => {
    const result = FundingReceipt.validateMain({
      $type: ids.OrgHypercertsFundingReceipt,
      to: {
        $type: "com.atproto.repo.strongRef",
        uri: "at://did:plc:recipient123/org.hypercerts.contributor.information/tid456",
        cid: "bafyreie5737gdxlw5i64vngml6xvqeatqy3a4erphoqtso54z2eooh4zae",
      },
      amount: "1000.00",
      currency: "USD",
      createdAt: "2024-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("should accept 'from' as a strongRef", () => {
    const result = FundingReceipt.validateMain({
      $type: ids.OrgHypercertsFundingReceipt,
      ...validBase,
      from: {
        $type: "com.atproto.repo.strongRef",
        uri: "at://did:plc:abc123/org.hypercerts.contributor.information/tid789",
        cid: "bafyreie5737gdxlw5i64vngml6xvqeatqy3a4erphoqtso54z2eooh4zae",
      },
    });
    expect(result.success).toBe(true);
  });

  it("should accept 'to' as a text string", () => {
    const result = FundingReceipt.validateMain({
      $type: ids.OrgHypercertsFundingReceipt,
      to: {
        $type: "org.hypercerts.funding.receipt#text",
        value: "Alice",
      },
      amount: "1000.00",
      currency: "USD",
      createdAt: "2024-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("should accept 'from' as a text string", () => {
    const result = FundingReceipt.validateMain({
      $type: ids.OrgHypercertsFundingReceipt,
      ...validBase,
      from: {
        $type: "org.hypercerts.funding.receipt#text",
        value: "0x1234567890abcdef1234567890abcdef12345678",
      },
    });
    expect(result.success).toBe(true);
  });

  it("should accept a valid record with all optional fields present", () => {
    const result = FundingReceipt.validateMain({
      $type: ids.OrgHypercertsFundingReceipt,
      ...validBase,
      from: { $type: "app.certified.defs#did", did: "did:plc:abc123" },
      netAmount: "985.00",
      netCurrency: "USDC",
      paymentRail: "onchain",
      paymentNetwork: "eip155:1",
      transactionId: "0xabc123",
      for: {
        uri: "at://did:plc:abc123/org.hypercerts.claim.activity/tid123",
        cid: "bafyreie5737gdxlw5i64vngml6xvqeatqy3a4erphoqtso54z2eooh4zae",
      },
      notes: "Quarterly donation",
      occurredAt: "2024-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("should accept a net amount in a different currency from the gross", () => {
    const result = FundingReceipt.validateMain({
      $type: ids.OrgHypercertsFundingReceipt,
      ...validBase,
      amount: "100.00",
      currency: "EUR",
      netAmount: "13250.00",
      netCurrency: "KES",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.amount).toBe("100.00");
      expect(result.value.netAmount).toBe("13250.00");
      expect(result.value.netCurrency).toBe("KES");
    }
  });

  it("should accept a paymentRail outside knownValues (open vocabulary)", () => {
    const result = FundingReceipt.validateMain({
      $type: ids.OrgHypercertsFundingReceipt,
      ...validBase,
      paymentRail: "credit_card",
    });
    expect(result.success).toBe(true);
  });

  it("should reject a netCurrency longer than 10 bytes", () => {
    const result = validate(
      { ...validBase, netAmount: "990.00", netCurrency: "X".repeat(11) },
      ids.OrgHypercertsFundingReceipt,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a record missing the required 'to' field", () => {
    const result = validate(
      { amount: "500", currency: "EUR", createdAt: "2024-01-01T00:00:00Z" },
      ids.OrgHypercertsFundingReceipt,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a record missing the required 'amount' field", () => {
    const result = validate(
      {
        to: { $type: "app.certified.defs#did", did: "did:plc:recipient123" },
        currency: "EUR",
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.OrgHypercertsFundingReceipt,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a record missing the required 'currency' field", () => {
    const result = validate(
      {
        to: { $type: "app.certified.defs#did", did: "did:plc:recipient123" },
        amount: "500",
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.OrgHypercertsFundingReceipt,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a record missing the required 'createdAt' field", () => {
    const result = validate(
      {
        to: { $type: "app.certified.defs#did", did: "did:plc:recipient123" },
        amount: "500",
        currency: "USD",
      },
      ids.OrgHypercertsFundingReceipt,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a record with an invalid 'createdAt' datetime format", () => {
    const result = validate(
      { ...validBase, createdAt: "not-a-datetime" },
      ids.OrgHypercertsFundingReceipt,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a record with an invalid 'occurredAt' datetime format", () => {
    const result = validate(
      { ...validBase, occurredAt: "not-a-datetime" },
      ids.OrgHypercertsFundingReceipt,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should require $type when requiredType is true", () => {
    const result = validate(
      validBase,
      ids.OrgHypercertsFundingReceipt,
      "main",
      true,
    );
    expect(result.success).toBe(false);
  });

  it("should not require $type when requiredType is false", () => {
    const result = validate(
      validBase,
      ids.OrgHypercertsFundingReceipt,
      "main",
      false,
    );
    expect(result.success).toBe(true);
  });
});
