export type AiProviderMode = "mock" | "openai";

export function getAiProviderMode(modelName = "mock"): AiProviderMode {
  return modelName === "mock" ? "mock" : "openai";
}
