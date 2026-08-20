import { describe, expect, it } from "vitest";
import { ids, schemaDict } from "../generated/lexicons";
import * as Location from "../generated/types/app/certified/location";

describe("app.certified.location", () => {
  it("accepts an inline ISO country-code location", () => {
    const result = Location.validateMain({
      $type: ids.AppCertifiedLocation,
      lpVersion: "1.0",
      // Required by the Location Protocol base model but ignored for country codes.
      srs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
      locationType: "country-code",
      location: {
        $type: "app.certified.location#string",
        string: "CH",
      },
      createdAt: "2026-08-20T00:00:00Z",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.locationType).toBe("country-code");
      const location = result.value.location;
      expect(Location.isString(location)).toBe(true);
      if (Location.isString(location)) {
        expect(location.string).toBe("CH");
      }
    }
  });

  it("publishes country-code as a recognized location type", () => {
    const locationType =
      schemaDict.AppCertifiedLocation.defs.main.record.properties.locationType;

    expect(locationType.knownValues).toContain("country-code");
  });
});
