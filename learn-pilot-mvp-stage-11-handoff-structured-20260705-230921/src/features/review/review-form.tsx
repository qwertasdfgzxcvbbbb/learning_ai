"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createReviewAction, type ReviewActionState } from "@/features/review/actions";

type ReviewFormProps = {
  planId: string;
};

const initialState: ReviewActionState = {
  status: "idle",
};

export function ReviewForm({ planId }: ReviewFormProps) {
  const [state, formAction, pending] = useActionState(createReviewAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="planId" value={planId} />

      <label className="block space-y-1.5 text-sm font-medium">
        本周满意度
        <select
          name="satisfactionScore"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          defaultValue=""
        >
          <option value="">选择 1-5 分</option>
          <option value="5">5 分，很顺畅</option>
          <option value="4">4 分，基本顺利</option>
          <option value="3">3 分，有一些阻力</option>
          <option value="2">2 分，执行困难</option>
          <option value="1">1 分，几乎没推进</option>
        </select>
      </label>
      {state.fieldErrors?.satisfactionScore?.[0] ? (
        <p className="text-xs text-destructive">{state.fieldErrors.satisfactionScore[0]}</p>
      ) : null}

      <label className="block space-y-1.5 text-sm font-medium">
        本周卡点
        <textarea
          name="blockers"
          rows={4}
          className="min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-6"
          placeholder="写下影响执行的时间、资料、任务难度或理解问题。"
        />
      </label>
      {state.fieldErrors?.blockers?.[0] ? (
        <p className="text-xs text-destructive">{state.fieldErrors.blockers[0]}</p>
      ) : null}

      <label className="block space-y-1.5 text-sm font-medium">
        下周目标
        <textarea
          name="nextGoal"
          rows={3}
          className="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-6"
          placeholder="例如：优先补完延期任务，减少资料阅读，集中输出一份案例分析。"
        />
      </label>
      {state.fieldErrors?.nextGoal?.[0] ? (
        <p className="text-xs text-destructive">{state.fieldErrors.nextGoal[0]}</p>
      ) : null}

      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "rounded-md bg-primary/10 px-3 py-2 text-xs leading-5 text-primary"
              : "rounded-md bg-destructive/10 px-3 py-2 text-xs leading-5 text-destructive"
          }
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        <Send className="h-4 w-4" aria-hidden="true" />
        {pending ? "保存中" : "保存复盘"}
      </Button>
    </form>
  );
}
