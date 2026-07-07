export type PlanCreationActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export type PlanCreationHint = {
  level: "info" | "warning";
  message: string;
};
