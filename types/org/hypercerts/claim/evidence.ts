/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../../lexicons'
import {
  type $Typed,
  is$typed as _is$typed,
  type OmitKey,
} from '../../../../util'
import type * as AppCertifiedDefs from '../../../app/certified/defs.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'org.hypercerts.claim.evidence'

export interface Record {
  $type: 'org.hypercerts.claim.evidence'
  content:
    | $Typed<AppCertifiedDefs.Uri>
    | $Typed<AppCertifiedDefs.SmallBlob>
    | { $type: string }
  /** Optional title to describe the nature of the evidence */
  title?: string
  /** Short description explaining what this evidence demonstrates or proves */
  shortDescription: string
  /** Optional longer description describing the impact claim evidence. */
  description?: string
  /** Client-declared timestamp when this hypercert claim was originally created */
  createdAt: string
  [k: string]: unknown
}

const hashRecord = 'main'

export function isRecord<V>(v: V) {
  return is$typed(v, id, hashRecord)
}

export function validateRecord<V>(v: V) {
  return validate<Record & V>(v, id, hashRecord, true)
}
