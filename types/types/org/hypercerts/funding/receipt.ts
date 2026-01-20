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
import type * as AppCertifiedDefs from "../../../app/certified/defs.js";

const is$typed = _is$typed,
  validate = _validate;
const id = "org.hypercerts.funding.receipt";

export interface Main {
  $type: "org.hypercerts.funding.receipt";
  from: AppCertifiedDefs.Did;
  /** The recipient of the funds. Can be identified by DID or a clear-text name. */
  to: string;
  /** Amount of funding received. */
  amount: string;
  /** Currency of the payment (e.g. EUR, USD, ETH). */
  currency: string;
  /** How the funds were transferred (e.g. bank_transfer, credit_card, onchain, cash, check, payment_processor). */
  paymentRail?: string;
  /** Optional network within the payment rail (e.g. arbitrum, ethereum, sepa, visa, paypal). */
  paymentNetwork?: string;
  /** Identifier of the underlying payment transaction (e.g. bank reference, onchain transaction hash, or processor-specific ID). Use paymentNetwork to specify the network where applicable. */
  transactionId?: string;
  /** Optional reference to the activity, project, or organization this funding relates to. */
  for?: string;
  /** Optional notes or additional context for this funding receipt. */
  notes?: string;
  /** Timestamp when the payment occurred. */
  occurredAt?: string;
  /** Client-declared timestamp when this receipt record was created. */
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
