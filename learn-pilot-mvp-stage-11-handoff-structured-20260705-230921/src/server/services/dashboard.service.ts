import type {
  Assessment,
  DailyTask,
  LearningPlan,
  Note,
  ProgressLog,
  ResourceRecommendation,
  RoadmapStage,
} from "@prisma/client";
import { DEMO_USER_ID } from "@/lib/constants";
import { formatBeijingDate, getBeijingDayRange } from "@/lib/dates";
import { calculateProgressOverview } from "@/features/progress/calculations";
import { PlanRepository } from "@/server/repositories/plan.repository";
import { ResourceRepository } from "@/server/repositories/resource.repository";
import { TaskRepository } from "@/server/repositories/task.repository";

export type PlanCardView = {
  id: string;
  title: string;
  direction: string;
  goal: string;
  status: string;
  durationDays: number;
  dailyMinutes: number;
  startsOn: string | null;
  endsOn: string | null;
  completionRate: number;
  completedTasks: number;
  totalTasks: number;
  todayCompletionRate: number;
  todayCompletedTasks: number;
  todayTotalTasks: number;
  streakDays: number;
  canCheckIn: boolean;
  stageCount: number;
};

export type TaskView = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  statusLabel: string;
  taskTypeLabel: string;
  stageLabel?: string | null;
  stageSequence?: number | null;
  estimatedMinutes: number;
  completionCriteria: string;
  isCore: boolean;
};

export type ResourceView = {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  typeLabel: string;
  difficultyLabel: string;
  stageLabel: string | null;
  stageSequence?: number | null;
  sourceName: string | null;
  estimatedMinutes: number | null;
  recommendationReason: string;
  verificationNote: string;
};

export type RoadmapSourceReferenceView = {
  title: string;
  url?: string;
  note: string;
};

export type NoteView = {
  id: string;
  content: string;
  createdAt: string;
  taskTitle: string | null;
};

export type StageView = {
  id: string;
  title: string;
  sequence: number;
  statusLabel: string;
  startsOn: string | null;
  endsOn: string | null;
  goal: string;
  contentOutline: string;
  expectedOutcome: string;
  acceptanceCriteria: string;
  sequenceRationale: string;
  sourceReferences: RoadmapSourceReferenceView[];
  aiGenerated: boolean;
  sourcePromptVersion: string | null;
};

export type DashboardResult =
  | {
      status: "ready";
      todayLabel: string;
      activePlan: PlanCardView | null;
      plans: PlanCardView[];
      todayTasks: TaskView[];
      recommendedResources: ResourceView[];
    }
  | { status: "empty"; todayLabel: string }
  | { status: "unavailable"; todayLabel: string };

export type PlanDetailResult =
  | {
      status: "ready";
      plan: PlanCardView;
      stages: StageView[];
      tasks: TaskView[];
      resources: ResourceView[];
      notes: NoteView[];
      latestAssessment: {
        status: string;
        score: number | null;
        resultLevel: string | null;
      } | null;
    }
  | { status: "not-found" }
  | { status: "unavailable" };

const planRepository = new PlanRepository();
const taskRepository = new TaskRepository();
const resourceRepository = new ResourceRepository();

export async function getDashboard(): Promise<DashboardResult> {
  const todayLabel = formatBeijingDate(new Date());

  try {
    const plans = await getPlanCards();

    if (plans.length === 0) {
      return { status: "empty", todayLabel };
    }

    const activePlan = plans.find((plan) => plan.status === "进行中") ?? plans[0] ?? null;
    const { start, end } = getBeijingDayRange();
    const todayTasks = activePlan
      ? await taskRepository.listByPlanInRange(activePlan.id, start, end)
      : [];
    const resources = activePlan ? await resourceRepository.listByPlan(activePlan.id) : [];

    return {
      status: "ready",
      todayLabel,
      activePlan,
      plans,
      todayTasks: todayTasks.map(toTaskView),
      recommendedResources: resources.slice(0, 2).map(toResourceView),
    };
  } catch {
    return { status: "unavailable", todayLabel };
  }
}

export async function getPlansOverview(): Promise<DashboardResult> {
  const todayLabel = formatBeijingDate(new Date());

  try {
    const plans = await getPlanCards();

    if (plans.length === 0) {
      return { status: "empty", todayLabel };
    }

    return {
      status: "ready",
      todayLabel,
      activePlan: plans[0] ?? null,
      plans,
      todayTasks: [],
      recommendedResources: [],
    };
  } catch {
    return { status: "unavailable", todayLabel };
  }
}

export async function getPlanDetail(planId: string): Promise<PlanDetailResult> {
  try {
    const plan = await planRepository.findById(planId);

    if (!plan || plan.userId !== DEMO_USER_ID) {
      return { status: "not-found" };
    }

    return {
      status: "ready",
      plan: toPlanCard(plan),
      stages: plan.roadmapStages.map(toStageView),
      tasks: plan.dailyTasks.map(toTaskView),
      resources: plan.resourceRecommendations.map(toResourceView),
      notes: plan.notesRecords.map(toNoteView),
      latestAssessment: plan.assessments[0] ? toAssessmentView(plan.assessments[0]) : null,
    };
  } catch {
    return { status: "unavailable" };
  }
}

async function getPlanCards() {
  const plans = await planRepository.listByUser(DEMO_USER_ID);
  const hydratedPlans = await Promise.all(plans.map((plan) => planRepository.findById(plan.id)));

  return hydratedPlans.filter(isHydratedPlan).map((plan) => toPlanCard(plan));
}

function isHydratedPlan(
  plan: Awaited<ReturnType<PlanRepository["findById"]>>,
): plan is NonNullable<Awaited<ReturnType<PlanRepository["findById"]>>> {
  return plan !== null;
}

function toPlanCard(
  plan: LearningPlan & {
    roadmapStages: RoadmapStage[];
    dailyTasks: DailyTask[];
    progressLogs: ProgressLog[];
    notesRecords: Note[];
  },
): PlanCardView {
  const { start, end } = getBeijingDayRange();
  const todayTasks = plan.dailyTasks.filter(
    (task) => task.scheduledFor >= start && task.scheduledFor < end,
  );
  const overview = calculateProgressOverview({
    todayTasks,
    allTasks: plan.dailyTasks,
    progressLogs: plan.progressLogs,
  });

  return {
    id: plan.id,
    title: plan.title,
    direction: plan.learningDirection,
    goal: plan.specificGoal,
    status: planStatusLabels[plan.status],
    durationDays: plan.durationDays,
    dailyMinutes: plan.dailyMinutes,
    startsOn: plan.startsOn ? formatBeijingDate(plan.startsOn) : null,
    endsOn: plan.endsOn ? formatBeijingDate(plan.endsOn) : null,
    completionRate: Math.round(overview.overall.rate * 100),
    completedTasks: overview.overall.completed,
    totalTasks: overview.overall.total,
    todayCompletionRate: Math.round(overview.today.rate * 100),
    todayCompletedTasks: overview.today.completed,
    todayTotalTasks: overview.today.total,
    streakDays: overview.streakDays,
    canCheckIn: overview.canCheckIn,
    stageCount: plan.roadmapStages.length,
  };
}

type TaskWithStage = DailyTask & {
  stage?: Pick<RoadmapStage, "sequence" | "title"> | null;
};

function toTaskView(task: TaskWithStage): TaskView {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    statusLabel: taskStatusLabels[task.status],
    taskTypeLabel: taskTypeLabels[task.taskType],
    stageLabel: task.stage ? `阶段 ${task.stage.sequence}：${task.stage.title}` : null,
    stageSequence: task.stage?.sequence ?? null,
    estimatedMinutes: task.estimatedMinutes,
    completionCriteria: task.completionCriteria,
    isCore: task.isCore,
  };
}

type NoteWithTask = Note & {
  task: Pick<DailyTask, "title"> | null;
};

function toNoteView(note: NoteWithTask): NoteView {
  return {
    id: note.id,
    content: note.content,
    createdAt: formatBeijingDate(note.createdAt),
    taskTitle: note.task?.title ?? null,
  };
}

type ResourceWithStage = ResourceRecommendation & {
  stage: Pick<RoadmapStage, "sequence" | "title"> | null;
};

function toResourceView(resource: ResourceWithStage): ResourceView {
  return {
    id: resource.id,
    title: resource.title,
    status: resource.status,
    statusLabel: resourceStatusLabels[resource.status],
    typeLabel: resourceTypeLabels[resource.resourceType],
    difficultyLabel: taskDifficultyLabels[resource.difficulty],
    stageLabel: resource.stage ? `阶段 ${resource.stage.sequence}：${resource.stage.title}` : null,
    stageSequence: resource.stage?.sequence ?? null,
    sourceName: resource.sourceName,
    estimatedMinutes: resource.estimatedMinutes,
    recommendationReason: resource.recommendationReason,
    verificationNote: resource.verificationNote,
  };
}

function toStageView(stage: RoadmapStage): StageView {
  return {
    id: stage.id,
    title: stage.title,
    sequence: stage.sequence,
    statusLabel: stageStatusLabels[stage.status],
    startsOn: stage.startsOn ? formatBeijingDate(stage.startsOn) : null,
    endsOn: stage.endsOn ? formatBeijingDate(stage.endsOn) : null,
    goal: stage.goal,
    contentOutline: stage.contentOutline,
    expectedOutcome: stage.expectedOutcome,
    acceptanceCriteria: stage.acceptanceCriteria,
    sequenceRationale: stage.sequenceRationale,
    sourceReferences: toSourceReferences(stage.sourceReferences),
    aiGenerated: stage.aiGenerated,
    sourcePromptVersion: stage.sourcePromptVersion,
  };
}

function toSourceReferences(value: unknown): RoadmapSourceReferenceView[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const reference = item as Record<string, unknown>;
      const title = typeof reference.title === "string" ? reference.title : "";
      const url = typeof reference.url === "string" ? reference.url : undefined;
      const note = typeof reference.note === "string" ? reference.note : "";

      if (!title || !note) {
        return null;
      }

      const parsed: RoadmapSourceReferenceView = url ? { title, url, note } : { title, note };
      return parsed;
    })
    .filter((item): item is RoadmapSourceReferenceView => item !== null);
}

function toAssessmentView(assessment: Assessment) {
  return {
    status: assessmentStatusLabels[assessment.status],
    score: assessment.score,
    resultLevel: assessment.resultLevel ? foundationLevelLabels[assessment.resultLevel] : null,
  };
}

const planStatusLabels = {
  draft: "草稿",
  active: "进行中",
  paused: "已暂停",
  completed: "已完成",
  archived: "已归档",
} as const;

const taskStatusLabels = {
  todo: "待办",
  in_progress: "进行中",
  done: "已完成",
  skipped: "已跳过",
  delayed: "已延期",
} as const;

const taskTypeLabels = {
  reading: "阅读",
  watching: "观看",
  practice: "练习",
  output: "输出",
  test: "测试",
  review: "复盘",
  resource_organization: "资源整理",
  project: "项目",
} as const;

const taskDifficultyLabels = {
  easy: "轻量",
  medium: "适中",
  challenging: "有挑战",
} as const;

const stageStatusLabels = {
  planned: "未开始",
  active: "进行中",
  completed: "已完成",
  adjusted: "已调整",
} as const;

const resourceTypeLabels = {
  video_course: "视频课",
  book: "书籍",
  article: "文章",
  paper: "论文",
  case_study: "案例",
  official_doc: "官方文档",
  open_source: "开源项目",
  exercise: "练习",
  tool_guide: "工具指南",
  website: "网站",
} as const;

const resourceStatusLabels = {
  want_to_learn: "想学",
  learned: "已学",
  unsuitable: "不适合",
  invalid: "已失效",
} as const;

const assessmentStatusLabels = {
  generated: "已生成",
  completed: "已完成",
  skipped: "已跳过",
} as const;

const foundationLevelLabels = {
  zero: "零基础",
  beginner: "入门",
  intermediate: "中级",
  advanced: "进阶",
} as const;
