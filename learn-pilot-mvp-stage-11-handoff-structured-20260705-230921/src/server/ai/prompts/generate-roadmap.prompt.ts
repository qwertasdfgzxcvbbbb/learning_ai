export const ROADMAP_PROMPT_VERSION = "mock-roadmap-v1";

export const generateRoadmapPrompt = `
你是一个学习计划助理。根据用户的学习目标、周期、每日可用时间和基础测评结果，生成结构化学习路线图。

输出必须包含：
1. 2 到 4 个学习阶段。
2. 每个阶段包含目标、内容提纲、预期产出和验收标准。
3. 前 3 天的核心学习任务。
4. 2 到 4 条资源建议。
5. 所有资源建议必须提醒用户自行核验。

MVP 阶段使用 mock 输出，不调用真实模型。
`;
