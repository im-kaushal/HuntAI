# HuntAI

HuntAI is an AI-powered Job Search Operating System for software engineers. It is designed to discover relevant jobs, normalize them into a common schema, score fit against a structured candidate profile, and help users prepare high-quality applications while keeping final submissions under user control.

## Current scope

This repository currently contains the first core domain scaffold:

- Shared candidate, job, company, referral, outreach, and application pipeline types.
- A deterministic baseline matching engine that produces an explainable match score.
- Product and architecture documentation derived from the initial PRD.

## Development

```bash
npm install
npm run check
```

## Core principle

HuntAI optimizes for high-quality applications, not bulk submissions. The platform should assist with discovery, preparation, and workflow automation while the user remains responsible for final review and submission.
