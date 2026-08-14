import { describe, expect, it } from "vitest";
import { buildPromptContext, dataset, demoPredict, evaluateModel, getRagEvidence, safetyNet } from "./mesroute";

describe("MesRoute embedded routing engine", () => {
  it("retrieves relevant embedded RAG evidence for an Amazon delivery", () => {
    const evidence = getRagEvidence("u_1", "Your Amazon package was delivered today.");
    expect(evidence.map((item) => item.messageId)).toContain("hist_001");
    expect(evidence[0]?.score).toBeGreaterThan(0.1);
  });

  it("assembles user, business, quiet-hours, and evidence context before routing", () => {
    const amazon = dataset.messages.find((message) => message.messageId === "m_001");
    if (!amazon) throw new Error("Embedded Amazon sample is missing");
    const context = buildPromptContext(amazon);
    expect(context.prompt).toContain("User Info:");
    expect(context.prompt).toContain("22:00-08:00");
    expect(context.prompt).toContain("Amazon India");
    expect(context.prompt).toContain("Historical Message ID: hist_001");
  });

  it("faithfully routes canonical alert, promotion, and scam cases in Demo Mode", () => {
    const urgent = demoPredict(dataset.messages.find((message) => message.messageId === "m_002")!);
    const promotion = demoPredict(dataset.messages.find((message) => message.messageId === "m_004")!);
    const scam = demoPredict(dataset.messages.find((message) => message.messageId === "m_005")!);
    expect(urgent).toMatchObject({ action: "notify", messageType: "urgent", confidence: 0.92 });
    expect(promotion).toMatchObject({ action: "digest", messageType: "spam", confidence: 0.78 });
    expect(scam).toMatchObject({ action: "mute", messageType: "scam", confidence: 0.92 });
  });

  it("forces uncertain mute or digest decisions to notify", () => {
    const guarded = safetyNet({
      messageId: "low_confidence",
      action: "mute",
      messageType: "spam",
      confidence: 0.45,
      reason: "uncertain prediction",
      evidenceMessageIds: "none",
      evidence: [],
      mode: "demo",
    });
    expect(guarded.action).toBe("notify");
    expect(guarded.safetyOverride).toBe(true);
    expect(guarded.reason).toContain("Overridden to notify");
  });

  it("evaluates the embedded labelled set and produces a CSV export", async () => {
    const evaluation = await evaluateModel("demo");
    expect(evaluation.actionAccuracy).toBe(1);
    expect(evaluation.typeAccuracy).toBe(0.75);
    expect(evaluation.rows).toHaveLength(12);
    expect(evaluation.csv.split("\n")).toHaveLength(13);
    expect(evaluation.csv).toContain("predicted_action");
  });
});
