/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  type LexiconDoc,
  Lexicons,
  ValidationError,
  type ValidationResult,
} from '@atproto/lexicon'
import { type $Typed, is$typed, maybe$typed } from './util.js'

export const schemaDict = {
  AppCertifiedDefs: {
    lexicon: 1,
    id: 'app.certified.defs',
    defs: {
      uri: {
        type: 'string',
        format: 'uri',
        maxGraphemes: 1000,
        description: 'URI to external data',
      },
      smallBlob: {
        type: 'blob',
        accept: ['*/*'],
        maxSize: 10485760,
        description: 'Blob to external data (up to 10MB)',
      },
      largeBlob: {
        type: 'blob',
        accept: ['*/*'],
        maxSize: 104857600,
        description: 'Blob to external data (up to 100MB)',
      },
    },
  },
  OrgHypercertsClaim: {
    lexicon: 1,
    id: 'org.hypercerts.claim',
    defs: {
      main: {
        type: 'record',
        description: 'A hypercert record tracking impact work.',
        key: 'any',
        record: {
          type: 'object',
          required: [
            'title',
            'shortDescription',
            'createdAt',
            'workScope',
            'workTimeFrameFrom',
            'workTimeFrameTo',
          ],
          properties: {
            title: {
              type: 'string',
              description: 'Title of the hypercert',
              maxLength: 256,
            },
            shortDescription: {
              type: 'string',
              description: 'Short blurb of the impact work done.',
              maxLength: 3000,
              maxGraphemes: 300,
            },
            description: {
              type: 'string',
              description:
                'Optional longer description of the impact work done.',
              maxLength: 30000,
              maxGraphemes: 3000,
            },
            image: {
              type: 'union',
              refs: [
                'lex:app.certified.defs#uri',
                'lex:app.certified.defs#smallBlob',
              ],
              description:
                'The hypercert visual representation as a URI or blob',
            },
            workScope: {
              type: 'string',
              description: 'Scope of the work performed',
              maxLength: 5000,
              maxGraphemes: 1000,
            },
            workTimeFrameFrom: {
              type: 'string',
              format: 'datetime',
              description: 'When the work began',
            },
            workTimeFrameTo: {
              type: 'string',
              format: 'datetime',
              description: 'When the work ended',
            },
            evidence: {
              type: 'array',
              description:
                'Supporting evidence, documentation, or external data URIs',
              items: {
                type: 'ref',
                ref: 'lex:com.atproto.repo.strongRef',
                description:
                  'A strong reference to the evidence that supports this impact claim. The record referenced must conform with the org.hypercerts.claim.evidence lexicon',
              },
              maxLength: 100,
            },
            contributions: {
              type: 'array',
              description:
                'A strong reference to the contributions done to create the impact in the hypercerts. The record referenced must conform with the lexicon org.hypercerts.claim.contributions',
              items: {
                type: 'ref',
                ref: 'lex:com.atproto.repo.strongRef',
              },
            },
            rights: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
              description:
                'A strong reference to the rights that this hypercert has. The record referenced must conform with the lexicon org.hypercerts.claim.rights',
            },
            location: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
              description:
                'A strong reference to the location where the work for done hypercert was located. The record referenced must conform with the lexicon org.hypercerts.claim.location',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Client-declared timestamp when this record was originally created',
            },
          },
        },
      },
    },
  },
  OrgHypercertsClaimContribution: {
    lexicon: 1,
    id: 'org.hypercerts.claim.contribution',
    defs: {
      main: {
        type: 'record',
        description: "A contribution made toward a hypercert's impact.",
        key: 'any',
        record: {
          type: 'object',
          required: ['contributors', 'role', 'createdAt'],
          properties: {
            hypercert: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
              description:
                'A strong reference to the hypercert this contribution is for. The record referenced must conform with the lexicon org.hypercerts.claim.',
            },
            role: {
              type: 'string',
              description: 'Role or title of the contributor(s).',
              maxLength: 100,
            },
            contributors: {
              type: 'array',
              description:
                'List of DIDs identifying the contributors. If multiple are stored in the same hypercertContribution, then they would have the exact same role.',
              items: {
                type: 'string',
                format: 'did',
              },
            },
            description: {
              type: 'string',
              description: 'What the contribution concretely achieved',
              maxLength: 2000,
              maxGraphemes: 500,
            },
            workTimeframeFrom: {
              type: 'string',
              format: 'datetime',
              description:
                'When this contribution started. This should be a subset of the hypercert timeframe.',
            },
            workTimeframeTo: {
              type: 'string',
              format: 'datetime',
              description:
                'When this contribution finished.  This should be a subset of the hypercert timeframe.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Client-declared timestamp when this record was originally created',
            },
          },
        },
      },
    },
  },
  OrgHypercertsClaimEvaluation: {
    lexicon: 1,
    id: 'org.hypercerts.claim.evaluation',
    defs: {
      main: {
        type: 'record',
        description: 'An evaluation of a hypercert or other claim',
        key: 'tid',
        record: {
          type: 'object',
          required: ['subject', 'evaluators', 'summary', 'createdAt'],
          properties: {
            subject: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
              description:
                'A strong reference to the evaluated claim. (e.g measurement, hypercert, contribution, etc)',
            },
            evaluators: {
              type: 'array',
              description: 'DIDs of the evaluators',
              items: {
                type: 'string',
                format: 'did',
              },
              maxLength: 100,
            },
            evaluations: {
              type: 'array',
              description:
                'Evaluation data (URIs or blobs) containing detailed reports or methodology',
              items: {
                type: 'union',
                refs: [
                  'lex:app.certified.defs#uri',
                  'lex:app.certified.defs#smallBlob',
                ],
              },
              maxLength: 100,
            },
            summary: {
              type: 'string',
              description: 'Brief evaluation summary',
              maxLength: 5000,
              maxGraphemes: 1000,
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Client-declared timestamp when this record was originally created',
            },
          },
        },
      },
    },
  },
  OrgHypercertsClaimEvidence: {
    lexicon: 1,
    id: 'org.hypercerts.claim.evidence',
    defs: {
      main: {
        type: 'record',
        description: 'A piece of evidence supporting a hypercert claim',
        key: 'any',
        record: {
          type: 'object',
          required: ['content', 'shortDescription', 'createdAt'],
          properties: {
            content: {
              type: 'union',
              refs: [
                'lex:app.certified.defs#uri',
                'lex:app.certified.defs#smallBlob',
              ],
              description:
                'A piece of evidence (URI or blobs) supporting a hypercert claim',
            },
            title: {
              type: 'string',
              maxLength: 256,
              description:
                'Optional title to describe the nature of the evidence',
            },
            shortDescription: {
              type: 'string',
              maxLength: 3000,
              maxGraphemes: 300,
              description:
                'Short description explaining what this evidence demonstrates or proves',
            },
            description: {
              type: 'string',
              description:
                'Optional longer description describing the impact claim evidence.',
              maxLength: 30000,
              maxGraphemes: 3000,
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Client-declared timestamp when this hypercert claim was originally created',
            },
          },
        },
      },
    },
  },
  OrgHypercertsClaimMeasurement: {
    lexicon: 1,
    id: 'org.hypercerts.claim.measurement',
    defs: {
      main: {
        type: 'record',
        description: 'External measurement data supporting a hypercert claim',
        key: 'tid',
        record: {
          type: 'object',
          required: ['hypercert', 'measurers', 'metric', 'value', 'createdAt'],
          properties: {
            hypercert: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
              description:
                'A strong reference to the hypercert that this measurement is for. The record referenced must conform with the lexicon org.hypercerts.claim.',
            },
            measurers: {
              type: 'array',
              description:
                'DIDs of the entity (or entities) that measured this data',
              items: {
                type: 'string',
                format: 'did',
              },
              maxLength: 100,
            },
            metric: {
              type: 'string',
              description: 'The metric being measured',
              maxLength: 500,
            },
            value: {
              type: 'string',
              description: 'The measured value',
              maxLength: 500,
            },
            measurementMethodURI: {
              type: 'string',
              format: 'uri',
              description:
                'URI to methodology documentation, standard protocol, or measurement procedure',
            },
            evidenceURI: {
              type: 'array',
              description: 'URIs to supporting evidence or data',
              items: {
                type: 'string',
                format: 'uri',
              },
              maxLength: 50,
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Client-declared timestamp when this record was originally created',
            },
          },
        },
      },
    },
  },
  OrgHypercertsClaimRights: {
    lexicon: 1,
    id: 'org.hypercerts.claim.rights',
    defs: {
      main: {
        type: 'record',
        description:
          'Describes the rights that a user has with a hypercert, such as whether it can be sold, transferred, and under what conditions.',
        key: 'any',
        record: {
          type: 'object',
          required: [
            'rightsName',
            'rightsType',
            'rightsDescription',
            'createdAt',
          ],
          properties: {
            rightsName: {
              type: 'string',
              description: 'Full name of the rights',
              maxLength: 100,
            },
            rightsType: {
              type: 'string',
              description: 'Short rights identifier for easier search',
              maxLength: 10,
            },
            rightsDescription: {
              type: 'string',
              description: 'Description of the rights of this hypercert',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Client-declared timestamp when this record was originally created',
            },
          },
        },
      },
    },
  },
  AppCertifiedLocation: {
    lexicon: 1,
    id: 'app.certified.location',
    defs: {
      main: {
        type: 'record',
        description: 'A location reference',
        key: 'any',
        record: {
          type: 'object',
          required: [
            'lpVersion',
            'srs',
            'locationType',
            'location',
            'createdAt',
          ],
          properties: {
            lpVersion: {
              type: 'string',
              description: 'The version of the Location Protocol',
              maxLength: 10,
            },
            srs: {
              type: 'string',
              format: 'uri',
              description:
                'The Spatial Reference System URI (e.g., http://www.opengis.net/def/crs/OGC/1.3/CRS84) that defines the coordinate system.',
              maxLength: 100,
            },
            locationType: {
              type: 'string',
              description:
                'An identifier for the format of the location data (e.g., coordinate-decimal, geojson-point)',
              knownValues: ['coordinate-decimal', 'geojson-point'],
              maxLength: 20,
            },
            location: {
              type: 'union',
              refs: [
                'lex:app.certified.defs#uri',
                'lex:app.certified.defs#smallBlob',
              ],
              description:
                'The location of where the work was performed as a URI or blob.',
            },
            name: {
              type: 'string',
              description: 'Optional name for this location',
              maxLength: 1000,
              maxGraphemes: 100,
            },
            description: {
              type: 'string',
              description: 'Optional description for this location',
              maxLength: 2000,
              maxGraphemes: 500,
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Client-declared timestamp when this record was originally created',
            },
          },
        },
      },
    },
  },
  ComAtprotoRepoStrongRef: {
    lexicon: 1,
    id: 'com.atproto.repo.strongRef',
    description: 'A URI with a content-hash fingerprint.',
    defs: {
      main: {
        type: 'object',
        required: ['uri', 'cid'],
        properties: {
          uri: {
            type: 'string',
            format: 'at-uri',
          },
          cid: {
            type: 'string',
            format: 'cid',
          },
        },
      },
    },
  },
} as const satisfies Record<string, LexiconDoc>
export const schemas = Object.values(schemaDict) satisfies LexiconDoc[]
export const lexicons: Lexicons = new Lexicons(schemas)

export function validate<T extends { $type: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType: true,
): ValidationResult<T>
export function validate<T extends { $type?: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: false,
): ValidationResult<T>
export function validate(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: boolean,
): ValidationResult {
  return (requiredType ? is$typed : maybe$typed)(v, id, hash)
    ? lexicons.validate(`${id}#${hash}`, v)
    : {
        success: false,
        error: new ValidationError(
          `Must be an object with "${hash === 'main' ? id : `${id}#${hash}`}" $type property`,
        ),
      }
}

export const ids = {
  AppCertifiedDefs: 'app.certified.defs',
  OrgHypercertsClaim: 'org.hypercerts.claim',
  OrgHypercertsClaimContribution: 'org.hypercerts.claim.contribution',
  OrgHypercertsClaimEvaluation: 'org.hypercerts.claim.evaluation',
  OrgHypercertsClaimEvidence: 'org.hypercerts.claim.evidence',
  OrgHypercertsClaimMeasurement: 'org.hypercerts.claim.measurement',
  OrgHypercertsClaimRights: 'org.hypercerts.claim.rights',
  AppCertifiedLocation: 'app.certified.location',
  ComAtprotoRepoStrongRef: 'com.atproto.repo.strongRef',
} as const
