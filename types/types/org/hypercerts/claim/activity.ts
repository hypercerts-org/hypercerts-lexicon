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
import type * as ComAtprotoRepoStrongRef from "../../../com/atproto/repo/strongRef.js";

const is$typed = _is$typed,
  validate = _validate;
const id = "org.hypercerts.claim.activity";

export interface Main {
  $type: "org.hypercerts.claim.activity";
  /** Title of the hypercert. */
  title: string;
  /** Short blurb of the impact work done. */
  shortDescription: string;
  /** Optional longer description of the impact work done. */
  description?: string;
  image?:
    | $Typed<OrgHypercertsDefs.Uri>
    | $Typed<OrgHypercertsDefs.SmallImage>
    | { $type: string };
  workScope?: WorkScope;
  /** When the work began */
  startDate: string;
  /** When the work ended */
  endDate: string;
  /** A strong reference to the contributions done to create the impact in the hypercerts. The record referenced must conform with the lexicon org.hypercerts.claim.contribution. */
  contributions?: ComAtprotoRepoStrongRef.Main[];
  rights?: ComAtprotoRepoStrongRef.Main;
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

/** Logical scope of the work using label-based conditions. All labels in `withinAllOf` must apply; at least one label in `withinAnyOf` must apply if provided; no label in `withinNoneOf` may apply. */
export interface WorkScope {
  $type?: "org.hypercerts.claim.activity#workScope";
  /** Labels that MUST all hold for the scope to apply. */
  withinAllOf?: string[];
  /** Labels of which AT LEAST ONE must hold (optional). If omitted or empty, imposes no additional condition. */
  withinAnyOf?: string[];
  /** Labels that MUST NOT hold for the scope to apply. */
  withinNoneOf?: string[];
}

const hashWorkScope = "workScope";

export function isWorkScope<V>(v: V) {
  return is$typed(v, id, hashWorkScope);
}

export function validateWorkScope<V>(v: V) {
  return validate<WorkScope & V>(v, id, hashWorkScope);
}

export interface ActivityWeight {
  $type?: "org.hypercerts.claim.activity#activityWeight";
  activity: ComAtprotoRepoStrongRef.Main;
  /** The relative weight/importance of this hypercert activity (stored as a string to avoid float precision issues). Weights can be any positive numeric values and do not need to sum to a specific total; normalization can be performed by the consuming application as needed. */
  weight: string;
}

const hashActivityWeight = "activityWeight";

export function isActivityWeight<V>(v: V) {
  return is$typed(v, id, hashActivityWeight);
}

export function validateActivityWeight<V>(v: V) {
  return validate<ActivityWeight & V>(v, id, hashActivityWeight);
}
