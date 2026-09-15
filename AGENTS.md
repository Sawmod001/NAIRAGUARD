# NairaGuard Agent Entry Point

Before making changes, read:

1. `README.md`
2. `docs/01_PRODUCT_SPEC.md`
3. `docs/03_ARCHITECTURE.md`
4. `docs/15_SCRUM_BACKLOG.md`
5. `docs/20_AI_CODING_AGENT_RULES.md`

Then read the specific documentation relevant to the current ticket.

Rules:
- Work ticket-by-ticket.
- Do not build future features without a ticket.
- Demo Mode is current priority.
- Live AWS Mode is future.
- Financial truth comes from provider/deterministic calculations, not AI.
- Never put secrets in source control.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
