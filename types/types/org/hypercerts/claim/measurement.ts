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

const is$typed = _is$typed,
  validate = _validate;
const id = "org.hypercerts.claim.measurement";

export interface Main {
  $type: "org.hypercerts.claim.measurement";
  subject?: ComAtprotoRepoStrongRef.Main;
  /** DIDs of the entity (or entities) that measured this data */
  measurers: AppCertifiedDefs.Did[];
  /** The metric being measured */
  metric: string;
  /** The measured value */
  value: string;
  /** Short identifier for the measurement methodology */
  methodType?: string;
  /** URI to methodology documentation, standard protocol, or measurement procedure */
  methodURI?: string;
  /** URIs to related evidence or underlying data (e.g. org.hypercerts.claim.evidence records or raw datasets) */
  evidenceURI?: string[];
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
