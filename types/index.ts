/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  XrpcClient,
  type FetchHandler,
  type FetchHandlerOptions,
} from "@atproto/xrpc";
import { schemas } from "./lexicons.js";
import { CID } from "multiformats/cid";
import { type OmitKey, type Un$Typed } from "./util.js";
import * as AppCertifiedBadgeAward from "./types/app/certified/badge/award.js";
import * as AppCertifiedBadgeDefinition from "./types/app/certified/badge/definition.js";
import * as AppCertifiedBadgeResponse from "./types/app/certified/badge/response.js";
import * as AppCertifiedDefs from "./types/app/certified/defs.js";
import * as AppCertifiedLocation from "./types/app/certified/location.js";
import * as ComAtprotoRepoStrongRef from "./types/com/atproto/repo/strongRef.js";
import * as OrgHypercertsClaimActivity from "./types/org/hypercerts/claim/activity.js";
import * as OrgHypercertsClaimCollection from "./types/org/hypercerts/claim/collection.js";
import * as OrgHypercertsClaimContribution from "./types/org/hypercerts/claim/contribution.js";
import * as OrgHypercertsClaimEvaluation from "./types/org/hypercerts/claim/evaluation.js";
import * as OrgHypercertsClaimEvidence from "./types/org/hypercerts/claim/evidence.js";
import * as OrgHypercertsClaimMeasurement from "./types/org/hypercerts/claim/measurement.js";
import * as OrgHypercertsClaimRights from "./types/org/hypercerts/claim/rights.js";
import * as OrgHypercertsDefs from "./types/org/hypercerts/defs.js";
import * as OrgHypercertsFundingReceipt from "./types/org/hypercerts/funding/receipt.js";

export * as AppCertifiedBadgeAward from "./types/app/certified/badge/award.js";
export * as AppCertifiedBadgeDefinition from "./types/app/certified/badge/definition.js";
export * as AppCertifiedBadgeResponse from "./types/app/certified/badge/response.js";
export * as AppCertifiedDefs from "./types/app/certified/defs.js";
export * as AppCertifiedLocation from "./types/app/certified/location.js";
export * as ComAtprotoRepoStrongRef from "./types/com/atproto/repo/strongRef.js";
export * as OrgHypercertsClaimActivity from "./types/org/hypercerts/claim/activity.js";
export * as OrgHypercertsClaimCollection from "./types/org/hypercerts/claim/collection.js";
export * as OrgHypercertsClaimContribution from "./types/org/hypercerts/claim/contribution.js";
export * as OrgHypercertsClaimEvaluation from "./types/org/hypercerts/claim/evaluation.js";
export * as OrgHypercertsClaimEvidence from "./types/org/hypercerts/claim/evidence.js";
export * as OrgHypercertsClaimMeasurement from "./types/org/hypercerts/claim/measurement.js";
export * as OrgHypercertsClaimRights from "./types/org/hypercerts/claim/rights.js";
export * as OrgHypercertsDefs from "./types/org/hypercerts/defs.js";
export * as OrgHypercertsFundingReceipt from "./types/org/hypercerts/funding/receipt.js";

export class AtpBaseClient extends XrpcClient {
  app: AppNS;
  com: ComNS;
  org: OrgNS;

  constructor(options: FetchHandler | FetchHandlerOptions) {
    super(options, schemas);
    this.app = new AppNS(this);
    this.com = new ComNS(this);
    this.org = new OrgNS(this);
  }

  /** @deprecated use `this` instead */
  get xrpc(): XrpcClient {
    return this;
  }
}

export class AppNS {
  _client: XrpcClient;
  certified: AppCertifiedNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.certified = new AppCertifiedNS(client);
  }
}

export class AppCertifiedNS {
  _client: XrpcClient;
  location: AppCertifiedLocationRecord;
  badge: AppCertifiedBadgeNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.badge = new AppCertifiedBadgeNS(client);
    this.location = new AppCertifiedLocationRecord(client);
  }
}

export class AppCertifiedBadgeNS {
  _client: XrpcClient;
  award: AppCertifiedBadgeAwardRecord;
  definition: AppCertifiedBadgeDefinitionRecord;
  response: AppCertifiedBadgeResponseRecord;

  constructor(client: XrpcClient) {
    this._client = client;
    this.award = new AppCertifiedBadgeAwardRecord(client);
    this.definition = new AppCertifiedBadgeDefinitionRecord(client);
    this.response = new AppCertifiedBadgeResponseRecord(client);
  }
}

export class AppCertifiedBadgeAwardRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: AppCertifiedBadgeAward.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "app.certified.badge.award",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{
    uri: string;
    cid: string;
    value: AppCertifiedBadgeAward.Record;
  }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "app.certified.badge.award",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<AppCertifiedBadgeAward.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "app.certified.badge.award";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<AppCertifiedBadgeAward.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "app.certified.badge.award";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "app.certified.badge.award", ...params },
      { headers },
    );
  }
}

export class AppCertifiedBadgeDefinitionRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: AppCertifiedBadgeDefinition.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "app.certified.badge.definition",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{
    uri: string;
    cid: string;
    value: AppCertifiedBadgeDefinition.Record;
  }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "app.certified.badge.definition",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<AppCertifiedBadgeDefinition.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "app.certified.badge.definition";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<AppCertifiedBadgeDefinition.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "app.certified.badge.definition";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "app.certified.badge.definition", ...params },
      { headers },
    );
  }
}

export class AppCertifiedBadgeResponseRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: AppCertifiedBadgeResponse.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "app.certified.badge.response",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{
    uri: string;
    cid: string;
    value: AppCertifiedBadgeResponse.Record;
  }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "app.certified.badge.response",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<AppCertifiedBadgeResponse.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "app.certified.badge.response";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<AppCertifiedBadgeResponse.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "app.certified.badge.response";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "app.certified.badge.response", ...params },
      { headers },
    );
  }
}

export class AppCertifiedLocationRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: AppCertifiedLocation.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "app.certified.location",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{ uri: string; cid: string; value: AppCertifiedLocation.Record }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "app.certified.location",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<AppCertifiedLocation.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "app.certified.location";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<AppCertifiedLocation.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "app.certified.location";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "app.certified.location", ...params },
      { headers },
    );
  }
}

export class ComNS {
  _client: XrpcClient;
  atproto: ComAtprotoNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.atproto = new ComAtprotoNS(client);
  }
}

export class ComAtprotoNS {
  _client: XrpcClient;
  repo: ComAtprotoRepoNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.repo = new ComAtprotoRepoNS(client);
  }
}

export class ComAtprotoRepoNS {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }
}

export class OrgNS {
  _client: XrpcClient;
  hypercerts: OrgHypercertsNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.hypercerts = new OrgHypercertsNS(client);
  }
}

export class OrgHypercertsNS {
  _client: XrpcClient;
  claim: OrgHypercertsClaimNS;
  funding: OrgHypercertsFundingNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.claim = new OrgHypercertsClaimNS(client);
    this.funding = new OrgHypercertsFundingNS(client);
  }
}

export class OrgHypercertsClaimNS {
  _client: XrpcClient;
  activity: OrgHypercertsClaimActivityRecord;
  collection: OrgHypercertsClaimCollectionRecord;
  contribution: OrgHypercertsClaimContributionRecord;
  evaluation: OrgHypercertsClaimEvaluationRecord;
  evidence: OrgHypercertsClaimEvidenceRecord;
  measurement: OrgHypercertsClaimMeasurementRecord;
  rights: OrgHypercertsClaimRightsRecord;

  constructor(client: XrpcClient) {
    this._client = client;
    this.activity = new OrgHypercertsClaimActivityRecord(client);
    this.collection = new OrgHypercertsClaimCollectionRecord(client);
    this.contribution = new OrgHypercertsClaimContributionRecord(client);
    this.evaluation = new OrgHypercertsClaimEvaluationRecord(client);
    this.evidence = new OrgHypercertsClaimEvidenceRecord(client);
    this.measurement = new OrgHypercertsClaimMeasurementRecord(client);
    this.rights = new OrgHypercertsClaimRightsRecord(client);
  }
}

export class OrgHypercertsClaimActivityRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: OrgHypercertsClaimActivity.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "org.hypercerts.claim.activity",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{
    uri: string;
    cid: string;
    value: OrgHypercertsClaimActivity.Record;
  }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "org.hypercerts.claim.activity",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsClaimActivity.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.claim.activity";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsClaimActivity.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.claim.activity";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "org.hypercerts.claim.activity", ...params },
      { headers },
    );
  }
}

export class OrgHypercertsClaimCollectionRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: OrgHypercertsClaimCollection.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "org.hypercerts.claim.collection",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{
    uri: string;
    cid: string;
    value: OrgHypercertsClaimCollection.Record;
  }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "org.hypercerts.claim.collection",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsClaimCollection.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.claim.collection";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsClaimCollection.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.claim.collection";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "org.hypercerts.claim.collection", ...params },
      { headers },
    );
  }
}

export class OrgHypercertsClaimContributionRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: OrgHypercertsClaimContribution.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "org.hypercerts.claim.contribution",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{
    uri: string;
    cid: string;
    value: OrgHypercertsClaimContribution.Record;
  }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "org.hypercerts.claim.contribution",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsClaimContribution.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.claim.contribution";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsClaimContribution.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.claim.contribution";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "org.hypercerts.claim.contribution", ...params },
      { headers },
    );
  }
}

export class OrgHypercertsClaimEvaluationRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: OrgHypercertsClaimEvaluation.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "org.hypercerts.claim.evaluation",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{
    uri: string;
    cid: string;
    value: OrgHypercertsClaimEvaluation.Record;
  }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "org.hypercerts.claim.evaluation",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsClaimEvaluation.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.claim.evaluation";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsClaimEvaluation.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.claim.evaluation";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "org.hypercerts.claim.evaluation", ...params },
      { headers },
    );
  }
}

export class OrgHypercertsClaimEvidenceRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: OrgHypercertsClaimEvidence.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "org.hypercerts.claim.evidence",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{
    uri: string;
    cid: string;
    value: OrgHypercertsClaimEvidence.Record;
  }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "org.hypercerts.claim.evidence",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsClaimEvidence.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.claim.evidence";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsClaimEvidence.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.claim.evidence";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "org.hypercerts.claim.evidence", ...params },
      { headers },
    );
  }
}

export class OrgHypercertsClaimMeasurementRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: OrgHypercertsClaimMeasurement.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "org.hypercerts.claim.measurement",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{
    uri: string;
    cid: string;
    value: OrgHypercertsClaimMeasurement.Record;
  }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "org.hypercerts.claim.measurement",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsClaimMeasurement.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.claim.measurement";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsClaimMeasurement.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.claim.measurement";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "org.hypercerts.claim.measurement", ...params },
      { headers },
    );
  }
}

export class OrgHypercertsClaimRightsRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: OrgHypercertsClaimRights.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "org.hypercerts.claim.rights",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{
    uri: string;
    cid: string;
    value: OrgHypercertsClaimRights.Record;
  }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "org.hypercerts.claim.rights",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsClaimRights.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.claim.rights";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsClaimRights.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.claim.rights";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "org.hypercerts.claim.rights", ...params },
      { headers },
    );
  }
}

export class OrgHypercertsFundingNS {
  _client: XrpcClient;
  receipt: OrgHypercertsFundingReceiptRecord;

  constructor(client: XrpcClient) {
    this._client = client;
    this.receipt = new OrgHypercertsFundingReceiptRecord(client);
  }
}

export class OrgHypercertsFundingReceiptRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, "collection">,
  ): Promise<{
    cursor?: string;
    records: { uri: string; value: OrgHypercertsFundingReceipt.Record }[];
  }> {
    const res = await this._client.call("com.atproto.repo.listRecords", {
      collection: "org.hypercerts.funding.receipt",
      ...params,
    });
    return res.data;
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, "collection">,
  ): Promise<{
    uri: string;
    cid: string;
    value: OrgHypercertsFundingReceipt.Record;
  }> {
    const res = await this._client.call("com.atproto.repo.getRecord", {
      collection: "org.hypercerts.funding.receipt",
      ...params,
    });
    return res.data;
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsFundingReceipt.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.funding.receipt";
    const res = await this._client.call(
      "com.atproto.repo.createRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      "collection" | "record"
    >,
    record: Un$Typed<OrgHypercertsFundingReceipt.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = "org.hypercerts.funding.receipt";
    const res = await this._client.call(
      "com.atproto.repo.putRecord",
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: "application/json", headers },
    );
    return res.data;
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, "collection">,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      "com.atproto.repo.deleteRecord",
      undefined,
      { collection: "org.hypercerts.funding.receipt", ...params },
      { headers },
    );
  }
}
