import { db, evalsTracesTable } from "@workspace/db";
import { LIV_RUNTIME_REF } from "@workspace/liv-runtime";
import { generateId } from "./id";

export async function recordEvalTraceForTool(args: {
  businessId: string;
  suite: string;
  scenario: string;
  toolName: string;
  toolInput: Record<string, unknown>;
  toolResult: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(evalsTracesTable).values({
      id: generateId(),
      businessId: args.businessId,
      suite: args.suite,
      scenario: args.scenario,
      layer: "PRE_MERGE",
      outcome: "PASS",
      inputScrubbed: { tool: args.toolName, input: args.toolInput },
      outputScrubbed: args.toolResult,
      rubricScores: [{ rubricKey: `tool.${args.toolName}`, score: 1 }],
      livRuntimeRef: LIV_RUNTIME_REF,
      metadata: { source: "liv-tool-side-effect" },
    });
  } catch (err) {
    console.error("[eval-traces] failed to persist tool trace", err);
  }
}

export async function recordLivWasWrongEvalTrace(args: {
  businessId: string;
  ticketId: string;
  description: string;
  bookingId?: string;
  conversationId?: string;
  memoryId: string;
}): Promise<void> {
  try {
    await db.insert(evalsTracesTable).values({
      id: generateId(),
      businessId: args.businessId,
      suite: "liv.was_wrong",
      scenario: "owner_correction",
      layer: "ROLLBACK_CLASS",
      outcome: "FAIL",
      inputScrubbed: {
        ticketId: args.ticketId,
        description: args.description,
        bookingId: args.bookingId ?? null,
        conversationId: args.conversationId ?? null,
      },
      outputScrubbed: { memoryId: args.memoryId },
      rubricScores: [{ rubricKey: "liv.correction.recorded", score: 0 }],
      contributedToRollback: true,
      livRuntimeRef: LIV_RUNTIME_REF,
      metadata: { source: "liv-was-wrong-workflow" },
    });
  } catch (err) {
    console.error("[eval-traces] failed to persist liv-was-wrong trace", err);
  }
}

export async function recordHypothesisEvalTrace(args: {
  businessId: string;
  hypothesisId: string;
  outcome: "PASS" | "FAIL" | "FLAG_FOR_REVIEW";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(evalsTracesTable).values({
      id: generateId(),
      businessId: args.businessId,
      suite: "liv.hypothesis",
      scenario: "nightly_discovery",
      layer: "ONLINE_SAMPLED",
      outcome: args.outcome,
      inputScrubbed: args.input,
      outputScrubbed: args.output,
      rubricScores: [{ rubricKey: "liv.hypothesis", score: args.outcome === "PASS" ? 1 : 0 }],
      livRuntimeRef: LIV_RUNTIME_REF,
      metadata: { hypothesisId: args.hypothesisId },
    });
  } catch (err) {
    console.error("[eval-traces] failed to persist hypothesis trace", err);
  }
}
