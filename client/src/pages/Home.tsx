import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  BellRing,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileSearch,
  History,
  Inbox,
  Layers3,
  Loader2,
  Network,
  Play,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Table2,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

type Tab = "route" | "batch" | "context" | "evaluate";
type Mode = "demo" | "live";
type Action = "notify" | "digest" | "mute";
type ConversationType = "personal" | "group" | "business";

type RoutingResult = {
  messageId: string;
  action: Action;
  messageType: string;
  confidence: number;
  reason: string;
  evidenceMessageIds: string;
  evidence: Array<{ messageId: string; text: string; score: number }>;
  mode: "demo" | "live";
  safetyOverride: boolean;
};

type RouteForm = { messageText: string; userId: string; conversationType: ConversationType };

const examples: Array<{ label: "urgent group alert" | "personal meeting" | "Amazon delivery" | "scam gift card"; form: RouteForm }> = [
  { label: "urgent group alert", form: { messageText: "URGENT: production server is down, need immediate rollback.", userId: "u_1", conversationType: "group" } },
  { label: "personal meeting", form: { messageText: "Can we meet at 5 PM to discuss the trip plan?", userId: "u_1", conversationType: "personal" } },
  { label: "Amazon delivery", form: { messageText: "Your Amazon package has been delivered at your doorstep.", userId: "u_1", conversationType: "business" } },
  { label: "scam gift card", form: { messageText: "Congratulations! You won a Rs 10,000 gift card. Click here to claim!", userId: "u_2", conversationType: "business" } },
];

const tabs: Array<{ id: Tab; label: string; icon: typeof Inbox }> = [
  { id: "route", label: "Route Message", icon: Inbox },
  { id: "batch", label: "Batch Routing", icon: Layers3 },
  { id: "context", label: "Pipeline Context", icon: BrainCircuit },
  { id: "evaluate", label: "Evaluate Model", icon: Table2 },
];

const actionCopy: Record<Action, { detail: string }> = {
  notify: { detail: "Immediate notification recommended" },
  digest: { detail: "Hold for the scheduled digest" },
  mute: { detail: "Suppress interruptive delivery" },
};

function percentage(value: number) { return `${Math.round(value * 100)}%`; }

function inferConversationType(message: string): ConversationType {
  const lower = message.toLowerCase();
  if (/amazon|package|delivery|order|upi|payment|balance|invoice|loan|gift card|claim/.test(lower)) return "business";
  if (/urgent|server|sale|discount|score|wicket|alumni|meetup|rsvp|birthday party/.test(lower)) return "group";
  return "personal";
}

function ActionBadge({ action }: { action: Action }) {
  const label = action === "notify" ? "Notify" : action === "digest" ? "Digest" : "Mute";
  return <span className={`action-badge ${action}`}><BellRing size={13} />{label}</span>;
}

function LoadingButton({ loading, children, className = "gold-button", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return <button className={className} disabled={loading || props.disabled} {...props}>{loading ? <Loader2 size={15} className="animate-spin" /> : null}{children}</button>;
}

function RouteResultCard({ result }: { result: RoutingResult }) {
  return (
    <div className="glass result-card">
      <div className={`result-top ${result.action}`}>
        <div>
          <div className="eyebrow">Routing decision</div>
          <div style={{ display: "flex", alignItems: "center", gap: ".55rem", marginTop: ".5rem", flexWrap: "wrap" }}>
            <ActionBadge action={result.action} />
            <span className="confidence">{percentage(result.confidence)} confidence</span>
          </div>
          <p style={{ margin: ".7rem 0 0", color: "#4e6f89", fontSize: ".78rem", lineHeight: 1.65 }}>{actionCopy[result.action].detail}</p>
        </div>
        <ShieldCheck size={25} color={result.action === "notify" ? "#147647" : result.action === "digest" ? "#a47305" : "#b6404b"} />
      </div>
      <div className="metric-line"><span>Message type</span><strong style={{ textTransform: "capitalize" }}>{result.messageType.replaceAll("_", " ")}</strong></div>
      <div className="metric-line"><span>Model path</span><strong>{result.mode === "demo" ? "Demo Mode · heuristic" : "Live Gemini"}</strong></div>
      <div className="metric-line"><span>Evidence IDs</span><strong className="mono">{result.evidenceMessageIds}</strong></div>
      <div className="metric-line" style={{ display: "block" }}><span>Reasoning</span><p style={{ margin: ".45rem 0 0", color: "#41627d", lineHeight: 1.6 }}>{result.reason}</p></div>
      {result.evidence.length > 0 && <div className="metric-line" style={{ display: "block" }}><span>TF-IDF RAG evidence</span><div className="evidence-list" style={{ marginTop: ".55rem" }}>{result.evidence.map((item) => <div className="evidence" key={item.messageId}><b>{item.messageId}</b> · {item.text} <span style={{ opacity: .7 }}>({item.score.toFixed(2)})</span></div>)}</div></div>}
      {result.safetyOverride && <div className="error-note"><ShieldCheck size={15} />Low confidence safely overrode the decision to <b>notify</b>.</div>}
    </div>
  );
}

function RoutingForm({ form, onChange, onSubmit, loading, submitLabel = "Route message" }: { form: RouteForm; onChange: (form: RouteForm) => void; onSubmit: () => void; loading: boolean; submitLabel?: string }) {
  return <div className="form-stack">
    <div className="input-grid">
      <div className="input-full"><label className="label" htmlFor="message-text">Message text</label><textarea id="message-text" className="area" value={form.messageText} onChange={(event) => onChange({ ...form, messageText: event.target.value })} placeholder="Write or paste an incoming message…" /></div>
      <div><label className="label" htmlFor="user-id">Recipient user ID</label><input id="user-id" className="field" value={form.userId} onChange={(event) => onChange({ ...form, userId: event.target.value })} placeholder="e.g. u_1" /></div>
      <div><label className="label" htmlFor="conversation-type">Conversation type</label><select id="conversation-type" className="field" value={form.conversationType} onChange={(event) => onChange({ ...form, conversationType: event.target.value as ConversationType })}><option value="personal">Personal</option><option value="group">Group</option><option value="business">Business</option></select></div>
    </div>
    <LoadingButton loading={loading} onClick={onSubmit}><Zap size={15} />{submitLabel}</LoadingButton>
  </div>;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("route");
  const [mode, setMode] = useState<Mode>("demo");
  const [routeForm, setRouteForm] = useState<RouteForm>(examples[0].form);
  const [routeResult, setRouteResult] = useState<RoutingResult | null>(null);
  const [batchText, setBatchText] = useState("URGENT: production server is down, need immediate rollback.\nMEGA SALE TODAY! Flash sale on all smartphones, huge discount offer. Buy now!\nRs 2500 received via UPI from Rohan. New balance: Rs 12400.\nCongratulations! You won a Rs 10,000 gift card. Click here to claim!");
  const [batchUser, setBatchUser] = useState("u_1");
  const [batchResults, setBatchResults] = useState<RoutingResult[]>([]);
  const [sort, setSort] = useState<{ key: "messageId" | "action" | "messageType" | "confidence"; desc: boolean }>({ key: "messageId", desc: false });
  const [inspectionRequest, setInspectionRequest] = useState<RouteForm | null>(null);
  const [evaluation, setEvaluation] = useState<Awaited<ReturnType<typeof import("../../../server/mesroute").evaluateModel>> | null>(null);

  const routeMutation = trpc.mesroute.route.useMutation({ onSuccess: (data) => setRouteResult(data) });
  const batchMutation = trpc.mesroute.routeBatch.useMutation({ onSuccess: (data) => setBatchResults(data) });
  const evaluationMutation = trpc.mesroute.evaluate.useMutation({ onSuccess: (data) => setEvaluation(data) });
  const inspectionQuery = trpc.mesroute.inspectContext.useQuery(inspectionRequest ?? { messageText: routeForm.messageText || "Placeholder", userId: routeForm.userId || "u_1", conversationType: routeForm.conversationType }, { enabled: Boolean(inspectionRequest) });

  const batchRows = useMemo(() => [...batchResults].sort((left, right) => {
    const leftValue = left[sort.key]; const rightValue = right[sort.key];
    const order = typeof leftValue === "number" && typeof rightValue === "number" ? leftValue - rightValue : String(leftValue).localeCompare(String(rightValue));
    return sort.desc ? -order : order;
  }), [batchResults, sort]);
  const summary = useMemo(() => ({ notify: batchResults.filter((row) => row.action === "notify").length, digest: batchResults.filter((row) => row.action === "digest").length, mute: batchResults.filter((row) => row.action === "mute").length }), [batchResults]);

  const runRoute = () => routeMutation.mutate({ input: { ...routeForm }, mode });
  const runBatch = () => {
    const messages = batchText.split("\n").map((text) => text.trim()).filter(Boolean).map((messageText, index) => ({ messageId: `batch_${String(index + 1).padStart(2, "0")}`, messageText, userId: batchUser || "u_1", conversationType: inferConversationType(messageText) }));
    if (messages.length) batchMutation.mutate({ messages, mode });
  };
  const runEvaluation = () => evaluationMutation.mutate({ mode });
  const downloadCsv = () => {
    if (!evaluation) return;
    const blob = new Blob([evaluation.csv], { type: "text/csv;charset=utf-8" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob); anchor.download = "mesroute-evaluation.csv"; anchor.click(); URL.revokeObjectURL(anchor.href);
  };
  const toggleSort = (key: typeof sort.key) => setSort((current) => ({ key, desc: current.key === key ? !current.desc : false }));

  return <div className="route-shell">
    <header className="route-header"><div className="header-inner">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}><div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}><span className="brand-mark"><Network size={20} /></span><div><strong style={{ fontSize: "1rem", letterSpacing: "-.04em" }}>MesRoute</strong><div className="eyebrow" style={{ marginTop: ".05rem" }}>Message intelligence</div></div></div><span className="status-pill"><span className="status-dot" />Embedded dataset ready</span></div>
      <h1 className="hero-title">Every message gets the <em>right interruption.</em></h1>
      <p className="hero-copy">A safety-first routing workspace that combines recipient context, TF-IDF evidence retrieval, a faithful heuristic engine, and optional live Gemini decisions.</p>
    </div></header>

    <main className="main-wrap">
      <section className="glass control-bar" aria-label="MesRoute workspace navigation">
        <nav className="tabs-row" aria-label="Routing tools">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={`tab-button ${activeTab === id ? "active" : ""}`} onClick={() => setActiveTab(id)}><Icon size={14} style={{ display: "inline-block", verticalAlign: "-2px", marginRight: ".35rem" }} />{label}</button>)}</nav>
        <div className="mode-toggle" aria-label="Routing mode"><button className={`mode-option ${mode === "demo" ? "active" : ""}`} onClick={() => setMode("demo")}>Demo Mode</button><button className={`mode-option ${mode === "live" ? "active" : ""}`} onClick={() => setMode("live")}>Live Gemini</button></div>
      </section>

      {activeTab === "route" && <section className="tab-panel layout-two">
        <div className="glass surface"><div className="eyebrow">Single decision</div><h2 className="section-title">Route one message with context</h2><p className="section-subtitle">Demo Mode is ready immediately. Live Gemini uses the same safety guard and falls back to Demo Mode if unavailable.</p>
          <div style={{ margin: "1rem 0" }}><div className="label">Quick examples</div><div className="example-grid">{examples.map((example) => <button className="example-btn" key={example.label} onClick={() => { setRouteForm(example.form); setRouteResult(null); }}>{example.label}</button>)}</div></div>
          <RoutingForm form={routeForm} onChange={setRouteForm} onSubmit={runRoute} loading={routeMutation.isPending} />
          {routeMutation.error && <div className="error-note"><AlertTriangle size={15} />{routeMutation.error.message}</div>}
        </div>
        <div>{routeResult ? <RouteResultCard result={routeResult} /> : <div className="glass surface empty-result"><div><div className="empty-orb" style={{ margin: "0 auto .8rem" }}><Sparkles size={23} /></div><h2 className="section-title">Decision ready when you are</h2><p className="section-subtitle" style={{ maxWidth: "18rem" }}>Use a quick example or add a message to see action, confidence, full reasoning, and retrieved evidence.</p></div></div>}</div>
      </section>}

      {activeTab === "batch" && <section className="tab-panel glass surface"><div className="batch-header"><div><div className="eyebrow">Bulk triage</div><h2 className="section-title">Batch routing</h2><p className="section-subtitle">Paste one incoming message per line. Conversation context is inferred from each message so the embedded model can route them together.</p></div><LoadingButton loading={batchMutation.isPending} onClick={runBatch}><Play size={15} />Route all messages</LoadingButton></div>
        <div className="input-grid" style={{ marginTop: "1rem" }}><div className="input-full"><label className="label" htmlFor="batch-text">Messages — one per line</label><textarea id="batch-text" className="area" style={{ minHeight: "10rem" }} value={batchText} onChange={(event) => setBatchText(event.target.value)} /></div><div><label className="label" htmlFor="batch-user">Recipient user ID</label><input id="batch-user" className="field" value={batchUser} onChange={(event) => setBatchUser(event.target.value)} /></div><div><div className="label">Classification notes</div><div style={{ color: "#66849c", fontSize: ".74rem", lineHeight: 1.7, paddingTop: ".45rem" }}>Server, sales, sports, delivery, payment, and scam intent establish a relevant personal, group, or business context before the route is calculated.</div></div></div>
        {batchMutation.error && <div className="error-note"><AlertTriangle size={15} />{batchMutation.error.message}</div>}
        {batchResults.length > 0 && <><div className="stats-grid"><div className="stat-box"><div className="stat-label">Total</div><div className="stat-number">{batchResults.length}</div></div><div className="stat-box"><div className="stat-label">Notify</div><div className="stat-number" style={{ color: "#197648" }}>{summary.notify}</div></div><div className="stat-box"><div className="stat-label">Digest</div><div className="stat-number" style={{ color: "#a36b00" }}>{summary.digest}</div></div><div className="stat-box"><div className="stat-label">Mute</div><div className="stat-number" style={{ color: "#bd4450" }}>{summary.mute}</div></div></div>
          <div className="table-wrap"><table className="result-table"><thead><tr>{([ ["messageId", "Message ID"], ["action", "Action"], ["messageType", "Type"], ["confidence", "Confidence"] ] as const).map(([key, label]) => <th key={key}><button onClick={() => toggleSort(key)}>{label}<ChevronDown size={11} /></button></th>)}<th>Reason</th><th>Evidence IDs</th></tr></thead><tbody>{batchRows.map((row) => <tr key={row.messageId}><td className="mono">{row.messageId}</td><td><span className={`tiny-action ${row.action}`}>{row.action}</span></td><td style={{ textTransform: "capitalize" }}>{row.messageType}</td><td>{percentage(row.confidence)}</td><td className="reason-cell">{row.reason}</td><td className="mono">{row.evidenceMessageIds}</td></tr>)}</tbody></table></div></>}
      </section>}

      {activeTab === "context" && <section className="tab-panel layout-two"><div className="glass surface"><div className="eyebrow">Transparency layer</div><h2 className="section-title">Pipeline Context Inspector</h2><p className="section-subtitle">Review exactly what is assembled before a heuristic or LLM makes any routing decision.</p><div style={{ marginTop: "1rem" }}><RoutingForm form={routeForm} onChange={setRouteForm} onSubmit={() => setInspectionRequest({ ...routeForm })} loading={inspectionQuery.isFetching} submitLabel="Inspect context" /></div></div>
        <div className="glass surface">{inspectionQuery.data ? <><div className="context-kicker"><FileSearch size={14} />Assembled prompt context</div><pre className="context-block">{inspectionQuery.data.prompt}</pre><div style={{ marginTop: ".7rem", display: "flex", justifyContent: "flex-end" }}><button className="soft-button" onClick={() => navigator.clipboard.writeText(inspectionQuery.data?.prompt ?? "")}><Copy size={13} />Copy context</button></div></> : <div className="empty-result"><div><div className="empty-orb" style={{ margin: "0 auto .8rem" }}><SearchCheck size={23} /></div><h2 className="section-title">Inspect the decision inputs</h2><p className="section-subtitle" style={{ maxWidth: "18rem" }}>The resulting context will include the recipient profile, quiet hours, group or business metadata, relationship history, and top TF-IDF evidence.</p></div></div>}</div>
      </section>}

      {activeTab === "evaluate" && <section className="tab-panel glass surface"><div className="evaluation-head"><div><div className="eyebrow">Ground-truth benchmark</div><h2 className="section-title">Model evaluation</h2><p className="section-subtitle">Run the complete pipeline against all 12 embedded labelled messages. Results are generated server-side and exportable as a CSV.</p></div><div style={{ display: "flex", gap: ".55rem", flexWrap: "wrap" }}><LoadingButton loading={evaluationMutation.isPending} onClick={runEvaluation}><Play size={15} />Run full evaluation</LoadingButton>{evaluation && <button className="soft-button" onClick={downloadCsv}><Download size={14} />Export CSV</button>}</div></div>
        {evaluationMutation.error && <div className="error-note"><AlertTriangle size={15} />{evaluationMutation.error.message}</div>}
        {evaluation ? <><div className="metric-grid"><div className="score-card"><div className="score-label">Action accuracy</div><div className="score-value">{percentage(evaluation.actionAccuracy)}</div><div style={{ color: "#66849d", fontSize: ".7rem" }}>notify · digest · mute</div></div><div className="score-card warm"><div className="score-label">Message-type accuracy</div><div className="score-value">{percentage(evaluation.typeAccuracy)}</div><div style={{ color: "#66849d", fontSize: ".7rem" }}>semantic category match</div></div></div>
          <div className="layout-two" style={{ gridTemplateColumns: "minmax(0, .9fr) minmax(0, 1.1fr)" }}><div><div className="context-kicker"><CheckCircle2 size={14} />Action precision, recall & F1</div><div className="class-table"><div className="class-row head"><span>Class</span><span>Precision</span><span>Recall</span><span>F1</span><span>N</span></div>{evaluation.actionMetrics.map((item) => <div className="class-row" key={item.label}><b style={{ textTransform: "capitalize" }}>{item.label}</b><span>{percentage(item.precision)}</span><span>{percentage(item.recall)}</span><span>{percentage(item.f1)}</span><span>{item.support}</span></div>)}</div></div><div><div className="context-kicker"><BrainCircuit size={14} />Type precision, recall & F1</div><div className="class-table"><div className="class-row head"><span>Class</span><span>Precision</span><span>Recall</span><span>F1</span><span>N</span></div>{evaluation.typeMetrics.map((item) => <div className="class-row" key={item.label}><b style={{ textTransform: "capitalize" }}>{item.label}</b><span>{percentage(item.precision)}</span><span>{percentage(item.recall)}</span><span>{percentage(item.f1)}</span><span>{item.support}</span></div>)}</div></div></div>
          <div style={{ marginTop: "1.2rem" }}><div className="context-kicker"><History size={14} />Predictions vs. labels</div><div className="table-wrap"><table className="result-table"><thead><tr><th>Message</th><th>True action</th><th>Predicted action</th><th>True type</th><th>Predicted type</th><th>Action</th><th>Type</th></tr></thead><tbody>{evaluation.rows.map((row) => <tr key={row.messageId}><td className="mono">{row.messageId}</td><td><span className={`tiny-action ${row.trueAction}`}>{row.trueAction}</span></td><td><span className={`tiny-action ${row.action}`}>{row.action}</span></td><td style={{ textTransform: "capitalize" }}>{row.trueMessageType}</td><td style={{ textTransform: "capitalize" }}>{row.messageType}</td><td className={row.actionMatch ? "match-yes" : "match-no"}>{row.actionMatch ? "Match" : "Differs"}</td><td className={row.typeMatch ? "match-yes" : "match-no"}>{row.typeMatch ? "Match" : "Differs"}</td></tr>)}</tbody></table></div></div>
        </> : <div className="empty-result" style={{ minHeight: "19rem" }}><div><div className="empty-orb" style={{ margin: "0 auto .8rem" }}><Table2 size={23} /></div><h2 className="section-title">A reproducible benchmark is ready</h2><p className="section-subtitle" style={{ maxWidth: "25rem" }}>Run evaluation to compare the current mode with embedded ground truth, inspect per-class metrics, and download the results as CSV.</p></div></div>}
      </section>}
      <p className="footer-note"><ShieldCheck size={12} style={{ display: "inline", verticalAlign: "-2px", marginRight: ".25rem" }} />Safety guarantee: whenever a decision has confidence below 0.60, MesRoute forces the action to <b>notify</b>; it never silently mutes uncertain messages.</p>
    </main>
  </div>;
}
