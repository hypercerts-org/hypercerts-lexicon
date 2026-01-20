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
import type * as OrgHypercertsDefs from "../defs.js";

const is$typed = _is$typed,
  validate = _validate;
const id = "org.hypercerts.claim.evidence";

export interface Main {
  $type: "org.hypercerts.claim.evidence";
  subject?: ComAtprotoRepoStrongRef.Main;
  content:
    | $Typed<OrgHypercertsDefs.Uri>
    | $Typed<OrgHypercertsDefs.SmallBlob>
    | { $type: string };
  /** Title to describe the nature of the evidence. */
  title: string;
  /** Short description explaining what this evidence shows. */
  shortDescription?: string;
  /** Longer description describing the evidence in more detail. */
  description?: string;
  /** How this evidence relates to the subject. */
  relationType?: "supports" | "challenges" | "clarifies" | (string & {});
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
