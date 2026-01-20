/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from "@atproto/lexicon";
import { CID } from "multiformats/cid";
import { validate as _validate } from "../../../lexicons";
import {
  type $Typed,
  is$typed as _is$typed,
  type OmitKey,
} from "../../../util";
import type * as OrgHypercertsDefs from "../../org/hypercerts/defs.js";

const is$typed = _is$typed,
  validate = _validate;
const id = "app.certified.location";

export interface Main {
  $type: "app.certified.location";
  /** The version of the Location Protocol */
  lpVersion: string;
  /** The Spatial Reference System URI (e.g., http://www.opengis.net/def/crs/OGC/1.3/CRS84) that defines the coordinate system. */
  srs: string;
  /** An identifier for the format of the location data (e.g., coordinate-decimal, geojson-point) */
  locationType: "coordinate-decimal" | "geojson-point" | (string & {});
  location:
    | $Typed<OrgHypercertsDefs.Uri>
    | $Typed<OrgHypercertsDefs.SmallBlob>
    | { $type: string };
  /** Optional name for this location */
  name?: string;
  /** Optional description for this location */
  description?: string;
  /** Client-declared timestamp when this record was originally created */
  createdAt: string;
  [k: string]: unknown;
}

const hashMain = "main";

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain);
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain, true);
}

export {
  type Main as Record,
  isMain as isRecord,
  validateMain as validateRecord,
};
