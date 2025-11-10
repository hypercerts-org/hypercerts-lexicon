/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../lexicons'
import { type $Typed, is$typed as _is$typed, type OmitKey } from '../../../util'
import type * as AppCertifiedDefs from '../../app/certified/defs.js'
import type * as ComAtprotoRepoStrongRef from '../../com/atproto/repo/strongRef.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'org.hypercerts.claim'

export interface Record {
  $type: 'org.hypercerts.claim'
  /** Title of the hypercert */
  title: string
  /** Short blurb of the impact work done. */
  shortDescription: string
  /** Optional longer description of the impact work done. */
  description?: string
  image?:
    | $Typed<AppCertifiedDefs.Uri>
    | $Typed<AppCertifiedDefs.SmallBlob>
    | { $type: string }
  /** Scope of the work performed */
  workScope: string
  /** When the work began */
  workTimeFrameFrom: string
  /** When the work ended */
  workTimeFrameTo: string
  /** Supporting evidence, documentation, or external data URIs */
  evidence?: ComAtprotoRepoStrongRef.Main[]
  /** A strong reference to the contributions done to create the impact in the hypercerts. The record referenced must conform with the lexicon org.hypercerts.claim.contributions */
  contributions?: ComAtprotoRepoStrongRef.Main[]
  rights?: ComAtprotoRepoStrongRef.Main
  location?: ComAtprotoRepoStrongRef.Main
  /** Client-declared timestamp when this record was originally created */
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
