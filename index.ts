/**
 * Main entry point for hypercerts-lexicon
 * Exports only types, excluding client classes
 */

// Export all type namespaces
export * as AppCertifiedDefs from './types/app/certified/defs.js'
export * as OrgHypercertsClaim from './types/org/hypercerts/claim.js'
export * as OrgHypercertsClaimContribution from './types/org/hypercerts/claim/contribution.js'
export * as OrgHypercertsClaimEvaluation from './types/org/hypercerts/claim/evaluation.js'
export * as OrgHypercertsClaimEvidence from './types/org/hypercerts/claim/evidence.js'
export * as OrgHypercertsClaimMeasurement from './types/org/hypercerts/claim/measurement.js'
export * as OrgHypercertsClaimRights from './types/org/hypercerts/claim/rights.js'
export * as AppCertifiedLocation from './types/app/certified/location.js'
export * as ComAtprotoRepoStrongRef from './types/com/atproto/repo/strongRef.js'

// Export named types
export type { Record as ContributionClaim } from './types/org/hypercerts/claim/contribution.js'
export type { Record as HypercertClaim } from './types/org/hypercerts/claim.js'
export type { Record as EvaluationClaim } from './types/org/hypercerts/claim/evaluation.js'
export type { Record as EvidenceClaim } from './types/org/hypercerts/claim/evidence.js'
export type { Record as MeasurementClaim } from './types/org/hypercerts/claim/measurement.js'
export type { Record as RightsClaim } from './types/org/hypercerts/claim/rights.js'
export type { Record as Location } from './types/app/certified/location.js'

// Export validation functions
export {
  isRecord as isContributionClaim,
  validateRecord as validateContributionClaim,
} from './types/org/hypercerts/claim/contribution.js'

export {
  isRecord as isHypercertClaim,
  validateRecord as validateHypercertClaim,
} from './types/org/hypercerts/claim.js'

export {
  isRecord as isEvaluationClaim,
  validateRecord as validateEvaluationClaim,
} from './types/org/hypercerts/claim/evaluation.js'

export {
  isRecord as isEvidenceClaim,
  validateRecord as validateEvidenceClaim,
} from './types/org/hypercerts/claim/evidence.js'

export {
  isRecord as isMeasurementClaim,
  validateRecord as validateMeasurementClaim,
} from './types/org/hypercerts/claim/measurement.js'

export {
  isRecord as isRightsClaim,
  validateRecord as validateRightsClaim,
} from './types/org/hypercerts/claim/rights.js'

export {
  isRecord as isLocation,
  validateRecord as validateLocation,
} from './types/app/certified/location.js'

