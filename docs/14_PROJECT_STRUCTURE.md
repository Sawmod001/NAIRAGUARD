# Proposed Project Structure

```text
nairaguard/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx
│   │   │   ├── privacy/
│   │   │   └── terms/
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── (app)/
│   │   │   ├── dashboard/
│   │   │   ├── costs/
│   │   │   ├── optimizations/
│   │   │   │   └── [id]/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── marketing/
│   │   ├── dashboard/
│   │   ├── costs/
│   │   └── optimizations/
│   │
│   ├── domain/
│   │   ├── costs/
│   │   ├── optimizations/
│   │   ├── fx/
│   │   └── finops/
│   │
│   ├── application/
│   │   ├── costs/
│   │   ├── optimizations/
│   │   ├── demo/
│   │   └── ai/
│   │
│   ├── infrastructure/
│   │   ├── providers/
│   │   │   ├── aws/
│   │   │   ├── demo/
│   │   │   ├── fx/
│   │   │   └── ai/
│   │   ├── db/
│   │   └── auth/
│   │
│   ├── lib/
│   │   ├── prisma/
│   │   ├── auth/
│   │   ├── validation/
│   │   ├── errors/
│   │   └── logging/
│   │
│   └── schemas/
│
├── prisma/
│   ├── schema.prisma
│   └── seed/
│
├── data/
│   ├── scenarios/
│   └── fx/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── contracts/
│
├── docs/
├── public/
├── AGENTS.md
├── .env.example
├── README.md
└── package.json
```

## Important

This is a conceptual structure, not a command to create every directory immediately.

The coding agent should create only what the current Scrum ticket requires.
