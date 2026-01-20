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
import type * as AppCertifiedDefs from "../defs.js";

const is$typed = _is$typed,
  validate = _validate;
const id = "app.certified.badge.definition";

export interface Main {
  $type: "app.certified.badge.definition";
  /** Category of the badge (e.g. endorsement, participation, affiliation). */
  badgeType: string;
  /** Human-readable title of the badge. */
  title: string;
  /** Icon representing the badge, stored as a blob for compact visual display. */
  icon: BlobRef;
  /** Optional short statement describing what the badge represents. */
  description?: string;
  /** Optional allowlist of DIDs allowed to issue this badge. If omitted, anyone may issue it. */
  allowedIssuers?: AppCertifiedDefs.Did[];
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
