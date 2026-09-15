# START HERE — NairaGuard AI Coding Agent Bootstrap

> **Paste this into your AI coding tool before any coding instruction.**

---

A MUST PLS Read AGENTS.md, README.md, every files under docs/, and the data/ directory.

DO NOT CODE YET.

First explain:
1. Your understanding of NairaGuard.
2. The architecture and layer boundaries.
3. How Demo Mode is intended to work.
4. How Demo providers will later be replaced by AWS providers.
5. The role of the FinOps engine.
6. The role and limitations of AI.
7. The role of the FX provider.
8. The authentication and authorization approach.
9. The implementation sequence.
10. The testing strategy.

Also identify any contradictions or architectural risks you find.

Do not modify files yet.
Do not install dependencies yet.
Do not implement anything yet.

After your explanation, WAIT for the first Scrum ticket.

---

## What happens next

After the agent confirms understanding, give it:

```
Execute Scrum ticket NG-001.

Read tickets/NG-001.md before doing anything.

Implement ONLY NG-001.

Do not proceed to NG-002 or any other ticket.

Follow AGENTS.md and the documentation exactly.

After implementation:
- perform only the sensible foundation validation required by NG-001
- do not run unnecessary large test suites
- review the changes
- report the files changed
- report validation actually performed
- report any limitation THEN COMMIT
```

## Project root

```
NairaGuard/
├── AGENTS.md
├── README.md
├── START_HERE.md
├── docs/           # 21 spec files
├── data/
│   ├── scenarios/  # 5 demo scenarios + index.json
│   └── fx/         # demo-rates.json
└── tickets/
    └── NG-001.md
```

## Notes for human operator

- Work ticket-by-ticket. Do not build future features without a ticket.
- Demo Mode is current priority. Live AWS Mode is future.
- Financial truth comes from provider/deterministic calculations, not AI.
- Never put secrets in source control.
- Remote: https://github.com/Sawmod001/NAIRAGUARD
