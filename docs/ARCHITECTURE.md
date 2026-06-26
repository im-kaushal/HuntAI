# HuntAI Architecture

HuntAI is organized around modular domains that can evolve independently.

## Domains

- **Discovery providers** collect jobs from supported sources and normalize them into the shared `JobPosting` shape.
- **Candidate intelligence** converts resumes into a structured `CandidateProfile` containing skills, experience, education, projects, leadership, and constraints.
- **Matching** compares candidate profiles with normalized jobs and returns an explainable `MatchResult`.
- **Company intelligence** enriches jobs with company-level context such as funding, tech stack, hiring trends, and interview difficulty.
- **Referral discovery** identifies public or user-authorized contacts and records why each person may be relevant.
- **Application workspace** manages job pipeline state, generated artifacts, and final review checkpoints.
- **Preparation** creates targeted interview plans from the job, company, and candidate weak areas.
- **Analytics** aggregates job-search funnel performance and source effectiveness.

## Extensibility

Providers, AI model adapters, enrichment sources, and workflow automations should plug into domain interfaces rather than modifying core platform logic.

## Safety and policy

HuntAI should prefer official APIs and supported integrations. Automated application flows must present a review step and require user confirmation before submission.
