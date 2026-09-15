/**
 * ResourceProvider — NG-201
 * Normalized resource metadata. Supports detail pages and evidence display.
 */

export type ResourceType = string; // e.g. "Ec2Instance" | "EbsVolume" | "RdsInstance"

export type NormalizedResource = {
  resourceId: string;
  resourceArn?: string | null;
  resourceType: ResourceType;
  region: string;
  accountId?: string | null;
  configuration: string;
  attributes?: Record<string, unknown>;
  utilization?: {
    cpuAverage?: number | null;
    memoryAverage?: number | null;
    iopsAverage?: number | null;
    lookbackDays?: number | null;
  } | null;
  observedAt: string; // ISO
};

export type ResourceQuery = {
  organizationId: string;
  resourceId: string;
};

export interface ResourceProvider {
  getResource(query: ResourceQuery): Promise<NormalizedResource | null>;
  listResources?(query: { organizationId: string; resourceType?: string }): Promise<NormalizedResource[]>;
}
