# Environment Strategy

## Modes

### Local development

```text
APP_MODE=demo
AI_MODE=mock
FX_MODE=demo
```

### Demo + real AI

```text
APP_MODE=demo
AI_MODE=live
FX_MODE=demo
```

### Demo + live FX

```text
APP_MODE=demo
AI_MODE=live
FX_MODE=live
```

### Future staging

```text
APP_MODE=aws
AI_MODE=live
FX_MODE=live
```

## Environment categories

Authentication (Auth.js, server-only):
- AUTH_SECRET
- AUTH_URL
- DATABASE_URL (for session persistence)
- RESEND_API_KEY (when email verification enabled)
- EMAIL_FROM (verified domain, when verification enabled)

Database:
- DATABASE_URL

AI:
- AI provider key

FX:
- FX provider key if required

AWS future:
- never put permanent user AWS credentials in browser
- role/connection configuration belongs server-side

## .env.example

The coding agent should create a safe example file containing variable names only.

Never commit real secrets.
