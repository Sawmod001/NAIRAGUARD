# NairaGuard — AI / LLM Architecture

## Role of AI
AI is an MVP feature, but it is not the source of financial truth.

The AI should:
- explain findings in plain language
- answer follow-up questions
- summarize evidence
- explain why an opportunity may matter
- discuss assumptions and uncertainty
- help users investigate a recommendation
- suggest questions or next investigative steps

## The AI must NOT
- invent AWS metrics
- invent savings
- invent FX rates
- perform authoritative arithmetic
- claim an action was executed when it was not
- silently modify infrastructure
- present unsupported claims as AWS recommendations

## Architecture
Use a provider abstraction:
Application
→ AI service
→ structured context builder
→ selected LLM provider
→ structured response validation
→ UI

The provider should be replaceable without rewriting business logic.

## Context
The LLM should receive structured, relevant evidence such as:
- cost totals
- service breakdown
- recommendation data
- utilization evidence
- source and freshness
- FX rate
- scenario/account context
- explicit constraints

Do not dump the entire database into prompts.

## Grounding
Prefer a tool/function architecture for retrieving facts. The model asks for permitted structured data; server-side tools retrieve it; the model explains the returned facts.

## Output safety
Validate structured outputs with Zod.
Where possible require fields such as:
- answer
- evidence references
- assumptions
- confidence/uncertainty wording
- suggested next step

The UI should make clear when content is AI-generated.

## Provider selection
The coding agent must research current pricing, quotas, model availability, SDK support, structured-output support, privacy/data handling and reliability before finalizing the production provider.

Do not select a provider merely because it is popular.
Do not hard-wire the app to one vendor if an adapter can reasonably avoid lock-in.

## AI failure
If the AI provider is unavailable:
- dashboard still works
- calculations still work
- recommendation data still works
- user sees a useful non-AI explanation where possible

## Conversation
AI follow-up questions should remain scoped to the user's authorized account/workspace and available evidence.

## NairaGuard — Research Backlog

The coding agent should research current authoritative sources before implementing provider-specific assumptions.

## AWS
Research:
- current Cost Explorer API pricing/limitations
- Cost Optimization Hub availability and requirements
- Compute Optimizer requirements
- STS AssumeRole security patterns
- IAM least privilege
- Organizations/management-account implications
- billing data availability and latency
- API throttling
- supported regions/services
- customer permission requirements

Prefer AWS official documentation.

## FinOps
Research current FinOps Foundation material on:
- waste reduction
- workload optimization
- allocation
- forecasting
- governance
- AI/ML spend
- unit economics

Use this research to validate the roadmap, not to inflate MVP.

## AI providers
Compare current:
- model quality
- structured outputs
- tool calling
- context window
- latency
- pricing/free tiers
- quotas
- privacy/data retention
- SDK maturity

## FX providers
Compare:
- reliability
- update frequency
- free-tier limits
- historical rates
- attribution/terms
- failure behavior

## Frontend
Research only where it improves implementation:
- GSAP current APIs
- SplitText
- ScrollTrigger
- FLIP
- View Transitions
- CSS scroll-driven animations
- container queries
- accessibility implications

Do not turn research into unnecessary dependencies.
