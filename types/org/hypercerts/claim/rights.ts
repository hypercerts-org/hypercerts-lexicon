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

const is$typed = _is$typed,
  validate = _validate
const id = 'org.hypercerts.claim.rights'

export interface Record {
  $type: 'org.hypercerts.claim.rights'
  /** Full name of the rights */
  rightsName: string
  /** Short rights identifier for easier search */
  rightsType: string
  /** Description of the rights of this hypercert */
  rightsDescription: string
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
