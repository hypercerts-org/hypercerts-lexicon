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
import type * as ComAtprotoRepoStrongRef from '../../../com/atproto/repo/strongRef.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'org.hypercerts.claim.measurement'

export interface Record {
  $type: 'org.hypercerts.claim.measurement'
  hypercert: ComAtprotoRepoStrongRef.Main
  /** DIDs of the entity (or entities) that measured this data. */
  measurers: string[]
  /** The metric being measured */
  metric: string
  /** The measured value */
  value: string
  /** URI to methodology documentation, standard protocol, or measurement procedure */
  measurementMethodURI?: string
  /** URIs to supporting evidence or data */
  evidenceURI?: string[]
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
