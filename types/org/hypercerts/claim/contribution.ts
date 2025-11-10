/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../lexicons'
import {
  type $Typed,
  is$typed as _is$typed,
  type OmitKey,
} from '../../../util'
import type * as ComAtprotoRepoStrongRef from '../../../com/atproto/repo/strongRef.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'org.hypercerts.claim.contribution'

export interface Record {
  $type: 'org.hypercerts.claim.contribution'
  hypercert?: ComAtprotoRepoStrongRef.Main
  /** Role or title of the contributor(s). */
  role: string
  /** List of DIDs identifying the contributors. If multiple are stored in the same hypercertContribution, then they would have the exact same role. */
  contributors: string[]
  /** What the contribution concretely achieved */
  description?: string
  /** When this contribution started. This should be a subset of the hypercert timeframe. */
  workTimeframeFrom?: string
  /** When this contribution finished.  This should be a subset of the hypercert timeframe. */
  workTimeframeTo?: string
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
