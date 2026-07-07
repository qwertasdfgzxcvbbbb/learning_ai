"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ClipboardCheck, FastForward, Save } from "lucide-react";
import { skipAssessmentAction, submitAssessmentAction } from "@/features/assessment/actions";
import type { AssessmentActionState, AssessmentQuestion } from "@/features/assessment/types";
import { Button } from "@/components/ui/button";

const initialState: AssessmentActionState = { status: "idle" };

const selfLevels = [
  { value: "zero", label: "零基础" },
  { value: "beginner", label: "入门了解" },
  { value: "intermediate", label: "有一定基础" },
  { value: "advanced", label: "比较熟练" },
];

type AssessmentFormProps = {
  planId: string;
  questions: AssessmentQuestion[];
};

export function AssessmentForm({ planId, questions }: AssessmentFormProps) {
  const [state, formAction] = useActionState(submitAssessmentAction, initialState);

  return (
    <div className="space-y-4">
      {state.status === "error" && state.message ? (
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="planId" value={planId} />

        <section className="space-y-3 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold">先选一个自评等级</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {selfLevels.map((level) => (
              <label
                key={level.value}
                className="flex min-h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm"
              >
                <input
                  type="radio"
                  name="selfLevel"
                  value={level.value}
                  defaultChecked={level.value === "beginner"}
                  className="h-4 w-4 accent-primary"
                />
                <span>{level.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {questions.map((question, index) => (
            <fieldset key={question.id} className="space-y-3 rounded-lg border bg-card p-4">
              <legend className="text-sm font-semibold">
                {index + 1}. {question.prompt}
              </legend>
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex min-h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm"
                  >
                    <input
                      type="radio"
                      name={`question:${question.id}`}
                      value={option.value}
                      required
                      className="h-4 w-4 accent-primary"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </section>

        <SubmitButton />
      </form>

      <form action={skipAssessmentAction}>
        <input type="hidden" name="planId" value={planId} />
        <Button type="submit" variant="outline" className="w-full">
          <FastForward className="h-4 w-4" aria-hidden="true" />
          跳过测评，按初级开始
        </Button>
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      <Save className="h-4 w-4" aria-hidden="true" />
      {pending ? "正在保存" : "提交测评结果"}
    </Button>
  );
}
