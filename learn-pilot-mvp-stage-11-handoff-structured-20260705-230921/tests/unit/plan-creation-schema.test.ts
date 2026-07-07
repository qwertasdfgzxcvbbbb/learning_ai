import { describe, expect, it } from "vitest";
import { getPlanCreationHints, planCreationSchema } from "@/features/plan-creation/schema";

const validInput = {
  learningDirection: "AI 产品经理",
  specificGoal: "30 天内入门，并完成一份可以展示的 PRD 草稿。",
  goalType: "job_project",
  foundationLevel: "beginner",
  durationDays: 30,
  dailyMinutes: 60,
  weeklyStudyDays: 5,
  preferredResources: ["文章", "案例", "项目实践"],
  targetOutcome: "一份完整 AI App PRD 草稿",
};

describe("planCreationSchema", () => {
  it("accepts a valid learning goal draft", () => {
    expect(planCreationSchema.safeParse(validInput).success).toBe(true);
  });

  it("requires at least one preferred resource type", () => {
    const result = planCreationSchema.safeParse({
      ...validInput,
      preferredResources: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects unrealistic daily study minutes", () => {
    const result = planCreationSchema.safeParse({
      ...validInput,
      dailyMinutes: 5,
    });

    expect(result.success).toBe(false);
  });
});

describe("getPlanCreationHints", () => {
  it("warns when the plan is short and daily time is low", () => {
    const hints = getPlanCreationHints({
      specificGoal: "快速入门一个很大的方向，并做出完整作品。",
      durationDays: 5,
      dailyMinutes: 20,
    });

    expect(hints.some((hint) => hint.level === "warning")).toBe(true);
    expect(hints).toHaveLength(2);
  });

  it("returns a positive hint for a reasonable draft", () => {
    expect(
      getPlanCreationHints({
        specificGoal: validInput.specificGoal,
        durationDays: 30,
        dailyMinutes: 60,
      }),
    ).toEqual([
      {
        level: "info",
        message: "这个目标可以先保存为草稿，下一步再进入基础测评和路线生成。",
      },
    ]);
  });
});
