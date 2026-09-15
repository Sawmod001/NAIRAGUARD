# AI Specification

## AI's job

The AI is a FinOps consultant/explainer, not the accounting engine.

## Input

The AI receives structured evidence:

- recommendation source
- resource type
- current configuration
- recommended configuration
- estimated monthly cost
- estimated monthly savings
- effort
- restart requirement
- rollback possibility
- region
- utilization evidence where available
- NairaGuard-calculated USD/NGN impact

## Output

Structured object:

- summary
- whyItMatters
- recommendedNextStep
- businessImpact
- technicalImpact
- risks
- priority
- confidence
- assumptions

## Hard rules

AI MUST NOT:
- invent AWS resources
- invent savings
- alter provider savings
- claim an action was executed
- claim a resource is safe when evidence does not establish that
- expose secrets
- provide destructive automation in MVP

AI SHOULD:
- explain technical findings in accessible language
- explain why the opportunity matters
- identify what the engineer should verify
- mention risk/effort
- use the supplied financial values exactly

## Structured output

Use Vercel AI SDK structured generation with a Zod schema. Current AI SDK documentation recommends structured output through `generateText` with `Output.object()` in modern implementations. Keep the AI provider behind an internal interface so the model can be changed later. 

## Failure behavior

If AI fails:
- recommendation remains usable
- deterministic savings remain visible
- show a non-blocking “AI explanation unavailable” state
- allow retry
