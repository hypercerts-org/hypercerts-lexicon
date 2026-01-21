<!-- START lex generated content. Please keep comment here to allow auto update -->

## <!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->

## app.certified.badge.award

```json
{
  "lexicon": 1,
  "id": "app.certified.badge.award",
  "defs": {
    "main": {
      "type": "record",
      "description": "Records a badge award to a user, project, or activity claim.",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["badge", "subject", "createdAt"],
        "properties": {
          "badge": {
            "type": "ref",
            "ref": "app.certified.badge.definition",
            "description": "Reference to the badge definition for this award."
          },
          "subject": {
            "type": "union",
            "description": "Entity the badge award is for (either an account DID or any specific AT Protocol record), e.g. a user, a project, or a specific activity claim.",
            "refs": ["app.certified.defs#did", "com.atproto.repo.strongRef"]
          },
          "note": {
            "type": "string",
            "description": "Optional statement explaining the reason for this badge award."
          },
          "createdAt": {
            "type": "string",
            "format": "datetime",
            "description": "Client-declared timestamp when this record was originally created"
          }
        }
      }
    }
  }
}
```

---

## app.certified.badge.definition

```json
{
  "lexicon": 1,
  "id": "app.certified.badge.definition",
  "defs": {
    "main": {
      "type": "record",
      "description": "Defines a badge that can be awarded via badge award records to users, projects, or activity claims.",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["title", "badgeType", "icon", "createdAt"],
        "properties": {
          "badgeType": {
            "type": "string",
            "description": "Category of the badge (e.g. endorsement, participation, affiliation)."
          },
          "title": {
            "type": "string",
            "description": "Human-readable title of the badge."
          },
          "icon": {
            "type": "blob",
            "description": "Icon representing the badge, stored as a blob for compact visual display.",
            "accept": [
              "image/png",
              "image/jpeg",
              "image/webp",
              "image/svg+xml"
            ],
            "maxSize": 1048576
          },
          "description": {
            "type": "string",
            "description": "Optional short statement describing what the badge represents."
          },
          "allowedIssuers": {
            "type": "array",
            "description": "Optional allowlist of DIDs allowed to issue this badge. If omitted, anyone may issue it.",
            "items": {
              "type": "ref",
              "ref": "app.certified.defs#did"
            }
          },
          "createdAt": {
            "type": "string",
            "format": "datetime",
            "description": "Client-declared timestamp when this record was originally created"
          }
        }
      }
    }
  }
}
```

---

## app.certified.badge.response

```json
{
  "lexicon": 1,
  "id": "app.certified.badge.response",
  "defs": {
    "main": {
      "type": "record",
      "description": "Recipient response to a badge award.",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["badgeAward", "response", "createdAt"],
        "properties": {
          "badgeAward": {
            "type": "ref",
            "ref": "app.certified.badge.award",
            "description": "Reference to the badge award."
          },
          "response": {
            "type": "string",
            "enum": ["accepted", "rejected"],
            "description": "The recipient’s response for the badge (accepted or rejected)."
          },
          "weight": {
            "type": "string",
            "description": "Optional relative weight for accepted badges, assigned by the recipient."
          },
          "createdAt": {
            "type": "string",
            "format": "datetime",
            "description": "Client-declared timestamp when this record was originally created"
          }
        }
      }
    }
  }
}
```

---

## app.certified.defs

Common type definitions used across certified protocols.

```json
{
  "lexicon": 1,
  "id": "app.certified.defs",
  "description": "Common type definitions used across certified protocols.",
  "defs": {
    "did": {
      "type": "string",
      "format": "did",
      "description": "A Decentralized Identifier (DID) string."
    }
  }
}
```

---

## app.certified.location

```json
{
  "lexicon": 1,
  "id": "app.certified.location",
  "defs": {
    "main": {
      "type": "record",
      "description": "A location reference",
      "key": "tid",
      "record": {
        "type": "object",
        "required": [
          "lpVersion",
          "srs",
          "locationType",
          "location",
          "createdAt"
        ],
        "properties": {
          "lpVersion": {
            "type": "string",
            "description": "The version of the Location Protocol",
            "maxLength": 10
          },
          "srs": {
            "type": "string",
            "format": "uri",
            "description": "The Spatial Reference System URI (e.g., http://www.opengis.net/def/crs/OGC/1.3/CRS84) that defines the coordinate system.",
            "maxLength": 100
          },
          "locationType": {
            "type": "string",
            "description": "An identifier for the format of the location data (e.g., coordinate-decimal, geojson-point)",
            "knownValues": ["coordinate-decimal", "geojson-point"],
            "maxLength": 20
          },
          "location": {
            "type": "union",
            "refs": [
              "org.hypercerts.defs#uri",
              "org.hypercerts.defs#smallBlob"
            ],
            "description": "The location of where the work was performed as a URI or blob."
          },
          "name": {
            "type": "string",
            "description": "Optional name for this location",
            "maxLength": 1000,
            "maxGraphemes": 100
          },
          "description": {
            "type": "string",
            "description": "Optional description for this location",
            "maxLength": 2000,
            "maxGraphemes": 500
          },
          "createdAt": {
            "type": "string",
            "format": "datetime",
            "description": "Client-declared timestamp when this record was originally created"
          }
        }
      }
    }
  }
}
```

---

## com.atproto.repo.strongRef

A URI with a content-hash fingerprint.

```json
{
  "lexicon": 1,
  "id": "com.atproto.repo.strongRef",
  "description": "A URI with a content-hash fingerprint.",
  "defs": {
    "main": {
      "type": "object",
      "required": ["uri", "cid"],
      "properties": {
        "uri": {
          "type": "string",
          "format": "at-uri"
        },
        "cid": {
          "type": "string",
          "format": "cid"
        }
      }
    }
  }
}
```

---

## org.hypercerts.claim.activity

```json
{
  "lexicon": 1,
  "id": "org.hypercerts.claim.activity",
  "defs": {
    "main": {
      "type": "record",
      "description": "A hypercert record tracking impact work.",
      "key": "any",
      "record": {
        "type": "object",
        "required": ["title", "shortDescription", "createdAt"],
        "properties": {
          "title": {
            "type": "string",
            "description": "Title of the hypercert.",
            "maxLength": 256
          },
          "shortDescription": {
            "type": "string",
            "description": "Short blurb of the impact work done.",
            "maxLength": 3000,
            "maxGraphemes": 300
          },
          "description": {
            "type": "string",
            "description": "Optional longer description of the impact work done.",
            "maxLength": 30000,
            "maxGraphemes": 3000
          },
          "image": {
            "type": "union",
            "refs": [
              "org.hypercerts.defs#uri",
              "org.hypercerts.defs#smallImage"
            ],
            "description": "The hypercert visual representation as a URI or image blob."
          },
          "workScope": {
            "type": "ref",
            "ref": "#workScope"
          },
          "startDate": {
            "type": "string",
            "format": "datetime",
            "description": "When the work began"
          },
          "endDate": {
            "type": "string",
            "format": "datetime",
            "description": "When the work ended"
          },
          "contributions": {
            "type": "array",
            "description": "A strong reference to the contributions done to create the impact in the hypercerts. The record referenced must conform with the lexicon org.hypercerts.claim.contributor.",
            "items": {
              "type": "ref",
              "ref": "com.atproto.repo.strongRef"
            }
          },
          "rights": {
            "type": "ref",
            "ref": "com.atproto.repo.strongRef",
            "description": "A strong reference to the rights that this hypercert has. The record referenced must conform with the lexicon org.hypercerts.claim.rights."
          },
          "locations": {
            "type": "array",
            "description": "An array of strong references to the location where activity was performed. The record referenced must conform with the lexicon app.certified.location.",
            "items": {
              "type": "ref",
              "ref": "com.atproto.repo.strongRef"
            }
          },
          "createdAt": {
            "type": "string",
            "format": "datetime",
            "description": "Client-declared timestamp when this record was originally created"
          }
        }
      }
    },
    "workScope": {
      "type": "object",
      "description": "Logical scope of the work using label-based conditions. All labels in `withinAllOf` must apply; at least one label in `withinAnyOf` must apply if provided; no label in `withinNoneOf` may apply.",
      "properties": {
        "withinAllOf": {
          "type": "array",
          "description": "Labels that MUST all hold for the scope to apply.",
          "items": {
            "type": "string"
          },
          "maxLength": 100
        },
        "withinAnyOf": {
          "type": "array",
          "description": "Labels of which AT LEAST ONE must hold (optional). If omitted or empty, imposes no additional condition.",
          "items": {
            "type": "string"
          },
          "maxLength": 100
        },
        "withinNoneOf": {
          "type": "array",
          "description": "Labels that MUST NOT hold for the scope to apply.",
          "items": {
            "type": "string"
          },
          "maxLength": 100
        }
      }
    },
    "activityWeight": {
      "type": "object",
      "required": ["activity", "weight"],
      "properties": {
        "activity": {
          "type": "ref",
          "ref": "com.atproto.repo.strongRef",
          "description": "A strong reference to a hypercert activity record. This activity must conform to the lexicon org.hypercerts.claim.activity"
        },
        "weight": {
          "type": "string",
          "description": "The relative weight/importance of this hypercert activity (stored as a string to avoid float precision issues). Weights can be any positive numeric values and do not need to sum to a specific total; normalization can be performed by the consuming application as needed."
        }
      }
    }
  }
}
```

---

## org.hypercerts.claim.collection

```json
{
  "lexicon": 1,
  "id": "org.hypercerts.claim.collection",
  "defs": {
    "main": {
      "type": "record",
      "description": "A collection/group of items (activities and/or other collections). Collections support recursive nesting. Use app.certified.location as a sidecar (same TID) for location metadata.",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["title", "items", "createdAt"],
        "properties": {
          "type": {
            "type": "string",
            "description": "The type of this collection. Possible fields can be 'favorites', 'project', or any other type of collection."
          },
          "title": {
            "type": "string",
            "description": "The title of this collection",
            "maxLength": 800,
            "maxGraphemes": 80
          },
          "shortDescription": {
            "type": "string",
            "maxLength": 3000,
            "maxGraphemes": 300,
            "description": "Short summary of this collection, suitable for previews and list views"
          },
          "description": {
            "type": "ref",
            "ref": "pub.leaflet.pages.linearDocument#main",
            "description": "Rich-text description, represented as a Leaflet linear document."
          },
          "items": {
            "type": "array",
            "description": "Array of strong references to items in this collection. Items can be activities (org.hypercerts.claim.activity) and/or other collections (org.hypercerts.claim.collection).",
            "items": {
              "type": "ref",
              "ref": "com.atproto.repo.strongRef"
            }
          },
          "createdAt": {
            "type": "string",
            "format": "datetime",
            "description": "Client-declared timestamp when this record was originally created"
          }
        }
      }
    }
  }
}
```

---

## org.hypercerts.claim.collection.project

```json
{
  "lexicon": 1,
  "id": "org.hypercerts.claim.collection.project",
  "defs": {
    "main": {
      "type": "record",
      "description": "Project-specific metadata for a collection. Uses the sidecar pattern with the same record key (TID) as the collection record. Provides rich-text description capabilities for project-type collections.",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["projectDescription", "createdAt"],
        "properties": {
          "projectTitle": {
            "type": "string",
            "description": "The title of this collection",
            "maxLength": 800,
            "maxGraphemes": 80
          },
          "shortProjectDescription": {
            "type": "string",
            "maxLength": 3000,
            "maxGraphemes": 300,
            "description": "Short summary of this project, suitable for previews and list views"
          },
          "projectDescription": {
            "type": "ref",
            "ref": "pub.leaflet.pages.linearDocument#main",
            "description": "Rich-text description of this project, represented as a Leaflet linear document."
          },
          "avatar": {
            "type": "blob",
            "description": "Primary avatar image representing this project across apps and views; typically a square logo or project identity image.",
            "accept": ["image/png", "image/jpeg"],
            "maxSize": 1000000
          },
          "coverPhoto": {
            "type": "blob",
            "description": "The cover photo of this project.",
            "accept": ["image/png", "image/jpeg"],
            "maxSize": 1000000
          },
          "createdAt": {
            "type": "string",
            "format": "datetime",
            "description": "Client-declared timestamp when this project metadata was created"
          }
        }
      }
    }
  }
}
```

---

## org.hypercerts.claim.contributor

```json
{
  "lexicon": 1,
  "id": "org.hypercerts.claim.contributor",
  "defs": {
    "main": {
      "type": "record",
      "description": "A contribution made toward a hypercert's impact.",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["createdAt"],
        "properties": {
          "identifier": {
            "type": "string",
            "description": "DID or a URI to a social profile of the contributor."
          },
          "displayName": {
            "type": "string",
            "description": "Display name of the contributor.",
            "maxLength": 100
          },
          "image": {
            "type": "union",
            "refs": [
              "org.hypercerts.defs#uri",
              "org.hypercerts.defs#smallImage"
            ],
            "description": "The contributor visual representation as a URI or image blob."
          },
          "role": {
            "type": "string",
            "description": "Role or title of the contributor.",
            "maxLength": 100
          },
          "contributionDescription": {
            "type": "string",
            "description": "What the contribution concretely achieved.",
            "maxLength": 2000,
            "maxGraphemes": 500
          },
          "startDate": {
            "type": "string",
            "format": "datetime",
            "description": "When this contribution started. This should be a subset of the hypercert timeframe."
          },
          "endDate": {
            "type": "string",
            "format": "datetime",
            "description": "When this contribution finished. This should be a subset of the hypercert timeframe."
          },
          "createdAt": {
            "type": "string",
            "format": "datetime",
            "description": "Client-declared timestamp when this record was originally created."
          }
        }
      }
    }
  }
}
```

---

## org.hypercerts.claim.evaluation

```json
{
  "lexicon": 1,
  "id": "org.hypercerts.claim.evaluation",
  "defs": {
    "score": {
      "type": "object",
      "description": "Overall score for an evaluation on a numeric scale.",
      "required": ["min", "max", "value"],
      "properties": {
        "min": {
          "type": "integer",
          "description": "Minimum value of the scale, e.g. 0 or 1."
        },
        "max": {
          "type": "integer",
          "description": "Maximum value of the scale, e.g. 5 or 10."
        },
        "value": {
          "type": "integer",
          "description": "Score within the inclusive range [min, max]."
        }
      }
    },
    "main": {
      "type": "record",
      "description": "An evaluation of a hypercert record (e.g. an activity and its impact).",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["evaluators", "summary", "createdAt"],
        "properties": {
          "subject": {
            "type": "ref",
            "ref": "com.atproto.repo.strongRef",
            "description": "A strong reference to what is being evaluated. (e.g activity, measurement, contribution, etc.)"
          },
          "evaluators": {
            "type": "array",
            "description": "DIDs of the evaluators",
            "items": {
              "type": "ref",
              "ref": "app.certified.defs#did"
            },
            "maxLength": 1000
          },
          "content": {
            "type": "array",
            "description": "Evaluation data (URIs or blobs) containing detailed reports or methodology",
            "items": {
              "type": "union",
              "refs": [
                "org.hypercerts.defs#uri",
                "org.hypercerts.defs#smallBlob"
              ]
            },
            "maxLength": 100
          },
          "measurements": {
            "type": "array",
            "description": "Optional references to the measurements that contributed to this evaluation. The record(s) referenced must conform with the lexicon org.hypercerts.claim.measurement ",
            "items": {
              "type": "ref",
              "ref": "com.atproto.repo.strongRef"
            },
            "maxLength": 100
          },
          "summary": {
            "type": "string",
            "description": "Brief evaluation summary",
            "maxLength": 5000,
            "maxGraphemes": 1000
          },
          "score": {
            "type": "ref",
            "ref": "#score",
            "description": "Optional overall score for this evaluation on a numeric scale."
          },
          "location": {
            "type": "ref",
            "ref": "com.atproto.repo.strongRef",
            "description": "An optional reference for georeferenced evaluations. The record referenced must conform with the lexicon app.certified.location."
          },
          "createdAt": {
            "type": "string",
            "format": "datetime",
            "description": "Client-declared timestamp when this record was originally created"
          }
        }
      }
    }
  }
}
```

---

## org.hypercerts.claim.evidence

```json
{
  "lexicon": 1,
  "id": "org.hypercerts.claim.evidence",
  "defs": {
    "main": {
      "type": "record",
      "description": "A piece of evidence related to a hypercert record (e.g. an activity, project, claim, or evaluation). Evidence may support, clarify, or challenge the referenced subject.",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["content", "title", "createdAt"],
        "properties": {
          "subject": {
            "type": "ref",
            "ref": "com.atproto.repo.strongRef",
            "description": "A strong reference to the record this evidence relates to (e.g. an activity, project, claim, or evaluation)."
          },
          "content": {
            "type": "union",
            "refs": [
              "org.hypercerts.defs#uri",
              "org.hypercerts.defs#smallBlob"
            ],
            "description": "A piece of evidence (URI or blob) related to the subject record; it may support, clarify, or challenge a hypercert claim."
          },
          "title": {
            "type": "string",
            "maxLength": 256,
            "description": "Title to describe the nature of the evidence."
          },
          "shortDescription": {
            "type": "string",
            "maxLength": 3000,
            "maxGraphemes": 300,
            "description": "Short description explaining what this evidence shows."
          },
          "description": {
            "type": "string",
            "description": "Longer description describing the evidence in more detail.",
            "maxLength": 30000,
            "maxGraphemes": 3000
          },
          "relationType": {
            "type": "string",
            "description": "How this evidence relates to the subject.",
            "knownValues": ["supports", "challenges", "clarifies"]
          },
          "createdAt": {
            "type": "string",
            "format": "datetime",
            "description": "Client-declared timestamp when this record was originally created"
          }
        }
      }
    }
  }
}
```

---

## org.hypercerts.claim.measurement

```json
{
  "lexicon": 1,
  "id": "org.hypercerts.claim.measurement",
  "defs": {
    "main": {
      "type": "record",
      "description": "Measurement data related to a hypercert record (e.g. an activity and its impact).",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["measurers", "metric", "value", "createdAt"],
        "properties": {
          "subject": {
            "type": "ref",
            "ref": "com.atproto.repo.strongRef",
            "description": "A strong reference to the record this measurement refers to (e.g. an activity, project, or claim)."
          },
          "measurers": {
            "type": "array",
            "description": "DIDs of the entity (or entities) that measured this data",
            "items": {
              "type": "ref",
              "ref": "app.certified.defs#did"
            },
            "maxLength": 100
          },
          "metric": {
            "type": "string",
            "description": "The metric being measured",
            "maxLength": 500
          },
          "value": {
            "type": "string",
            "description": "The measured value",
            "maxLength": 500
          },
          "methodType": {
            "type": "string",
            "description": "Short identifier for the measurement methodology",
            "maxLength": 30
          },
          "methodURI": {
            "type": "string",
            "format": "uri",
            "description": "URI to methodology documentation, standard protocol, or measurement procedure"
          },
          "evidenceURI": {
            "type": "array",
            "description": "URIs to related evidence or underlying data (e.g. org.hypercerts.claim.evidence records or raw datasets)",
            "items": {
              "type": "string",
              "format": "uri"
            },
            "maxLength": 50
          },
          "location": {
            "type": "ref",
            "ref": "com.atproto.repo.strongRef",
            "description": "A strong reference to the location where the measurement was taken. The record referenced must conform with the lexicon app.certified.location"
          },
          "createdAt": {
            "type": "string",
            "format": "datetime",
            "description": "Client-declared timestamp when this record was originally created"
          }
        }
      }
    }
  }
}
```

---

## org.hypercerts.claim.rights

```json
{
  "lexicon": 1,
  "id": "org.hypercerts.claim.rights",
  "defs": {
    "main": {
      "type": "record",
      "description": "Describes the rights that a contributor and/or an owner has, such as whether the hypercert can be sold, transferred, and under what conditions.",
      "key": "tid",
      "record": {
        "type": "object",
        "required": [
          "rightsName",
          "rightsType",
          "rightsDescription",
          "createdAt"
        ],
        "properties": {
          "rightsName": {
            "type": "string",
            "description": "Full name of the rights",
            "maxLength": 100
          },
          "rightsType": {
            "type": "string",
            "description": "Short rights identifier for easier search",
            "maxLength": 10
          },
          "rightsDescription": {
            "type": "string",
            "description": "Description of the rights of this hypercert"
          },
          "attachment": {
            "type": "union",
            "refs": [
              "org.hypercerts.defs#uri",
              "org.hypercerts.defs#smallBlob"
            ],
            "description": "An attachment to define the rights further, e.g. a legal document."
          },
          "createdAt": {
            "type": "string",
            "format": "datetime",
            "description": "Client-declared timestamp when this record was originally created"
          }
        }
      }
    }
  }
}
```

---

## org.hypercerts.defs

```json
{
  "lexicon": 1,
  "id": "org.hypercerts.defs",
  "defs": {
    "uri": {
      "type": "object",
      "required": ["uri"],
      "description": "Object containing a URI to external data",
      "properties": {
        "uri": {
          "type": "string",
          "format": "uri",
          "maxGraphemes": 1024,
          "description": "URI to external data"
        }
      }
    },
    "smallBlob": {
      "type": "object",
      "required": ["blob"],
      "description": "Object containing a blob to external data",
      "properties": {
        "blob": {
          "type": "blob",
          "accept": ["*/*"],
          "maxSize": 10485760,
          "description": "Blob to external data (up to 10MB)"
        }
      }
    },
    "largeBlob": {
      "type": "object",
      "required": ["blob"],
      "description": "Object containing a blob to external data",
      "properties": {
        "blob": {
          "type": "blob",
          "accept": ["*/*"],
          "maxSize": 104857600,
          "description": "Blob to external data (up to 100MB)"
        }
      }
    },
    "smallImage": {
      "type": "object",
      "required": ["image"],
      "description": "Object containing a small image",
      "properties": {
        "image": {
          "type": "blob",
          "accept": ["image/jpeg", "image/jpg", "image/png", "image/webp"],
          "maxSize": 5242880,
          "description": "Image (up to 5MB)"
        }
      }
    },
    "largeImage": {
      "type": "object",
      "required": ["image"],
      "description": "Object containing a large image",
      "properties": {
        "image": {
          "type": "blob",
          "accept": ["image/jpeg", "image/jpg", "image/png", "image/webp"],
          "maxSize": 10485760,
          "description": "Image (up to 10MB)"
        }
      }
    }
  }
}
```

---

## org.hypercerts.funding.receipt

```json
{
  "lexicon": 1,
  "id": "org.hypercerts.funding.receipt",
  "defs": {
    "main": {
      "type": "record",
      "description": "Records a funding receipt for a payment from one user to another user. It may be recorded by the recipient, by the sender, or by a third party. The sender may remain anonymous.",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["from", "to", "amount", "currency", "createdAt"],
        "properties": {
          "from": {
            "type": "ref",
            "ref": "app.certified.defs#did",
            "description": "DID of the sender who transferred the funds. Leave empty if sender wants to stay anonymous."
          },
          "to": {
            "type": "string",
            "description": "The recipient of the funds. Can be identified by DID or a clear-text name."
          },
          "amount": {
            "type": "string",
            "description": "Amount of funding received."
          },
          "currency": {
            "type": "string",
            "description": "Currency of the payment (e.g. EUR, USD, ETH)."
          },
          "paymentRail": {
            "type": "string",
            "description": "How the funds were transferred (e.g. bank_transfer, credit_card, onchain, cash, check, payment_processor)."
          },
          "paymentNetwork": {
            "type": "string",
            "description": "Optional network within the payment rail (e.g. arbitrum, ethereum, sepa, visa, paypal)."
          },
          "transactionId": {
            "type": "string",
            "description": "Identifier of the underlying payment transaction (e.g. bank reference, onchain transaction hash, or processor-specific ID). Use paymentNetwork to specify the network where applicable."
          },
          "for": {
            "type": "string",
            "format": "at-uri",
            "description": "Optional reference to the activity, project, or organization this funding relates to."
          },
          "notes": {
            "type": "string",
            "description": "Optional notes or additional context for this funding receipt.",
            "maxLength": 500
          },
          "occurredAt": {
            "type": "string",
            "format": "datetime",
            "description": "Timestamp when the payment occurred."
          },
          "createdAt": {
            "type": "string",
            "format": "datetime",
            "description": "Client-declared timestamp when this receipt record was created."
          }
        }
      }
    }
  }
}
```

<!-- END lex generated TOC please keep comment here to allow auto update -->
