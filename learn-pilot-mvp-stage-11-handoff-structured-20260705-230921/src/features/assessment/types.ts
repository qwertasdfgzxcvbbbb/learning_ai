export type AssessmentOption = {
  value: string;
  label: string;
  score: number;
};

export type AssessmentQuestion = {
  id: string;
  prompt: string;
  options: AssessmentOption[];
};

export type AssessmentActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};
