/**
 * Type aliases for better interface names
 * 
 * Since ATProto requires "main" as the key for records, the generated
 * interfaces are all named "Record". This file provides type aliases
 * with more descriptive names.
 * 
 * Import from this file instead of the generated files for better type names.
 */

// Re-export types with better names
export type { Record as ContributionClaim } from './org/hypercerts/claim/contribution.js'
export type { Record as HypercertClaim } from './org/hypercerts/claim.js'
export type { Record as EvaluationClaim } from './org/hypercerts/claim/evaluation.js'
export type { Record as EvidenceClaim } from './org/hypercerts/claim/evidence.js'
export type { Record as MeasurementClaim } from './org/hypercerts/claim/measurement.js'
export type { Record as RightsClaim } from './org/hypercerts/claim/rights.js'
export type { Record as Location } from './app/certified/location.js'

// Re-export validation functions with better names
export {
  isRecord as isContributionClaim,
  validateRecord as validateContributionClaim,
} from './org/hypercerts/claim/contribution.js'

export {
  isRecord as isHypercertClaim,
  validateRecord as validateHypercertClaim,
} from './org/hypercerts/claim.js'

export {
  isRecord as isEvaluationClaim,
  validateRecord as validateEvaluationClaim,
} from './org/hypercerts/claim/evaluation.js'

export {
  isRecord as isEvidenceClaim,
  validateRecord as validateEvidenceClaim,
} from './org/hypercerts/claim/evidence.js'

export {
  isRecord as isMeasurementClaim,
  validateRecord as validateMeasurementClaim,
} from './org/hypercerts/claim/measurement.js'

export {
  isRecord as isRightsClaim,
  validateRecord as validateRightsClaim,
} from './org/hypercerts/claim/rights.js'

export {
  isRecord as isLocation,
  validateRecord as validateLocation,
} from './app/certified/location.js'

