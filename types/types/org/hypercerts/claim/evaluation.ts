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
import type * as ComAtprotoRepoStrongRef from "../../../com/atproto/repo/strongRef.js";
import type * as AppCertifiedDefs from "../../../app/certified/defs.js";
import type * as OrgHypercertsDefs from "../defs.js";

const is$typed = _is$typed,
  validate = _validate;
const id = "org.hypercerts.claim.evaluation";

/** Overall score for an evaluation on a numeric scale. */
export interface Score {
  $type?: "org.hypercerts.claim.evaluation#score";
  /** Minimum value of the scale, e.g. 0 or 1. */
  min: number;
  /** Maximum value of the scale, e.g. 5 or 10. */
  max: number;
  /** Score within the inclusive range [min, max]. */
  value: number;
}

const hashScore = "score";

export function isScore<V>(v: V) {
  return is$typed(v, id, hashScore);
}

export function validateScore<V>(v: V) {
  return validate<Score & V>(v, id, hashScore);
}

export interface Main {
  $type: "org.hypercerts.claim.evaluation";
  subject?: ComAtprotoRepoStrongRef.Main;
  /** DIDs of the evaluators */
  evaluators: AppCertifiedDefs.Did[];
  /** Evaluation data (URIs or blobs) containing detailed reports or methodology */
  content?: (
    | $Typed<OrgHypercertsDefs.Uri>
    | $Typed<OrgHypercertsDefs.SmallBlob>
    | { $type: string }
  )[];
  /** Optional references to the measurements that contributed to this evaluation. The record(s) referenced must conform with the lexicon org.hypercerts.claim.measurement */
  measurements?: ComAtprotoRepoStrongRef.Main[];
  /** Brief evaluation summary */
  summary: string;
  score?: Score;
  location?: ComAtprotoRepoStrongRef.Main;
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
