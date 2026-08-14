# MesRoute

**MesRoute** is a safety-first message-routing web application. It classifies incoming messages and routes them to **notify**, **digest**, or **mute**, while exposing the contextual evidence and reasoning behind each decision.

The project is self-contained: its synthetic users, groups, business accounts, relationships, historical messages, and labelled evaluation samples are embedded in the server. The app is usable immediately in Demo Mode without uploads, account setup, or an API key.

## What it does

| Capability | Implementation |
| --- | --- |
| Single-message routing | Uses recipient and conversation context to return an action, message type, confidence, explanation, and historical evidence IDs. |
| Batch routing | Accepts one message per line, infers conversation context, summarizes routes, and presents sortable results. |
| Context inspection | Shows the precise context prompt assembled before a route is decided. |
| Evaluation | Runs a 12-message embedded ground-truth benchmark and shows accuracy plus per-class precision, recall, and F1. |
| CSV export | Downloads the complete predictions-versus-labels evaluation result as `mesroute-evaluation.csv`. |
| Safety guard | Forces decisions below `0.60` confidence to **notify** so uncertain messages are never silently muted. |

## Routing modes

**Demo Mode** is the default and mirrors the repository’s Python heuristic logic in TypeScript. It uses context aggregation, message-type lexicons, relationship data, forwarding signals, business verification, and TF-IDF-style historical retrieval. It is deterministic and works without external configuration.

**Live Gemini** is optional. When available, the server uses a structured LLM response and then applies the same safety guard. If the live model is unavailable, MesRoute falls back to the deterministic Demo Mode, preserving a working experience without API-key setup.

## Embedded evaluation snapshot

The deterministic Demo Mode achieves **100% action accuracy** and **75% message-type accuracy** on the included 12-message synthetic benchmark. Action metrics are calculated for the `notify`, `digest`, and `mute` classes; type metrics are calculated for the included semantic message types.

## Local development

```bash
pnpm install
pnpm dev
```

Then open the development URL shown in the terminal. The project uses React, TypeScript, Tailwind CSS, Express, and tRPC.

## Quality checks

```bash
pnpm check
pnpm test
```

The automated test suite validates retrieval, prompt/context construction, canonical Demo Mode routes, the low-confidence safety override, and evaluation CSV output.

## Repository layout

```text
client/src/pages/Home.tsx  # Four-tab user interface
client/src/index.css       # Sora-based visual system and responsive styling
server/mesroute.ts         # Embedded dataset, TF-IDF retrieval, routing and evaluation engine
server/routers.ts          # Public tRPC contracts for routing, context, and evaluation
server/mesroute.test.ts    # Routing-engine unit tests
todo.md                    # Implementation checklist and completed work history
```

## Publishing

After creating a checkpoint in the project workspace, use the **Publish** button in the project interface to make the app publicly available on its permanent hosted URL. You can configure a custom domain from the project settings after publishing.

## License

This project is released under the [MIT License](LICENSE).
