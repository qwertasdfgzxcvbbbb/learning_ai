import type { ResourceStatus } from "@prisma/client";
import { assertLearningResourceStatus } from "@/features/resources/status";
import { DEMO_USER_ID } from "@/lib/constants";
import { ResourceRepository } from "@/server/repositories/resource.repository";

type ResourceRecord = {
  id: string;
  planId: string;
  status: ResourceStatus;
  plan: {
    userId: string;
  };
};

type ResourceStatusRepository = {
  findById(id: string): Promise<ResourceRecord | null>;
  updateStatus(id: string, status: ResourceStatus): Promise<unknown>;
};

export type ResourceStatusUpdateResult =
  | { status: "updated"; planId: string }
  | { status: "unchanged"; planId: string }
  | { status: "not-found" };

const resourceRepository = new ResourceRepository();

export async function updateResourceStatus(
  resourceId: string,
  nextStatus: ResourceStatus,
  repository: ResourceStatusRepository = resourceRepository,
): Promise<ResourceStatusUpdateResult> {
  assertLearningResourceStatus(nextStatus);

  const resource = await repository.findById(resourceId);

  if (!resource || resource.plan.userId !== DEMO_USER_ID) {
    return { status: "not-found" };
  }

  if (resource.status === nextStatus) {
    return { status: "unchanged", planId: resource.planId };
  }

  await repository.updateStatus(resource.id, nextStatus);

  return { status: "updated", planId: resource.planId };
}
