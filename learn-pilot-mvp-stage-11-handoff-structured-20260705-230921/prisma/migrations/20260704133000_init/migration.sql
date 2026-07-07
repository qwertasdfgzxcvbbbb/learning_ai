-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('quick_start', 'systematic', 'exam_prep', 'job_project', 'research', 'language', 'skill');

-- CreateEnum
CREATE TYPE "FoundationLevel" AS ENUM ('zero', 'beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('generated', 'completed', 'skipped');

-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('planned', 'active', 'completed', 'adjusted');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'done', 'skipped', 'delayed');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('reading', 'watching', 'practice', 'output', 'test', 'review', 'resource_organization', 'project');

-- CreateEnum
CREATE TYPE "TaskDifficulty" AS ENUM ('easy', 'medium', 'challenging');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('video_course', 'book', 'article', 'paper', 'case_study', 'official_doc', 'open_source', 'exercise', 'tool_guide', 'website');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('want_to_learn', 'learned', 'unsuitable', 'invalid');

-- CreateEnum
CREATE TYPE "ProgressLogType" AS ENUM ('task_completed', 'task_delayed', 'task_skipped', 'manual_time', 'check_in');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('weekly', 'stage');

-- CreateEnum
CREATE TYPE "AdjustmentStatus" AS ENUM ('pending', 'accepted', 'rejected', 'applied');

-- CreateEnum
CREATE TYPE "AiCallStatus" AS ENUM ('success', 'schema_failed', 'timeout', 'error', 'mocked');

-- CreateEnum
CREATE TYPE "AiTaskType" AS ENUM ('generate_assessment', 'generate_roadmap', 'generate_daily_tasks', 'recommend_resources', 'generate_review_adjustment');

-- CreateEnum
CREATE TYPE "PlanVersionSource" AS ENUM ('initial', 'user_edit', 'ai_adjustment');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Shanghai',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "learningDirection" TEXT NOT NULL,
    "specificGoal" TEXT NOT NULL,
    "goalType" "GoalType" NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'draft',
    "foundationLevel" "FoundationLevel" NOT NULL DEFAULT 'beginner',
    "durationDays" INTEGER NOT NULL,
    "dailyMinutes" INTEGER NOT NULL,
    "weeklyStudyDays" INTEGER NOT NULL DEFAULT 5,
    "preferredResources" TEXT[],
    "targetOutcome" TEXT,
    "startsOn" TIMESTAMP(3),
    "endsOn" TIMESTAMP(3),
    "reminderHour" INTEGER NOT NULL DEFAULT 20,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "sourcePromptVersion" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'generated',
    "selfLevel" "FoundationLevel",
    "generatedQuestions" JSONB NOT NULL,
    "answers" JSONB,
    "score" INTEGER,
    "resultLevel" "FoundationLevel",
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "confidenceNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapStage" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "status" "StageStatus" NOT NULL DEFAULT 'planned',
    "startsOn" TIMESTAMP(3),
    "endsOn" TIMESTAMP(3),
    "goal" TEXT NOT NULL,
    "contentOutline" TEXT NOT NULL,
    "expectedOutcome" TEXT NOT NULL,
    "acceptanceCriteria" TEXT NOT NULL,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "sourcePromptVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyTask" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "stageId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskType" "TaskType" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "difficulty" "TaskDifficulty" NOT NULL DEFAULT 'medium',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "completionCriteria" TEXT NOT NULL,
    "isCore" BOOLEAN NOT NULL DEFAULT true,
    "completedAt" TIMESTAMP(3),
    "delayedFrom" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceRecommendation" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "stageId" TEXT,
    "title" TEXT NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "url" TEXT,
    "sourceName" TEXT,
    "status" "ResourceStatus" NOT NULL DEFAULT 'want_to_learn',
    "difficulty" "TaskDifficulty" NOT NULL DEFAULT 'medium',
    "estimatedMinutes" INTEGER,
    "recommendationReason" TEXT NOT NULL,
    "verificationNote" TEXT NOT NULL,
    "requiresVerification" BOOLEAN NOT NULL DEFAULT true,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressLog" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "taskId" TEXT,
    "type" "ProgressLogType" NOT NULL,
    "loggedFor" TIMESTAMP(3) NOT NULL,
    "minutes" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "taskId" TEXT,
    "stageId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "reviewType" "ReviewType" NOT NULL DEFAULT 'weekly',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "completionRate" DOUBLE PRECISION NOT NULL,
    "delayedTaskCount" INTEGER NOT NULL DEFAULT 0,
    "skippedTaskCount" INTEGER NOT NULL DEFAULT 0,
    "blockers" TEXT,
    "satisfactionScore" INTEGER,
    "nextGoal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanAdjustment" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "reviewId" TEXT,
    "status" "AdjustmentStatus" NOT NULL DEFAULT 'pending',
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "impactScope" TEXT NOT NULL,
    "proposedChanges" JSONB NOT NULL,
    "beforeSnapshot" JSONB NOT NULL,
    "afterSnapshot" JSONB,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),

    CONSTRAINT "PlanAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanVersion" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "source" "PlanVersionSource" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiCallLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "planId" TEXT,
    "taskType" "AiTaskType" NOT NULL,
    "status" "AiCallStatus" NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "model" TEXT NOT NULL DEFAULT 'mock',
    "promptVersion" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "errorMessage" TEXT,
    "tokenCount" INTEGER,
    "estimatedCost" DOUBLE PRECISION,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiCallLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "LearningPlan_userId_idx" ON "LearningPlan"("userId");

-- CreateIndex
CREATE INDEX "LearningPlan_status_idx" ON "LearningPlan"("status");

-- CreateIndex
CREATE INDEX "Assessment_planId_idx" ON "Assessment"("planId");

-- CreateIndex
CREATE INDEX "Assessment_status_idx" ON "Assessment"("status");

-- CreateIndex
CREATE INDEX "RoadmapStage_planId_idx" ON "RoadmapStage"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapStage_planId_sequence_key" ON "RoadmapStage"("planId", "sequence");

-- CreateIndex
CREATE INDEX "DailyTask_planId_scheduledFor_idx" ON "DailyTask"("planId", "scheduledFor");

-- CreateIndex
CREATE INDEX "DailyTask_stageId_idx" ON "DailyTask"("stageId");

-- CreateIndex
CREATE INDEX "DailyTask_status_idx" ON "DailyTask"("status");

-- CreateIndex
CREATE INDEX "ResourceRecommendation_planId_idx" ON "ResourceRecommendation"("planId");

-- CreateIndex
CREATE INDEX "ResourceRecommendation_stageId_idx" ON "ResourceRecommendation"("stageId");

-- CreateIndex
CREATE INDEX "ResourceRecommendation_status_idx" ON "ResourceRecommendation"("status");

-- CreateIndex
CREATE INDEX "ProgressLog_planId_loggedFor_idx" ON "ProgressLog"("planId", "loggedFor");

-- CreateIndex
CREATE INDEX "ProgressLog_taskId_idx" ON "ProgressLog"("taskId");

-- CreateIndex
CREATE INDEX "Note_planId_idx" ON "Note"("planId");

-- CreateIndex
CREATE INDEX "Note_taskId_idx" ON "Note"("taskId");

-- CreateIndex
CREATE INDEX "Note_stageId_idx" ON "Note"("stageId");

-- CreateIndex
CREATE INDEX "Review_planId_periodStart_idx" ON "Review"("planId", "periodStart");

-- CreateIndex
CREATE INDEX "PlanAdjustment_planId_idx" ON "PlanAdjustment"("planId");

-- CreateIndex
CREATE INDEX "PlanAdjustment_status_idx" ON "PlanAdjustment"("status");

-- CreateIndex
CREATE INDEX "PlanVersion_planId_idx" ON "PlanVersion"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanVersion_planId_version_key" ON "PlanVersion"("planId", "version");

-- CreateIndex
CREATE INDEX "AiCallLog_userId_idx" ON "AiCallLog"("userId");

-- CreateIndex
CREATE INDEX "AiCallLog_planId_idx" ON "AiCallLog"("planId");

-- CreateIndex
CREATE INDEX "AiCallLog_taskType_status_idx" ON "AiCallLog"("taskType", "status");

-- AddForeignKey
ALTER TABLE "LearningPlan" ADD CONSTRAINT "LearningPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LearningPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapStage" ADD CONSTRAINT "RoadmapStage_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LearningPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTask" ADD CONSTRAINT "DailyTask_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LearningPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTask" ADD CONSTRAINT "DailyTask_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "RoadmapStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceRecommendation" ADD CONSTRAINT "ResourceRecommendation_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LearningPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceRecommendation" ADD CONSTRAINT "ResourceRecommendation_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "RoadmapStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressLog" ADD CONSTRAINT "ProgressLog_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LearningPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressLog" ADD CONSTRAINT "ProgressLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "DailyTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LearningPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "DailyTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "RoadmapStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LearningPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAdjustment" ADD CONSTRAINT "PlanAdjustment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LearningPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAdjustment" ADD CONSTRAINT "PlanAdjustment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanVersion" ADD CONSTRAINT "PlanVersion_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LearningPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCallLog" ADD CONSTRAINT "AiCallLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCallLog" ADD CONSTRAINT "AiCallLog_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LearningPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

