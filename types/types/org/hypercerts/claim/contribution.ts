/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from "@atproto/lexicon";
import { CID } from "multiformats/cid";
import { validate as _validate } from "../../../../lexicons";
import {
  type $Typed,
  is$typed as _is$typed,
  type OmitKey,
} from "../../../../util";

const is$typed = _is$typed,
  validate = _validate;
const id = "org.hypercerts.claim.contribution";

export interface Main {
  $type: "org.hypercerts.claim.contribution";
  /** Role or title of the contributor(s). */
  role?: string;
  /** List of the contributors (names, pseudonyms, or DIDs). If multiple contributors are stored in the same hypercertContribution, then they would have the exact same role. */
  contributors: string[];
  /** What the contribution concretely achieved */
  description?: string;
  /** When this contribution started. This should be a subset of the hypercert timeframe. */
  startDate?: string;
  /** When this contribution finished.  This should be a subset of the hypercert timeframe. */
  endDate?: string;
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
