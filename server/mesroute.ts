import { invokeLLM, listLLMModels } from "./_core/llm";

export const ACTIONS = ["notify", "digest", "mute"] as const;
export const MESSAGE_TYPES = [
  "personal",
  "urgent",
  "event",
  "payment",
  "business_update",
  "promotion",
  "greeting",
  "forward",
  "spam",
  "scam",
  "unknown",
] as const;

export type Action = (typeof ACTIONS)[number];
export type MessageType = (typeof MESSAGE_TYPES)[number];
export type ConversationType = "personal" | "group" | "business";
export type RouterMode = "demo" | "live";

export type IncomingMessage = {
  messageId?: string;
  userId: string;
  conversationType: ConversationType;
  messageText: string;
  forwardedCount?: number;
  groupId?: string;
  businessId?: string;
};

export type Evidence = { messageId: string; text: string; score: number };

export type RoutingResult = {
  messageId: string;
  action: Action;
  messageType: MessageType;
  confidence: number;
  reason: string;
  evidenceMessageIds: string;
  evidence: Evidence[];
  mode: "demo" | "live";
  safetyOverride: boolean;
};

type User = {
  user_id: string;
  quiet_hours: string;
  recent_opens: number;
  recent_replies: number;
  name: string;
};
type Group = { group_id: string; group_name: string; member_count: number; category: string };
type Business = { business_id: string; business_name: string; verified: boolean; category: string };
type History = { message_id: string; user_id: string; message_text: string };
type DatasetMessage = IncomingMessage & { messageId: string };
type Label = { messageId: string; action: Action; messageType: MessageType };

/**
 * Fully embedded synthetic dataset. The records mirror the project's original
 * CSV demo data, but the website never needs uploads or local files.
 */
export const dataset = {
  users: [
    { user_id: "u_1", quiet_hours: "22:00-08:00", recent_opens: 50, recent_replies: 10, name: "Aarav Sharma" },
    { user_id: "u_2", quiet_hours: "23:00-07:00", recent_opens: 20, recent_replies: 4, name: "Priya Patel" },
    { user_id: "u_3", quiet_hours: "21:00-06:00", recent_opens: 80, recent_replies: 30, name: "Rohan Gupta" },
    { user_id: "u_4", quiet_hours: "00:00-00:00", recent_opens: 10, recent_replies: 2, name: "Sneha Reddy" },
  ] satisfies User[],
  groups: [
    { group_id: "g_1", group_name: "Sharma Family", member_count: 8, category: "family" },
    { group_id: "g_2", group_name: "Office Team Alpha", member_count: 12, category: "work" },
    { group_id: "g_3", group_name: "IITB Alumni 2020", member_count: 312, category: "community" },
    { group_id: "g_4", group_name: "Deals & Offers India", member_count: 498, category: "promo" },
    { group_id: "g_5", group_name: "Cricket Updates 24x7", member_count: 250, category: "community" },
  ] satisfies Group[],
  groupMembers: [
    { user_id: "u_1", group_id: "g_1" }, { user_id: "u_1", group_id: "g_2" },
    { user_id: "u_1", group_id: "g_3" }, { user_id: "u_1", group_id: "g_5" },
    { user_id: "u_2", group_id: "g_2" }, { user_id: "u_2", group_id: "g_3" },
    { user_id: "u_3", group_id: "g_1" }, { user_id: "u_3", group_id: "g_4" },
    { user_id: "u_3", group_id: "g_5" }, { user_id: "u_4", group_id: "g_4" },
  ],
  businesses: [
    { business_id: "b_1", business_name: "Zomato", verified: true, category: "food_delivery" },
    { business_id: "b_2", business_name: "Amazon India", verified: true, category: "ecommerce" },
    { business_id: "b_3", business_name: "State Bank of India", verified: true, category: "banking" },
    { business_id: "b_4", business_name: "LuckyLoot Rewards", verified: false, category: "promotions" },
    { business_id: "b_5", business_name: "QuickCash Loans", verified: false, category: "finance" },
  ] satisfies Business[],
  userBusinessHistory: [
    { user_id: "u_1", business_id: "b_2", interactions: 35, last_interaction_days_ago: 2 },
    { user_id: "u_1", business_id: "b_3", interactions: 12, last_interaction_days_ago: 15 },
    { user_id: "u_2", business_id: "b_1", interactions: 8, last_interaction_days_ago: 7 },
    { user_id: "u_3", business_id: "b_4", interactions: 2, last_interaction_days_ago: 60 },
  ],
  history: [
    { message_id: "hist_001", user_id: "u_1", message_text: "Your Amazon package has been delivered." },
    { message_id: "hist_002", user_id: "u_1", message_text: "Order dispatched, tracking number available in app." },
    { message_id: "hist_003", user_id: "u_1", message_text: "Congratulations! You won a free gift card, claim now!" },
    { message_id: "hist_004", user_id: "u_1", message_text: "Hey, please review the PR soon." },
    { message_id: "hist_005", user_id: "u_1", message_text: "Meeting postponed to 3 PM today." },
    { message_id: "hist_006", user_id: "u_1", message_text: "Flight confirmation: BLR to MAA, 14 Aug." },
    { message_id: "hist_007", user_id: "u_1", message_text: "Rs 500 cashback on your next order, limited offer." },
    { message_id: "hist_008", user_id: "u_1", message_text: "UPI payment of Rs 2500 received from Rohan." },
    { message_id: "hist_009", user_id: "u_2", message_text: "Food order from Zomato is on the way." },
    { message_id: "hist_010", user_id: "u_2", message_text: "Your subscription renewal failed, update card." },
    { message_id: "hist_011", user_id: "u_2", message_text: "Free bitcoin giveaway, send wallet address to claim!" },
    { message_id: "hist_012", user_id: "u_2", message_text: "Project deadline moved to Friday. Please plan accordingly." },
    { message_id: "hist_013", user_id: "u_3", message_text: "Big sale this weekend! Up to 70% off on electronics." },
    { message_id: "hist_014", user_id: "u_3", message_text: "Score update: India 245/3 in 40 overs." },
    { message_id: "hist_015", user_id: "u_3", message_text: "OTP for login: 482913. Never share this code." },
    { message_id: "hist_016", user_id: "u_3", message_text: "Mama's birthday party this Sunday at home." },
  ] satisfies History[],
  messages: [
    { messageId: "m_001", userId: "u_1", conversationType: "business", businessId: "b_2", messageText: "Your Amazon package has been delivered at your doorstep.", forwardedCount: 0 },
    { messageId: "m_002", userId: "u_1", conversationType: "group", groupId: "g_2", messageText: "URGENT: production server is down, need immediate rollback.", forwardedCount: 0 },
    { messageId: "m_003", userId: "u_1", conversationType: "personal", messageText: "Happy birthday! Hope you have an amazing day!", forwardedCount: 0 },
    { messageId: "m_004", userId: "u_1", conversationType: "group", groupId: "g_4", messageText: "MEGA SALE TODAY! Flash sale on all smartphones, huge discount offer. Buy now!", forwardedCount: 3 },
    { messageId: "m_005", userId: "u_2", conversationType: "business", businessId: "b_4", messageText: "Congratulations! You won a Rs 10,000 gift card. Click here to claim!", forwardedCount: 12 },
    { messageId: "m_006", userId: "u_1", conversationType: "personal", messageText: "Can we meet at 5 PM to discuss the trip plan?", forwardedCount: 0 },
    { messageId: "m_007", userId: "u_3", conversationType: "group", groupId: "g_5", messageText: "WICKET! Kohli out for 89. Score update: India 246/4, match confirmed live.", forwardedCount: 1 },
    { messageId: "m_008", userId: "u_1", conversationType: "business", businessId: "b_3", messageText: "Rs 2500 received via UPI from Rohan. New balance: Rs 12400.", forwardedCount: 0 },
    { messageId: "m_009", userId: "u_2", conversationType: "group", groupId: "g_3", messageText: "Alumni meetup scheduled for 26th Jan at campus. RSVP by Friday.", forwardedCount: 2 },
    { messageId: "m_010", userId: "u_4", conversationType: "business", groupId: "g_4", businessId: "b_5", messageText: "Pre-approved loan of Rs 5 lakh! Apply now with no documents, limited offer promo.", forwardedCount: 7 },
    { messageId: "m_011", userId: "u_1", conversationType: "personal", messageText: "Forwarded: 10 tips to boost productivity.", forwardedCount: 5 },
    { messageId: "m_012", userId: "u_3", conversationType: "group", groupId: "g_1", messageText: "Sunday lunch meeting at grandma's house, birthday party for Dad.", forwardedCount: 0 },
  ] satisfies DatasetMessage[],
  labels: [
    { messageId: "m_001", action: "notify", messageType: "event" },
    { messageId: "m_002", action: "notify", messageType: "urgent" },
    { messageId: "m_003", action: "notify", messageType: "greeting" },
    { messageId: "m_004", action: "digest", messageType: "promotion" },
    { messageId: "m_005", action: "mute", messageType: "scam" },
    { messageId: "m_006", action: "notify", messageType: "personal" },
    { messageId: "m_007", action: "digest", messageType: "event" },
    { messageId: "m_008", action: "notify", messageType: "payment" },
    { messageId: "m_009", action: "digest", messageType: "event" },
    { messageId: "m_010", action: "mute", messageType: "spam" },
    { messageId: "m_011", action: "digest", messageType: "forward" },
    { messageId: "m_012", action: "digest", messageType: "personal" },
  ] satisfies Label[],
};

const KEYWORDS: Record<string, string[]> = {
  scam: ["won", "winner", "claim", "free gift", "lottery", "bitcoin", "giveaway", "account suspended", "pre-approved loan"],
  spam: ["mega sale", "flash sale", "buy now", "no documents", "apply now", "limited offer"],
  payment: ["upi", "payment", "received", "balance", "paid", "invoice", "transfer", "amount", "rupees", "rs "],
  urgent: ["urgent", "emergency", "down", "critical", "asap", "immediate", "server is down", "help me"],
  event: ["delivered", "package", "shipped", "order", "flight", "booking", "confirmed", "wicket", "score", "meetup", "scheduled", "rsvp", "postponed"],
  promotion: ["discount", "offer", "promo", "cashback", "deal", "off on", "off on all", "off today"],
  greeting: ["hello", "hi", "hey", "good morning", "good night", "happy birthday", "congratulations", "welcome", "how are you", "amazing day"],
  forward: ["forwarded", "fwd:"],
  personal: ["meet at", "trip plan", "lunch at", "party for", "tonight", "free this weekend", "call me back", "miss you", "how was"],
};

const EVAL_ORDER: MessageType[] = ["scam", "urgent", "payment", "personal", "greeting", "forward", "event", "promotion", "spam", "unknown"];
const ACTION_HEURISTICS: Record<string, [Action, string]> = {
  urgent: ["notify", "Time-critical messages always notify"],
  payment: ["notify", "Financial transactions are never muted"],
  personal: ["notify", "Direct personal messages notify by default"],
  greeting: ["notify", "Friendly greetings from known senders notify"],
  event: ["notify", "Delivery/booking notifications notify"],
  forward: ["digest", "Forwards defer to digest unless urgent"],
  promotion: ["digest", "Promotions go to daily digest"],
  spam: ["mute", "Mass-sent promotional spam is muted"],
  scam: ["mute", "Scam indicators get muted for safety"],
  business_update: ["notify", "Verified business updates notify"],
};

const STOPWORDS = new Set(["a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "in", "is", "it", "of", "on", "or", "the", "to", "was", "with", "your"]);

function toTokens(text: string) {
  return text.toLowerCase().match(/[a-z0-9]+/g)?.filter((token) => !STOPWORDS.has(token)) ?? [];
}

/** Lightweight TF-IDF/cosine implementation used exclusively against the embedded data. */
export function getRagEvidence(userId: string, incomingText: string, topK = 2): Evidence[] {
  const history = dataset.history.filter((row) => row.user_id === userId);
  if (!history.length || !incomingText.trim()) return [];

  const docs = [...history.map((row) => toTokens(row.message_text)), toTokens(incomingText)];
  const documentFrequency = new Map<string, number>();
  docs.forEach((doc) => new Set(doc).forEach((term) => documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1)));
  const idf = (term: string) => Math.log((docs.length + 1) / ((documentFrequency.get(term) ?? 0) + 1)) + 1;
  const vectorize = (tokens: string[]) => {
    const counts = new Map<string, number>();
    tokens.forEach((term) => counts.set(term, (counts.get(term) ?? 0) + 1));
    const vector = new Map<string, number>();
    counts.forEach((count, term) => vector.set(term, count * idf(term)));
    return vector;
  };
  const queryVector = vectorize(docs.at(-1) ?? []);
  const queryMagnitude = Math.sqrt(Array.from(queryVector.values()).reduce((sum, value) => sum + value * value, 0));
  if (!queryMagnitude) return [];

  return history
    .map((row, index) => {
      const vector = vectorize(docs[index]);
    const magnitude = Math.sqrt(Array.from(vector.values()).reduce((sum, value) => sum + value * value, 0));
    const dot = Array.from(queryVector.entries()).reduce((sum, [term, value]) => sum + value * (vector.get(term) ?? 0), 0);
      return { messageId: row.message_id, text: row.message_text, score: magnitude ? dot / (queryMagnitude * magnitude) : 0 };
    })
    .filter((entry) => entry.score > 0.1)
    .sort((left, right) => right.score - left.score)
    .slice(0, topK);
}

function inferContext(input: IncomingMessage): Required<IncomingMessage> {
  const messageText = input.messageText.trim();
  const lower = messageText.toLowerCase();
  const matchingSample = dataset.messages.find((message) => message.messageText === messageText);
  const inferGroup = () => {
    if (matchingSample?.groupId) return matchingSample.groupId;
    if (/sale|discount|deal|offer|promo/.test(lower)) return "g_4";
    if (/wicket|score|match/.test(lower)) return "g_5";
    if (/alumni|meetup|rsvp/.test(lower)) return "g_3";
    if (/grandma|birthday party|family/.test(lower)) return "g_1";
    return "g_2";
  };
  const inferBusiness = () => {
    if (matchingSample?.businessId) return matchingSample.businessId;
    if (/amazon|package|delivered|order/.test(lower)) return "b_2";
    if (/upi|payment|balance|invoice|received/.test(lower)) return "b_3";
    if (/loan|documents|pre-approved/.test(lower)) return "b_5";
    if (/gift card|winner|claim|congratulations/.test(lower)) return "b_4";
    return "";
  };

  return {
    messageId: input.messageId || `route_${Math.random().toString(36).slice(2, 9)}`,
    userId: input.userId || "u_1",
    conversationType: input.conversationType,
    messageText,
    forwardedCount: input.forwardedCount ?? matchingSample?.forwardedCount ?? 0,
    groupId: input.groupId ?? (input.conversationType === "group" ? inferGroup() : ""),
    businessId: input.businessId ?? (input.conversationType === "business" ? inferBusiness() : ""),
  };
}

export function buildPromptContext(input: IncomingMessage) {
  const row = inferContext(input);
  const user = dataset.users.find((item) => item.user_id === row.userId);
  const group = dataset.groups.find((item) => item.group_id === row.groupId);
  const business = dataset.businesses.find((item) => item.business_id === row.businessId);
  const relationship = dataset.userBusinessHistory.find((item) => item.user_id === row.userId && item.business_id === row.businessId);
  const evidence = getRagEvidence(row.userId, row.messageText);
  const lines: string[] = [];
  if (user) lines.push(`User Info: ${JSON.stringify(user)}`);
  if (group) lines.push(`Group Info: ${JSON.stringify(group)}`);
  if (business) lines.push(`Business Info: ${JSON.stringify(business)}`);
  if (relationship) lines.push(`User-Business History: ${JSON.stringify(relationship)}`);
  if (evidence.length) {
    lines.push("--- Similar Historical Messages (RAG Evidence) ---");
    evidence.forEach((item) => lines.push(`Historical Message ID: ${item.messageId} | Text: ${item.text}`));
  }
  const prompt = `You are an AI Message Notification Router for WhatsApp.\nYour task is to classify an incoming message and decide the routing action.\n\nAllowed Actions: notify, digest, mute\nAllowed Message Types: ${MESSAGE_TYPES.join(", ")}\n\n--- Context Data ---\n${lines.join("\n") || "No matching context available."}\n\n--- Incoming Message Details ---\nConversation Type: ${row.conversationType}\nMessage Text: ${row.messageText}\nForwarded Count: ${row.forwardedCount}\n\nPlease output valid JSON exactly matching: {"action":"notify","message_type":"personal","reason":"short human-readable explanation","confidence":0.95,"evidence_message_ids":"id1;id2 or none"}`;
  return { row, prompt, evidence, contextLines: lines, user, group, business, relationship };
}

function classifyType(text: string): MessageType {
  const lower = text.toLowerCase();
  let bestType: MessageType = "unknown";
  let bestScore = 0;
  for (const type of EVAL_ORDER) {
    const score = (KEYWORDS[type] ?? []).filter((keyword) => lower.includes(keyword)).length;
    if (score > bestScore) {
      bestType = type;
      bestScore = score;
    }
  }
  return bestType;
}

export function safetyNet(result: Omit<RoutingResult, "safetyOverride">): RoutingResult {
  const safetyOverride = result.confidence < 0.6 && result.action !== "notify";
  return {
    ...result,
    action: safetyOverride ? "notify" : result.action,
    reason: `${result.reason}${safetyOverride ? " [Overridden to notify due to low confidence]" : ""}`,
    safetyOverride,
  };
}

/** Exact port of the Python Demo Mode decision order, including its context-specific overrides. */
export function demoPredict(input: IncomingMessage): RoutingResult {
  const { row, evidence, user, group, business } = buildPromptContext(input);
  const reasonParts: string[] = [];
  const evidenceMessageIds = evidence.length ? evidence.map((item) => item.messageId).join(";") : "none";
  if (evidence.length) reasonParts.push("RAG retrieved matching history");
  const businessVerified = business?.verified;
  const businessName = business?.business_name ?? "";
  const groupSize = group?.member_count;
  const quietHours = user?.quiet_hours ?? "";
  let messageType = classifyType(row.messageText);

  if (row.forwardedCount >= 5 && businessVerified === false) {
    messageType = "scam";
    reasonParts.push(`mass-forwarded (${row.forwardedCount}x) from unverified business '${businessName}'`);
  } else if (row.forwardedCount >= 3 && ["spam", "scam", "unknown", "forward"].includes(messageType)) {
    messageType = "spam";
    reasonParts.push(`forwarded ${row.forwardedCount} times`);
  } else if (row.forwardedCount >= 1 && messageType === "unknown") {
    messageType = "forward";
    reasonParts.push(`forwarded ${row.forwardedCount} time(s)`);
  }
  if (businessVerified === false) reasonParts.push(`'${businessName}' is not a verified business`);
  const isLargeGroup = groupSize !== undefined && groupSize >= 100;
  if (isLargeGroup) reasonParts.push(`large group (${groupSize} members)`);
  if (quietHours && quietHours !== "00:00-00:00") reasonParts.push(`quiet hours set: ${quietHours}`);

  let [action, note] = ACTION_HEURISTICS[messageType] ?? ["digest", "default handling"];
  if (row.conversationType === "personal" && !["scam", "spam"].includes(messageType)) {
    action = "notify";
    reasonParts.push("direct personal conversation");
  } else if (row.conversationType === "personal" && messageType === "spam") {
    action = "digest";
    reasonParts.push("personal conversation; spam softened to digest");
  } else if (row.conversationType === "group" && messageType === "spam") {
    action = "digest";
    reasonParts.push("group promo content softened to digest");
  }
  if (row.conversationType === "group" && action === "notify" && ["personal", "greeting"].includes(messageType) && !isLargeGroup) {
    action = "digest";
    reasonParts.push("group chat social message; batched to digest");
  }
  if (row.conversationType === "group" && !isLargeGroup && action === "digest") {
    if (messageType === "event") {
      action = "notify";
      reasonParts.push("small group event; notifies for relevance");
    } else if (messageType === "personal") {
      action = "digest";
      reasonParts.push("small family-group chat; batched to digest");
    }
  }
  if (isLargeGroup && messageType === "event" && action === "notify") {
    action = "digest";
    reasonParts.push("community-group event; deferred to digest");
  }
  if (businessVerified === false && ["spam", "promotion"].includes(messageType)) {
    action = row.forwardedCount >= 5 ? "mute" : "digest";
    reasonParts.push("unverified business; promotional content softened to digest");
  }
  if (isLargeGroup && action === "notify" && ["promotion", "spam", "forward"].includes(messageType)) {
    action = "digest";
    reasonParts.push("large group noise filtered to digest");
  }
  if (isLargeGroup && messageType === "spam") {
    action = "digest";
    reasonParts.push("large promo-group content; deferred to digest");
  }
  const confidence = action === "digest" ? 0.78 : 0.92;
  return safetyNet({
    messageId: row.messageId,
    action,
    messageType,
    confidence,
    reason: `${reasonParts.length ? `Demo Mode: ${reasonParts.join("; ")}` : "Demo Mode: keyword matched"} -> ${note}`,
    evidenceMessageIds,
    evidence,
    mode: "demo",
  });
}

let geminiModelPromise: Promise<string | undefined> | undefined;
async function getGeminiModel() {
  geminiModelPromise ??= listLLMModels().then((response) => {
    const models = (response as { data?: Array<{ id?: string }> }).data ?? [];
    return models.find((model) => /gemini/i.test(model.id ?? ""))?.id;
  }).catch(() => undefined);
  return geminiModelPromise;
}

export async function livePredict(input: IncomingMessage): Promise<RoutingResult> {
  const { row, prompt, evidence } = buildPromptContext(input);
  const model = await getGeminiModel();
  if (!model) throw new Error("A Gemini model is not currently available for this environment.");
  const response = await invokeLLM({
    model,
    messages: [{ role: "system", content: "Return only a valid routing JSON object. Follow the supplied schema precisely." }, { role: "user", content: prompt }],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "mesroute_decision",
        strict: true,
        schema: {
          type: "object",
          properties: {
            action: { type: "string", enum: [...ACTIONS] },
            message_type: { type: "string", enum: [...MESSAGE_TYPES] },
            reason: { type: "string" },
            confidence: { type: "number" },
            evidence_message_ids: { type: "string" },
          },
          required: ["action", "message_type", "reason", "confidence", "evidence_message_ids"],
          additionalProperties: false,
        },
      },
    },
  });
  const content = response.choices?.[0]?.message?.content;
  const parsed = JSON.parse(typeof content === "string" ? content : "{}");
  const action = ACTIONS.includes(parsed.action) ? parsed.action as Action : "notify";
  const messageType = MESSAGE_TYPES.includes(parsed.message_type) ? parsed.message_type as MessageType : "unknown";
  return safetyNet({
    messageId: row.messageId,
    action,
    messageType,
    confidence: Number.isFinite(Number(parsed.confidence)) ? Number(parsed.confidence) : 0.5,
    reason: String(parsed.reason || "Gemini routing decision"),
    evidenceMessageIds: String(parsed.evidence_message_ids || evidence.map((item) => item.messageId).join(";") || "none"),
    evidence,
    mode: "live",
  });
}

export async function routeMessage(input: IncomingMessage, mode: RouterMode = "demo") {
  if (mode === "demo") return demoPredict(input);
  try {
    return await livePredict(input);
  } catch (error) {
    const fallback = demoPredict(input);
    return { ...fallback, reason: `Live Gemini unavailable (${error instanceof Error ? error.message.slice(0, 120) : "unknown error"}); Demo Mode fallback used — ${fallback.reason}` };
  }
}

type PerClassMetric = { label: string; precision: number; recall: number; f1: number; support: number };
function metrics(actual: string[], predicted: string[]) {
  const labels = Array.from(new Set([...actual, ...predicted])).sort();
  const perClass: PerClassMetric[] = labels.map((label) => {
    const tp = actual.filter((value, i) => value === label && predicted[i] === label).length;
    const fp = actual.filter((value, i) => value !== label && predicted[i] === label).length;
    const fn = actual.filter((value, i) => value === label && predicted[i] !== label).length;
    const precision = tp + fp ? tp / (tp + fp) : 0;
    const recall = tp + fn ? tp / (tp + fn) : 0;
    return { label, precision, recall, f1: precision + recall ? (2 * precision * recall) / (precision + recall) : 0, support: actual.filter((value) => value === label).length };
  });
  return { accuracy: actual.length ? actual.filter((value, i) => value === predicted[i]).length / actual.length : 0, perClass };
}

export type EvaluationResult = {
  actionAccuracy: number;
  typeAccuracy: number;
  actionMetrics: PerClassMetric[];
  typeMetrics: PerClassMetric[];
  rows: Array<RoutingResult & { trueAction: Action; trueMessageType: MessageType; actionMatch: boolean; typeMatch: boolean }>;
  csv: string;
};

function csvEscape(value: string | number | boolean) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function evaluateModel(mode: RouterMode = "demo"): Promise<EvaluationResult> {
  const rows = await Promise.all(dataset.labels.map(async (label) => {
    const source = dataset.messages.find((item) => item.messageId === label.messageId);
    if (!source) throw new Error(`Missing embedded message ${label.messageId}`);
    const prediction = await routeMessage(source, mode);
    return { ...prediction, trueAction: label.action, trueMessageType: label.messageType, actionMatch: prediction.action === label.action, typeMatch: prediction.messageType === label.messageType };
  }));
  const actionMetric = metrics(rows.map((row) => row.trueAction), rows.map((row) => row.action));
  const typeMetric = metrics(rows.map((row) => row.trueMessageType), rows.map((row) => row.messageType));
  const headers = ["message_id", "true_action", "predicted_action", "true_message_type", "predicted_message_type", "confidence", "reason", "evidence_message_ids", "action_match", "type_match"];
  const csv = [headers.join(","), ...rows.map((row) => [row.messageId, row.trueAction, row.action, row.trueMessageType, row.messageType, row.confidence, row.reason, row.evidenceMessageIds, row.actionMatch, row.typeMatch].map(csvEscape).join(","))].join("\n");
  return { actionAccuracy: actionMetric.accuracy, typeAccuracy: typeMetric.accuracy, actionMetrics: actionMetric.perClass, typeMetrics: typeMetric.perClass, rows, csv };
}
