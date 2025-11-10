/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../lexicons'
import { type $Typed, is$typed as _is$typed, type OmitKey } from '../../../util'
import type * as AppCertifiedDefs from './defs.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'app.certified.location'

export interface Record {
  $type: 'app.certified.location'
  /** The version of the Location Protocol */
  lpVersion: string
  /** The Spatial Reference System URI (e.g., http://www.opengis.net/def/crs/OGC/1.3/CRS84) that defines the coordinate system. */
  srs: string
  /** An identifier for the format of the location data (e.g., coordinate-decimal, geojson-point) */
  locationType: 'coordinate-decimal' | 'geojson-point' | (string & {})
  location:
    | $Typed<AppCertifiedDefs.Uri>
    | $Typed<AppCertifiedDefs.SmallBlob>
    | { $type: string }
  /** Optional name for this location */
  name?: string
  /** Optional description for this location */
  description?: string
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
