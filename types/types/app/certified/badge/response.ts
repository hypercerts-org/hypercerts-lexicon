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
import type * as AppCertifiedBadgeAward from "./award.js";

const is$typed = _is$typed,
  validate = _validate;
const id = "app.certified.badge.response";

export interface Main {
  $type: "app.certified.badge.response";
  badgeAward: AppCertifiedBadgeAward.Main;
  /** The recipient’s response for the badge (accepted or rejected). */
  response: "accepted" | "rejected";
  /** Optional relative weight for accepted badges, assigned by the recipient. */
  weight?: string;
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
