# Social Enterprise Evaluator

A platform that evaluates social enterprises against the eight criteria of Alan's List of Success, with separate commercial and social results, evidence confidence, actionable recommendations, versioned reassessment, and PDF / Excel exports. Arabic (RTL) by default, with English.

| Folder / file | Contents |
|---|---|
| `platform/` | The Next.js application — setup instructions in `platform/README.md` |
| `PRODUCT_DEFINITION.md` | Product definition |
| `EVALUATION_FRAMEWORK.md` | Approved evaluation framework and question bank |
| `SCORING_SPECIFICATION.md` | Approved scoring methodology (M1.0) |
| `PROJECT_DECISIONS.md` | Owner decisions log |
| `ARCHITECTURE.md`, `TECHNICAL_DECISIONS.md` | Technical architecture and decisions |
| `IMPLEMENTATION_PROGRESS.md` | What is done and what remains |

## Run locally
```
cd platform
npm install
npx playwright install chromium
npm run seed
npm run dev
```

## Deploying to Vercel
Set **Root Directory** to `platform`. See "Vercel" in `platform/README.md` for current limits (database and PDF storage).
