export type LearningResourceStatus = "want_to_learn" | "learned" | "unsuitable";

export const learningResourceStatuses = ["want_to_learn", "learned", "unsuitable"] as const;

export function isLearningResourceStatus(status: string): status is LearningResourceStatus {
  return learningResourceStatuses.includes(status as LearningResourceStatus);
}

export function assertLearningResourceStatus(status: string): asserts status is LearningResourceStatus {
  if (!isLearningResourceStatus(status)) {
    throw new Error(`Unsupported resource status: ${status}.`);
  }
}
