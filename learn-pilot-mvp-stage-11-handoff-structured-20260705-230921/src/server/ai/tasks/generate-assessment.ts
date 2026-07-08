import type { GoalType } from "@prisma/client";
import {
  buildAssessmentQuestions,
  type AssessmentQuestionInput,
} from "@/features/assessment/questions";
import type { AssessmentQuestion } from "@/features/assessment/types";
import { getAiProviderMode } from "@/server/ai/provider";
import {
  ASSESSMENT_PROMPT_VERSION,
  generateAssessmentPrompt,
} from "@/server/ai/prompts/generate-assessment.prompt";
import {
  assessmentOutputJsonSchema,
  assessmentOutputSchema,
} from "@/server/ai/schemas/assessment-output.schema";

export type GenerateAssessmentInput = {
  plan: AssessmentQuestionInput & {
    title: string;
    goalType: GoalType;
    durationDays: number;
    dailyMinutes: number;
    preferredResources: string[];
    targetOutcome: string | null;
  };
};

export type GenerateAssessmentResult = {
  promptVersion: string;
  provider: "mock" | "openai";
  questions: AssessmentQuestion[];
};

type ResponsesApiResult = {
  output_text?: unknown;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

export async function generateAssessmentQuestions(
  input: GenerateAssessmentInput,
): Promise<GenerateAssessmentResult> {
  const fallback = buildAssessmentQuestions(input.plan);
  const modelName = process.env.OPENAI_MODEL ?? "mock";
  const apiKey = process.env.OPENAI_API_KEY;

  if (getAiProviderMode(modelName) !== "openai" || !apiKey) {
    return {
      promptVersion: ASSESSMENT_PROMPT_VERSION,
      provider: "mock",
      questions: fallback,
    };
  }

  try {
    const questions = await generateOpenAiAssessmentQuestions({ input, modelName, apiKey });

    return {
      promptVersion: ASSESSMENT_PROMPT_VERSION,
      provider: "openai",
      questions,
    };
  } catch {
    return {
      promptVersion: ASSESSMENT_PROMPT_VERSION,
      provider: "mock",
      questions: fallback,
    };
  }
}

async function generateOpenAiAssessmentQuestions({
  input,
  modelName,
  apiKey,
}: {
  input: GenerateAssessmentInput;
  modelName: string;
  apiKey: string;
}) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      instructions: generateAssessmentPrompt,
      input: JSON.stringify({
        promptVersion: ASSESSMENT_PROMPT_VERSION,
        plan: input.plan,
      }),
      text: {
        format: {
          type: "json_schema",
          name: "assessment_questions",
          strict: true,
          schema: assessmentOutputJsonSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI assessment generation failed: ${response.status}`);
  }

  const data = (await response.json()) as ResponsesApiResult;
  const outputText = extractResponseText(data);

  if (!outputText) {
    throw new Error("OpenAI assessment generation returned no text.");
  }

  return assessmentOutputSchema.parse(JSON.parse(outputText)).questions;
}

function extractResponseText(data: ResponsesApiResult) {
  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  for (const item of data.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return null;
}
