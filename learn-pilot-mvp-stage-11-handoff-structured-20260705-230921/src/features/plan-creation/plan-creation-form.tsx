"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { createPlanAction } from "@/features/plan-creation/actions";
import { getPlanCreationHints } from "@/features/plan-creation/schema";
import type { PlanCreationActionState } from "@/features/plan-creation/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const initialState: PlanCreationActionState = { status: "idle" };

const resourceOptions = ["文章", "书籍", "视频课", "案例", "项目实践", "官方文档"];

const goalTypeOptions = [
  { value: "quick_start", label: "快速入门" },
  { value: "systematic", label: "系统学习" },
  { value: "exam_prep", label: "备考" },
  { value: "job_project", label: "求职/作品集" },
  { value: "research", label: "研究" },
  { value: "language", label: "语言学习" },
  { value: "skill", label: "技能提升" },
];

const foundationOptions = [
  { value: "zero", label: "零基础" },
  { value: "beginner", label: "入门了解" },
  { value: "intermediate", label: "有一定基础" },
  { value: "advanced", label: "比较熟练" },
];

export function PlanCreationForm() {
  const [state, formAction] = useActionState(createPlanAction, initialState);
  const [specificGoal, setSpecificGoal] = useState("30 天内入门，并完成一份可以展示的作品。");
  const [durationDays, setDurationDays] = useState(30);
  const [dailyMinutes, setDailyMinutes] = useState(60);

  const hints = useMemo(
    () => getPlanCreationHints({ specificGoal, durationDays, dailyMinutes }),
    [dailyMinutes, durationDays, specificGoal],
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "error" && state.message ? (
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <Field label="学习方向" error={state.fieldErrors?.learningDirection?.[0]}>
        <Input
          name="learningDirection"
          placeholder="例如：AI 产品经理"
          defaultValue="AI 产品经理"
          required
          minLength={2}
          maxLength={80}
        />
      </Field>

      <Field label="具体目标" error={state.fieldErrors?.specificGoal?.[0]}>
        <textarea
          name="specificGoal"
          value={specificGoal}
          onChange={(event) => setSpecificGoal(event.target.value)}
          required
          minLength={8}
          maxLength={500}
          rows={5}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="写清楚你想学会什么、做到什么。"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="目标类型" error={state.fieldErrors?.goalType?.[0]}>
          <Select name="goalType" defaultValue="job_project" options={goalTypeOptions} />
        </Field>
        <Field label="当前基础" error={state.fieldErrors?.foundationLevel?.[0]}>
          <Select name="foundationLevel" defaultValue="beginner" options={foundationOptions} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="周期" error={state.fieldErrors?.durationDays?.[0]}>
          <Input
            name="durationDays"
            type="number"
            min={3}
            max={365}
            value={durationDays}
            onChange={(event) => setDurationDays(Number(event.target.value))}
            required
          />
        </Field>
        <Field label="每天分钟" error={state.fieldErrors?.dailyMinutes?.[0]}>
          <Input
            name="dailyMinutes"
            type="number"
            min={10}
            max={480}
            value={dailyMinutes}
            onChange={(event) => setDailyMinutes(Number(event.target.value))}
            required
          />
        </Field>
        <Field label="每周天数" error={state.fieldErrors?.weeklyStudyDays?.[0]}>
          <Input name="weeklyStudyDays" type="number" min={1} max={7} defaultValue={5} required />
        </Field>
      </div>

      <Field label="偏好资源" error={state.fieldErrors?.preferredResources?.[0]}>
        <div className="grid grid-cols-2 gap-2">
          {resourceOptions.map((resource, index) => (
            <label
              key={resource}
              className="flex min-h-10 items-center gap-2 rounded-md border bg-card px-3 text-sm"
            >
              <input
                name="preferredResources"
                type="checkbox"
                value={resource}
                defaultChecked={index < 3}
                className="h-4 w-4 accent-primary"
              />
              <span>{resource}</span>
            </label>
          ))}
        </div>
      </Field>

      <Field label="目标产出" error={state.fieldErrors?.targetOutcome?.[0]}>
        <Input
          name="targetOutcome"
          placeholder="例如：一份完整 PRD 草稿"
          defaultValue="一份完整 AI App PRD 草稿"
          maxLength={240}
        />
      </Field>

      <section className="space-y-2 rounded-lg border bg-card p-3">
        <h2 className="text-sm font-semibold">目标合理性提示</h2>
        {hints.map((hint) => (
          <div key={hint.message} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
            {hint.level === "warning" ? (
              <AlertCircle className="mt-1 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            )}
            <span>{hint.message}</span>
          </div>
        ))}
      </section>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      <Save className="h-4 w-4" aria-hidden="true" />
      {pending ? "正在保存" : "保存计划草稿"}
    </Button>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error ? <span className="block text-xs leading-5 text-destructive">{error}</span> : null}
    </label>
  );
}

function Select({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
