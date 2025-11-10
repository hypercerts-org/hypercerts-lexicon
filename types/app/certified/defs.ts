/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../lexicons'
import { type $Typed, is$typed as _is$typed, type OmitKey } from '../../../util'

const is$typed = _is$typed,
  validate = _validate
const id = 'app.certified.defs'

/** URI to external data */
export type Uri = string
/** Blob to external data (up to 10MB) */
export type SmallBlob = BlobRef
/** Blob to external data (up to 100MB) */
export type LargeBlob = BlobRef
