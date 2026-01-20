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
import type * as PubLeafletPagesLinearDocument from "../../../pub/leaflet/pages/linearDocument.js";
import type * as OrgHypercertsClaimActivity from "./activity.js";

const is$typed = _is$typed,
  validate = _validate;
const id = "org.hypercerts.claim.collection";

export interface Main {
  $type: "org.hypercerts.claim.collection";
  /** The type of this group. Can be 'project', 'collection', or any other custom type string. */
  type: string;
  /** The title of this collection */
  title: string;
  /** A short description of this collection */
  shortDescription?: string;
  description?: PubLeafletPagesLinearDocument.Main;
  /** Primary avatar image representing this collection across apps and views; typically a square image. */
  avatar?: BlobRef;
  /** The cover photo of this collection. */
  coverPhoto?: BlobRef;
  /** Array of activities with their associated weights in this collection */
  activities?: OrgHypercertsClaimActivity.ActivityWeight[];
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
