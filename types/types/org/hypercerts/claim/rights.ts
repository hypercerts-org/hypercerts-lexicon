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
import type * as OrgHypercertsDefs from "../defs.js";

const is$typed = _is$typed,
  validate = _validate;
const id = "org.hypercerts.claim.rights";

export interface Main {
  $type: "org.hypercerts.claim.rights";
  /** Full name of the rights */
  rightsName: string;
  /** Short rights identifier for easier search */
  rightsType: string;
  /** Description of the rights of this hypercert */
  rightsDescription: string;
  attachment?:
    | $Typed<OrgHypercertsDefs.Uri>
    | $Typed<OrgHypercertsDefs.SmallBlob>
    | { $type: string };
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
