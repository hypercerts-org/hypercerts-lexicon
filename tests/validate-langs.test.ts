import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons";
import * as Collection from "../generated/types/org/hypercerts/collection";
import * as Activity from "../generated/types/org/hypercerts/claim/activity";
import * as Attachment from "../generated/types/org/hypercerts/context/attachment";
import * as Feature from "../generated/types/org/hypercerts/entity/feature";
import * as Profile from "../generated/types/app/certified/actor/profile";
import * as Organization from "../generated/types/app/certified/actor/organization";

// `langs` is a cross-cutting optional field (TECH-712). One test file covers
// every carrier rather than six near-identical files.

const createdAt = "2026-10-20T00:00:00Z";

const carriers = [
  {
    name: "org.hypercerts.collection",
    id: ids.OrgHypercertsCollection,
    validateMain: Collection.validateMain,
    base: { title: "Bosque Vivo", createdAt },
  },
  {
    name: "org.hypercerts.claim.activity",
    id: ids.OrgHypercertsClaimActivity,
    validateMain: Activity.validateMain,
    base: {
      title: "Reforestación Oaxaca",
      shortDescription: "Plantamos 300 árboles esta semana",
      createdAt,
    },
  },
  {
    name: "org.hypercerts.context.attachment",
    id: ids.OrgHypercertsContextAttachment,
    validateMain: Attachment.validateMain,
    base: { title: "Actualización de octubre", createdAt },
  },
  {
    name: "org.hypercerts.entity.feature",
    id: ids.OrgHypercertsEntityFeature,
    validateMain: Feature.validateMain,
    base: { title: "Zona norte", createdAt },
  },
  {
    name: "app.certified.actor.profile",
    id: ids.AppCertifiedActorProfile,
    validateMain: Profile.validateMain,
    base: { createdAt },
  },
  {
    name: "app.certified.actor.organization",
    id: ids.AppCertifiedActorOrganization,
    validateMain: Organization.validateMain,
    base: { createdAt },
  },
] as const;

describe.each(carriers)("$name langs", ({ id, validateMain, base }) => {
  const record = (langs: unknown) => ({ $type: id, ...base, langs });

  it("accepts a single BCP-47 tag", () => {
    const result = validateMain(record(["es"]));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.langs).toEqual(["es"]);
    }
  });

  it("accepts up to three tags, including region subtags", () => {
    const result = validateMain(record(["es", "en", "pt-BR"]));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.langs).toEqual(["es", "en", "pt-BR"]);
    }
  });

  it("remains optional", () => {
    expect(validateMain({ $type: id, ...base }).success).toBe(true);
  });

  it.each([
    ["four tags", ["es", "en", "pt", "fr"]],
    ["a string instead of an array", "es"],
    ["a malformed tag", ["not a language"]],
    ["a non-string item", [42]],
  ])("rejects %s", (_label, langs) => {
    expect(validate(record(langs), id, "main", false).success).toBe(false);
  });
});
