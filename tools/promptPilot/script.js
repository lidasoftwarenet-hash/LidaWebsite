// ===== DATA =====
// ===== TEMPLATE CONFIGURATIONS =====
const templateConfigs = {
    sprint: {
        fieldOverrides: {
            projectName: { label: "Sprint Name", placeholder: "e.g., Sprint 23 - Q1 2025 Planning" },
            projectType: { placeholder: "e.g., 2-week sprint, Scrum / Shape Up / Kanban" },
            technology: { placeholder: "e.g., React, Node.js, PostgreSQL, Turborepo" },
            teamSize: { placeholder: "e.g., 4 engineers, 1 QA, 1 product manager" },
            context: { placeholder: "Previous sprint velocity, carried-over tickets, team morale, any dependencies or blockers..." },
            currentProblem: { label: "Sprint Goals & Challenges", placeholder: "What are the main objectives? Which epics are in scope? Any unresolved tech debt that must be addressed?" },
            desiredOutcome: { label: "Sprint Success Criteria", placeholder: "What does done look like? Which KPIs or outcomes define success for this sprint?" },
            mustHave: { placeholder: "User stories or tasks that absolutely must ship (P0 items)" },
            niceToHave: { placeholder: "Stretch goals — only if velocity allows" }
        }
    },
    architecture: {
        fieldOverrides: {
            projectName: { placeholder: "e.g., E-commerce Platform Redesign" },
            projectType: { placeholder: "e.g., Microservices, Event-driven, Modular monolith" },
            technology: { placeholder: "e.g., Kubernetes, Docker, AWS, GraphQL, Kafka" },
            context: { placeholder: "Current architecture state, biggest pain points, scalability floor, what broke last..." },
            currentProblem: { label: "Architecture Challenges", placeholder: "What specific architectural issues need solving? Coupling, latency, data consistency, blast radius on failure..." },
            desiredOutcome: { label: "Target Architecture", placeholder: "Describe the ideal end state. What qualities and principles matter most — simplicity, scalability, observability?" },
            technicalConstraints: { placeholder: "e.g., Must support 100k RPS, 99.95% SLA, must integrate with legacy SAP system" },
            mustHave: { placeholder: "Non-negotiable architectural requirements (security, compliance, performance SLAs, team autonomy)" }
        }
    },
    security: {
        fieldOverrides: {
            projectName: { placeholder: "e.g., Payment API Security Audit" },
            projectType: { placeholder: "e.g., REST API, OAuth 2.0 / OIDC flow, Supply chain" },
            technology: { placeholder: "e.g., Node.js, Express, JWT, PostgreSQL, AWS Secrets Manager" },
            context: { placeholder: "Current security posture, compliance scope (PCI-DSS Level 1, GDPR, SOC 2), any recent security incidents or pen test findings..." },
            currentProblem: { label: "Security Concerns", placeholder: "What's the threat model? OWASP Top 10 risks, authentication weaknesses, secrets in code, insecure dependencies (SBOM), privilege escalation..." },
            desiredOutcome: { label: "Security Goals", placeholder: "Target security posture: zero-trust, least privilege, defense in depth. Specific compliance certifications needed?" },
            technicalConstraints: { placeholder: "e.g., Must work with existing IAM, zero-downtime remediation required, no vendor lock-in" },
            businessConstraints: { placeholder: "e.g., Limited security headcount, cannot disrupt production APIs, strict data residency requirements" },
            mustHave: { placeholder: "Critical controls: MFA, secrets management, SAST/DAST in CI, dependency scanning, audit logging" }
        }
    },
    testing: {
        fieldOverrides: {
            projectName: { placeholder: "e.g., Frontend Testing Modernization" },
            projectType: { placeholder: "e.g., Web app, Mobile (React Native / Flutter), Microservices" },
            technology: { placeholder: "e.g., Vitest, Playwright, Cypress, k6, Pact (contract testing), GitHub Actions" },
            context: { placeholder: "Current test coverage %, CI pipeline speed, known flaky tests, release cadence, recent production bugs that tests didn't catch..." },
            currentProblem: { label: "Testing Challenges", placeholder: "What's broken in your testing? Slow CI, low confidence in deploys, flaky Cypress tests, no API contract tests, missing observability in prod..." },
            desiredOutcome: { label: "Testing Goals", placeholder: "Testing trophy coverage, CI under X minutes, zero flaky tests, shift-left security testing, feature flag validation..." },
            mustHave: { placeholder: "Critical test layers (component tests, API integration, E2E critical paths, contract tests between services)" },
            successMetrics: { placeholder: "e.g., 85% branch coverage, CI under 8 min, <0.5% flaky rate, DORA deployment frequency target" }
        }
    },
    devops: {
        fieldOverrides: {
            projectName: { placeholder: "e.g., GitOps Migration to ArgoCD" },
            projectType: { placeholder: "e.g., Kubernetes GitOps, Multi-cloud IaC, Serverless CI/CD" },
            technology: { placeholder: "e.g., GitHub Actions, ArgoCD, Terraform, Pulumi, AWS ECS / GKE, OpenTelemetry" },
            context: { placeholder: "Current deployment frequency, lead time for changes, MTTR, change failure rate (DORA metrics), on-call load, current IaC maturity..." },
            currentProblem: { label: "DevOps Challenges", placeholder: "Root cause of the pain: manual deployments, drift between environments, no rollback strategy, alert fatigue, poor observability, no SLOs..." },
            desiredOutcome: { label: "DevOps Goals", placeholder: "Target DORA metrics, GitOps-based deploy workflow, platform engineering principles, self-service for dev teams, SLO-based alerting..." },
            technicalConstraints: { placeholder: "e.g., Must support canary + blue-green, zero-downtime releases, air-gapped environment for compliance" },
            mustHave: { placeholder: "Pipeline non-negotiables: SAST, secret scanning, image signing, smoke tests post-deploy, automated rollback" }
        }
    },
    documentation: {
        fieldOverrides: {
            projectName: { placeholder: "e.g., Internal Developer Portal Docs" },
            projectType: { placeholder: "e.g., Diátaxis-structured docs, ADR library, API reference, Architecture diagrams" },
            technology: { placeholder: "e.g., Markdown + Docusaurus, Confluence, OpenAPI/Swagger, C4 diagrams, Mermaid" },
            context: { placeholder: "Who reads this? Developers onboarding? External API consumers? Support team? Current docs state — outdated, missing, or not trusted?" },
            currentProblem: { label: "Documentation Gaps", placeholder: "What's missing or confusing? Missing getting-started guide, outdated API reference, no architecture decision records (ADRs), docs not maintained in sync with code..." },
            desiredOutcome: { label: "Documentation Goals", placeholder: "Docs-as-code workflow, Diátaxis structure (tutorials, how-tos, reference, explanation), AI-friendly for code copilots, auto-generated from code where possible..." },
            mustHave: { placeholder: "Core sections: getting started, API reference with examples, deployment guide, troubleshooting" },
            stakeholders: { placeholder: "e.g., Onboarding engineers, external API consumers, ops team, security auditors" }
        }
    },
    database: {
        fieldOverrides: {
            projectName: { placeholder: "e.g., Postgres Query Performance Overhaul" },
            projectType: { placeholder: "e.g., PostgreSQL optimization, Multi-tenancy schema, Read replica setup, Vector search" },
            technology: { placeholder: "e.g., PostgreSQL 16, pgvector, Redis, Drizzle ORM, PgBouncer, AWS RDS" },
            context: { placeholder: "Current p95 query latency, table sizes, growth rate, most expensive queries (pg_stat_statements), index hit rates, connection pool exhaustion issues..." },
            currentProblem: { label: "Database Issues", placeholder: "Exact pain: N+1 from the ORM, missing indexes on filter columns, table bloat, lock contention, cross-shard queries, vector search latency..." },
            desiredOutcome: { label: "Optimization Goals", placeholder: "Target p99 latency, read/write throughput, horizontal scaling strategy, zero-downtime migrations, PITR backup strategy..." },
            technicalConstraints: { placeholder: "e.g., Cannot change primary key type, zero-downtime schema migrations required, must stay on managed RDS" },
            successMetrics: { placeholder: "e.g., p99 query <50ms, support 10M rows, 99.99% uptime, max 100 concurrent connections" }
        }
    },
    'user-story': {
        fieldOverrides: {
            projectName: { placeholder: "e.g., Onboarding Redesign Feature" },
            projectType: { placeholder: "e.g., Web app feature, Mobile app flow, API-first feature" },
            context: { placeholder: "User personas, jobs-to-be-done (JTBD), competitive benchmark, usage analytics showing the current gap..." },
            currentProblem: { label: "Feature Requirements", placeholder: "What user problem or business goal does this address? What is the user currently forced to do as a workaround?" },
            desiredOutcome: { label: "User Story Goals", placeholder: "What capability does the user gain? What's the happy path? What metrics improve?" },
            mustHave: { placeholder: "Core acceptance criteria (Given/When/Then format preferred)" },
            niceToHave: { placeholder: "Edge cases, accessibility improvements, i18n, dark mode, keyboard nav" },
            stakeholders: { placeholder: "e.g., Product owner, UX designer, accessibility auditor, backend API team" }
        }
    },
    performance: {
        fieldOverrides: {
            projectName: { placeholder: "e.g., Core Web Vitals Improvement — Landing Page" },
            projectType: { placeholder: "e.g., Next.js App Router, React SPA, Node.js API, Mobile app" },
            technology: { placeholder: "e.g., Next.js 15, React 19, TurboPack, Cloudflare CDN, Vercel Edge" },
            context: { placeholder: "Current Lighthouse scores, Core Web Vitals (LCP/CLS/INP), real user monitoring data (RUM), DevTools waterfall observations, bundle size..." },
            currentProblem: { label: "Performance Issues", placeholder: "Specific bottlenecks: LCP >4s because of unoptimized hero image, INP issues from long tasks, render-blocking JS, layout shift from font-swap, 2MB+ bundle..." },
            desiredOutcome: { label: "Performance Goals", placeholder: "Target: LCP <2.5s, INP <200ms, CLS <0.1, Lighthouse Performance >90, TTFB <800ms, bundle <150KB gzipped" },
            technicalConstraints: { placeholder: "e.g., Cannot remove GTM/analytics scripts, must support Safari 15+, on shared Vercel free plan" },
            successMetrics: { placeholder: "e.g., Lighthouse >90 on mobile, real-user LCP <2.5s (75th percentile), bounce rate reduction by 15%" }
        }
    },
    refactoring: {
        fieldOverrides: {
            projectName: { placeholder: "e.g., Payments Service — Express to Fastify Migration" },
            projectType: { placeholder: "e.g., Monolith decomposition, Framework upgrade, TypeScript migration, Module federation" },
            technology: { placeholder: "e.g., Legacy: Express + JS, Target: Fastify + TypeScript + Zod" },
            context: { placeholder: "Why now? Recent incident? New team? Performance cliff? Compliance change? What's the blast radius if refactoring goes wrong?" },
            currentProblem: { label: "Code Issues", placeholder: "Specific smells: no type safety, implicit any everywhere, zero test coverage, 2000-line god files, circular dependencies, undocumented side effects..." },
            desiredOutcome: { label: "Refactoring Goals", placeholder: "Target: full TypeScript strict mode, 80%+ test coverage, max 200-line modules, zero circular deps, documented public API surface" },
            technicalConstraints: { placeholder: "e.g., Must maintain backward compatibility with v1 API consumers, refactor in-place (no big-bang rewrite), deploy incrementally" },
            mustHave: { placeholder: "Non-negotiables: type safety, test coverage, ADR for each major decision, feature flags to roll back incrementally" }
        }
    },
    incident: {
        fieldOverrides: {
            projectName: { placeholder: "e.g., Post-Mortem: Checkout Service 4hr Outage" },
            projectType: { placeholder: "e.g., Blameless post-mortem, Incident runbook, Escalation playbook" },
            technology: { placeholder: "e.g., Kubernetes, AWS, PagerDuty, Datadog, OpenTelemetry, Grafana OnCall" },
            context: { placeholder: "Timeline of events, detection-to-resolution time, customer impact scope, current monitoring coverage, on-call rotation structure..." },
            currentProblem: { label: "Incident Response Gaps", placeholder: "Root causes of slow MTTR: no runbooks, alert fatigue, unclear ownership, missing distributed tracing, cascading failures not isolated, no chaos engineering..." },
            desiredOutcome: { label: "Response Plan Goals", placeholder: "Target MTTR, SLO-based alerting, automated runbooks, incident commander role, customer comms template, blameless post-mortem culture" },
            mustHave: { placeholder: "Runbook for top 5 failure modes, SLO definitions, alert routing, post-mortem template, comms escalation matrix" },
            stakeholders: { placeholder: "e.g., On-call engineers, SRE team, Customer Success, Legal (for data incidents), Leadership" }
        }
    },
    'api-design': {
        fieldOverrides: {
            projectName: { placeholder: "e.g., Customer Management REST API v2" },
            projectType: { placeholder: "e.g., REST + OpenAPI 3.1, GraphQL, tRPC, gRPC, Webhooks" },
            technology: { placeholder: "e.g., Fastify + Zod + OpenAPI, GraphQL Yoga, Prisma, Clerk auth" },
            context: { placeholder: "Who will consume this API (internal teams, mobile apps, third-party integrations)? Existing v1 contract? Breaking vs non-breaking change policy?" },
            currentProblem: { label: "API Design Challenges", placeholder: "What's the core design question? Versioning strategy, resource modeling for complex domains, real-time (WebSockets vs SSE), auth patterns (API key vs OAuth2 PKCE), batch operations..." },
            desiredOutcome: { label: "API Design Goals", placeholder: "Developer-first API: predictable naming, consistent error codes (RFC 9457), idempotency, pagination (cursor-based), rate limiting, SDK-ready, auto-generated docs" },
            technicalConstraints: { placeholder: "e.g., Cannot break v1 consumers, must support 10k req/s, response time SLA <200ms p99" },
            mustHave: { placeholder: "Must-haves: versioning strategy, auth + scopes, error format (RFC 9457), pagination, OpenAPI spec, changelog" }
        }
    },
    'llm-app': {
        fieldOverrides: {
            projectName: { placeholder: "e.g., Customer Support AI Agent" },
            projectType: { placeholder: "e.g., RAG chatbot, AI agent, LLM pipeline, fine-tuning project, multi-modal app" },
            technology: { placeholder: "e.g., GPT-5 / Claude 4 / Gemini 2.5, LangChain, LlamaIndex, Vercel AI SDK, Pinecone, Weaviate" },
            context: { placeholder: "What domain? What data sources? What's the expected query volume? Any latency or cost constraints? Current prototype results?" },
            currentProblem: { label: "AI Engineering Challenge", placeholder: "What's the specific problem: hallucinations in prod, retrieval quality too low, latency too high, context window overflow, high token cost, no eval framework, prompt drift over time..." },
            desiredOutcome: { label: "AI App Goals", placeholder: "Target accuracy (eval metrics: RAGAS, BERTScore, custom evals), latency p95, cost per query, guardrails in place, human-in-the-loop fallback..." },
            technicalConstraints: { placeholder: "e.g., Must use on-prem LLM (Ollama / vLLM), PII must not leave EU, max $0.01 per query, context window <32k tokens" },
            mustHave: { placeholder: "Eval framework, structured output with Zod/Pydantic, fallback to human, source citations, streaming support" }
        }
    },
    'prompt-craft': {
        fieldOverrides: {
            projectName: { placeholder: "e.g., Code Review Prompt for Claude 4" },
            projectType: { placeholder: "e.g., System prompt, Few-shot prompt, Chain-of-thought, Structured output prompt" },
            technology: { placeholder: "e.g., GPT-5, Claude 4 Sonnet, Gemini 2.5 Flash, Mistral Large, DeepSeek V3, Llama 3.3" },
            context: { placeholder: "What task will this prompt perform? What model will run it? What's the current prompt that's not working well, and what's going wrong?" },
            currentProblem: { label: "Prompt Engineering Challenge", placeholder: "What's wrong with the current prompt? Too vague? Model ignores format instructions? Hallucinating? Not grounding in provided context? JSON output malformed? Too many tokens?" },
            desiredOutcome: { label: "Prompt Goals", placeholder: "Exact output format and quality you want. Include a few examples of ideal responses if possible." },
            mustHave: { placeholder: "Required prompt elements: role assignment, chain-of-thought, output schema, few-shot examples, fallback behavior" },
            successMetrics: { placeholder: "e.g., 95%+ valid JSON output, 0 hallucinations on eval set, <1500 tokens system prompt" }
        }
    },
    'observability': {
        fieldOverrides: {
            projectName: { placeholder: "e.g., Observability Overhaul — E-commerce Platform" },
            projectType: { placeholder: "e.g., Distributed tracing, SLO/SLA setup, Log aggregation, Alerting strategy" },
            technology: { placeholder: "e.g., OpenTelemetry, Grafana, Loki, Tempo, Prometheus, Datadog, Jaeger" },
            context: { placeholder: "Current observability gaps: only logs? No traces? Alert fatigue? How many services? What's the biggest pain — finding the root cause of incidents takes hours?" },
            currentProblem: { label: "Observability Challenges", placeholder: "Specific gaps: no distributed tracing across services, logs not correlated with traces, too many undefined alerts, no SLOs defined, MTTR > 2 hours, dashboards nobody trusts..." },
            desiredOutcome: { label: "Observability Goals", placeholder: "Full OTel instrumentation, SLO-based alerting (not threshold-based), correlated logs+traces+metrics, auto-dashboards, error budget tracking, <30min MTTR" },
            mustHave: { placeholder: "OpenTelemetry SDK in all services, structured logging, distributed trace IDs, 3 golden signals (latency, traffic, errors) per service, on-call runbook link in every alert" }
        }
    }
};

const prompts = [
    {
        id: 1,
        title: "Sprint Planning Assistant",
        description: "Generate a structured sprint plan with task breakdown, dependency mapping, effort estimation, and risk flags — ready to paste into Jira or Linear.",
        category: "planning",
        difficulty: "beginner",
        icon: "event_note",
        template: "sprint"
    },
    {
        id: 2,
        title: "System Architecture Review",
        description: "Get a senior architect's take on your system design — trade-off analysis, bottleneck identification, and a concrete improvement roadmap.",
        category: "development",
        difficulty: "advanced",
        icon: "architecture",
        template: "architecture"
    },
    {
        id: 3,
        title: "Security Threat Modeling",
        description: "Apply STRIDE/OWASP threat modeling to your system. Get a prioritized vulnerability list and SAST/DAST integration plan.",
        category: "security",
        difficulty: "advanced",
        icon: "security",
        template: "security"
    },
    {
        id: 4,
        title: "Modern Testing Strategy",
        description: "Design a testing trophy strategy with Vitest, Playwright, and contract testing. Cut CI time while raising confidence in deploys.",
        category: "testing",
        difficulty: "intermediate",
        icon: "bug_report",
        template: "testing"
    },
    {
        id: 5,
        title: "GitOps CI/CD Pipeline Design",
        description: "Design a GitOps-based pipeline with GitHub Actions, ArgoCD, and Terraform — including canary deploys, rollback, and SLO-gated promotions.",
        category: "devops",
        difficulty: "intermediate",
        icon: "cloud",
        template: "devops"
    },
    {
        id: 6,
        title: "Docs-as-Code Documentation",
        description: "Structure technical docs using the Diátaxis framework. Get a full outline with tutorials, how-tos, reference, and explanation sections.",
        category: "documentation",
        difficulty: "beginner",
        icon: "description",
        template: "documentation"
    },
    {
        id: 7,
        title: "Database Query Optimization",
        description: "Diagnose slow queries, fix N+1 issues, design indexes, and get a zero-downtime migration plan for your PostgreSQL setup.",
        category: "development",
        difficulty: "advanced",
        icon: "storage",
        template: "database"
    },
    {
        id: 8,
        title: "User Story + Acceptance Criteria",
        description: "Transform vague requirements into INVEST-compliant user stories with Given/When/Then acceptance criteria and edge case coverage.",
        category: "planning",
        difficulty: "beginner",
        icon: "person",
        template: "user-story"
    },
    {
        id: 9,
        title: "Core Web Vitals Optimizer",
        description: "Fix LCP, INP, and CLS bottlenecks in your Next.js or React app. Get a prioritized performance plan with before/after metric targets.",
        category: "development",
        difficulty: "advanced",
        icon: "speed",
        template: "performance"
    },
    {
        id: 10,
        title: "Safe Code Refactoring Plan",
        description: "Incrementally modernize legacy code with a feature-flag-based refactor plan, TypeScript migration path, and test coverage gates.",
        category: "development",
        difficulty: "intermediate",
        icon: "transform",
        template: "refactoring"
    },
    {
        id: 11,
        title: "Blameless Incident Post-Mortem",
        description: "Write a complete blameless post-mortem with timeline, root cause analysis, contributing factors, and actionable prevention items.",
        category: "devops",
        difficulty: "intermediate",
        icon: "emergency",
        template: "incident"
    },
    {
        id: 12,
        title: "REST / GraphQL API Design",
        description: "Design a developer-friendly API with proper versioning, RFC 9457 error format, cursor pagination, and auto-generated OpenAPI spec.",
        category: "development",
        difficulty: "intermediate",
        icon: "api",
        template: "api-design"
    },
    {
        id: 13,
        title: "LLM App Architecture",
        description: "Design a production-ready LLM application — choose between RAG, agents, or fine-tuning, with cost/latency/accuracy trade-off analysis.",
        category: "ai",
        difficulty: "advanced",
        icon: "smart_toy",
        template: "llm-app"
    },
    {
        id: 14,
        title: "Prompt Engineering Workbench",
        description: "Craft a high-performance prompt for GPT-5, Claude 4, or Gemini 2.5 — with role priming, chain-of-thought, few-shot examples, and structured output.",
        category: "prompts",
        difficulty: "intermediate",
        icon: "psychology",
        template: "prompt-craft"
    },
    {
        id: 15,
        title: "RAG Pipeline Design",
        description: "Architect a retrieval-augmented generation system with chunking strategy, embedding model selection, vector DB choice, and reranking.",
        category: "ai",
        difficulty: "advanced",
        icon: "hub",
        template: "llm-app"
    },
    {
        id: 16,
        title: "AI Agent Blueprint",
        description: "Design a multi-step AI agent with tool use, memory, interruption handling, and human-in-the-loop checkpoints using modern agent frameworks.",
        category: "ai",
        difficulty: "advanced",
        icon: "precision_manufacturing",
        template: "llm-app"
    },
    {
        id: 17,
        title: "System Prompt Optimizer",
        description: "Audit and rewrite an underperforming system prompt. Reduce token waste, eliminate ambiguity, and enforce reliable output formats.",
        category: "prompts",
        difficulty: "beginner",
        icon: "tune",
        template: "prompt-craft"
    },
    {
        id: 18,
        title: "Observability & SLO Setup",
        description: "Implement OpenTelemetry across your services, define SLOs for golden signals, and set up SLO-based alerting to kill alert fatigue.",
        category: "devops",
        difficulty: "intermediate",
        icon: "monitor_heart",
        template: "observability"
    },
    {
        id: 19,
        title: "Few-Shot Prompt Designer",
        description: "Build a few-shot prompt with carefully selected examples that generalize well — for classification, extraction, or transformation tasks.",
        category: "prompts",
        difficulty: "intermediate",
        icon: "format_list_numbered",
        template: "prompt-craft"
    },
    {
        id: 20,
        title: "LLM Evaluation Framework",
        description: "Design an eval suite for your LLM application using RAGAS, LLM-as-judge, or custom metrics to measure accuracy, groundedness, and latency.",
        category: "ai",
        difficulty: "advanced",
        icon: "fact_check",
        template: "llm-app"
    }
];

const categories = [
    { id: "all", name: "All Prompts", icon: "apps" },
    { id: "ai", name: "AI Development", icon: "smart_toy" },
    { id: "prompts", name: "Prompt Engineering", icon: "psychology" },
    { id: "planning", name: "Planning", icon: "event_note" },
    { id: "development", name: "Development", icon: "code" },
    { id: "testing", name: "Testing", icon: "bug_report" },
    { id: "security", name: "Security", icon: "security" },
    { id: "devops", name: "DevOps & SRE", icon: "cloud" },
    { id: "documentation", name: "Documentation", icon: "description" }
];

const followupSuggestions = {
    refine: [
        {
            icon: "compress",
            text: "Make it shorter — remove fluff",
            action: "\n\n---\n\n**REFINEMENT REQUEST:** Rewrite the above prompt to be 40% shorter while keeping all critical information. Remove filler phrases, redundant context, and anything the model can reasonably infer. Keep every constraint and output format instruction intact."
        },
        {
            icon: "psychology",
            text: "Add chain-of-thought instruction",
            action: "\n\n---\n\n**REFINEMENT REQUEST:** Enhance the above prompt by adding explicit chain-of-thought reasoning instructions. Tell the model to think step-by-step before answering, show its reasoning, and flag any assumptions it makes. This improves output accuracy on complex tasks."
        },
        {
            icon: "output",
            text: "Lock down the output format",
            action: "\n\n---\n\n**REFINEMENT REQUEST:** Rewrite the output format section of the above prompt to be much more specific and enforceable. Define: exact sections required, whether code blocks are needed, numbering for steps, maximum length, and what the model should NOT include. Add an example of ideal output structure."
        }
    ],
    extend: [
        {
            icon: "fact_check",
            text: "Add an LLM evaluation rubric",
            action: "\n\n---\n\n**EXTENSION REQUEST:** Create a 5-point evaluation rubric for grading the quality of responses to the above prompt. Define criteria like: accuracy, completeness, actionability, format compliance, and depth. This rubric can be used for LLM-as-judge evaluation."
        },
        {
            icon: "hub",
            text: "Design as a multi-step agent prompt",
            action: "\n\n---\n\n**EXTENSION REQUEST:** Refactor the above into a multi-step agentic workflow. Break it into: (1) Planning step — identify what to do, (2) Execution steps — each with a specific tool or action, (3) Verification step — self-check the output. Format each step as a separate prompt with clear handoff context."
        },
        {
            icon: "security",
            text: "Add security & privacy guardrails",
            action: "\n\n---\n\n**EXTENSION REQUEST:** Add a guardrails section to the above prompt that instructs the model to: (1) Never output PII, credentials, or secrets, (2) Refuse if the request could be used maliciously, (3) Flag any assumptions about sensitive data. Format as an explicit system-level instruction block."
        },
        {
            icon: "checklist",
            text: "Convert to an implementation checklist",
            action: "\n\n---\n\n**EXTENSION REQUEST:** Based on the above specification, generate a prioritized implementation checklist organized in phases (Phase 1: Foundation, Phase 2: Core, Phase 3: Polish). For each item include: [ ] checkbox, what to do, why it matters, estimated time, and acceptance criteria."
        },
        {
            icon: "code",
            text: "Request working code with tests",
            action: "\n\n---\n\n**EXTENSION REQUEST:** For the technical components described above, provide: (1) A working code implementation with inline comments, (2) At least 3 unit tests covering the happy path and 2 edge cases, (3) A README snippet showing how to run it. Use the same tech stack specified in the prompt."
        }
    ],
    context: [
        {
            icon: "compare_arrows",
            text: "Compare 3 solution approaches",
            action: "\n\n---\n\n**CONTEXT REQUEST:** For the problem above, propose exactly 3 different solution approaches. For each, provide: (1) A one-line name, (2) How it works in 2–3 sentences, (3) Pros (2–3 bullet points), (4) Cons (2–3 bullet points), (5) When to choose it. End with a clear recommendation and justification."
        },
        {
            icon: "warning",
            text: "Identify failure modes & risks",
            action: "\n\n---\n\n**CONTEXT REQUEST:** For the solution or approach discussed above, provide a failure mode analysis: (1) List 5 most likely failure scenarios, (2) For each: probability (High/Medium/Low), impact, detection method, and mitigation strategy. Format as a risk register table."
        },
        {
            icon: "rocket_launch",
            text: "Write a phased rollout strategy",
            action: "\n\n---\n\n**CONTEXT REQUEST:** Create a phased rollout plan for implementing the above in a production system. Include: Phase 1 (Internal/Alpha), Phase 2 (Beta with feature flags), Phase 3 (GA). For each phase: what's deployed, acceptance criteria to advance, rollback trigger conditions, and metrics to monitor."
        },
        {
            icon: "explore",
            text: "Add a 'what if' scenario analysis",
            action: "\n\n---\n\n**CONTEXT REQUEST:** Run 3 'what if' scenarios against the solution described above: (1) What if the load is 10× the expected volume? (2) What if a key dependency is unavailable? (3) What if the team halves in size mid-project? For each scenario, describe the impact and how the solution should adapt."
        }
    ]
};

// ===== STATE =====
let selectedCategory = "all";
let currentTemplate = null;
let currentStep = 1;
let totalSteps = 5;
let generatedPromptText = "";
let isEditMode = false;
let typewriterActive = false;
let typewriterTimeout = null;

// ===== DOM ELEMENTS =====
const categoryList = document.getElementById("categoryList");
const templateGrid = document.getElementById("templateGrid");
const searchInput = document.getElementById("searchInput");
const difficultyFilter = document.getElementById("difficultyFilter");
const clearFilters = document.getElementById("clearFilters");
const noResults = document.getElementById("noResults");
const recentPromptsList = document.getElementById("recentPromptsList");
const modalOverlay = document.getElementById("modalOverlay");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const progressFill = document.getElementById("progressFill");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const generateBtn = document.getElementById("generateBtn");
const regenerateBtn = document.getElementById("regenerateBtn");
const resetBtn = document.getElementById("resetBtn");
const generatedSection = document.getElementById("generatedSection");
const promptOutput = document.getElementById("promptOutput");
const copyBtn = document.getElementById("copyBtn");
const saveBtn = document.getElementById("saveBtn");
const editBtn = document.getElementById("editBtn");
const followupSuggestionsEl = document.getElementById("followupSuggestions");
const confirmationDialog = document.getElementById("confirmationDialog");
const dialogOverlay = document.getElementById("dialogOverlay");
const saveAndExitBtn = document.getElementById("saveAndExit");
const continueEditingBtn = document.getElementById("continueEditing");
const exitWithoutSaveBtn = document.getElementById("exitWithoutSave");
const loadDraftDialog = document.getElementById("loadDraftDialog");
const loadDraftBtn = document.getElementById("loadDraft");
const startFreshBtn = document.getElementById("startFresh");
const draftTimestamp = document.getElementById("draftTimestamp");
const resetDialog = document.getElementById("resetDialog");
const confirmResetBtn = document.getElementById("confirmReset");
const cancelResetBtn = document.getElementById("cancelReset");
const powerUserModeToggle = document.getElementById("powerUserMode");
const powerUserFields = document.getElementById("powerUserFields");
const copyOpenBtn = document.getElementById("copyOpenBtn");
const platformSelectorBtn = document.getElementById("platformSelectorBtn");
const platformDropdown = document.getElementById("platformDropdown");
const selectedPlatformLabel = document.getElementById("selectedPlatformLabel");

// AI Platform Configuration with Prompt Profiles — updated for 2026 models
const defaultPlatformProfiles = {
    chatgpt: {
        id: "chatgpt",
        name: "ChatGPT (GPT-5)",
        url: "https://chat.openai.com",
        prefix: "You are a principal-level software engineer with deep expertise in system design, modern development workflows, and AI-assisted engineering. You reason through problems step by step before giving a final answer.\n\nTask:\n\n",
        suffix: "\n\nRespond with a well-structured, comprehensive answer using Markdown. Include code examples where relevant, call out trade-offs explicitly, and end with a prioritized 'next steps' list."
    },
    claude: {
        id: "claude",
        name: "Claude 4 (Sonnet/Opus)",
        url: "https://claude.ai",
        prefix: "<system>You are an expert software architect and technical advisor. Think through problems carefully before answering. When uncertain, state your assumptions explicitly. Prioritize correctness and nuance over speed.</system>\n\n<task>\n",
        suffix: "\n</task>\n\nThink step by step before answering. Structure your response clearly with headers. Cite trade-offs for every major recommendation. End with a concrete action plan."
    },
    gemini: {
        id: "gemini",
        name: "Gemini 2.5 Pro",
        url: "https://gemini.google.com",
        prefix: "You are an expert technical advisor specializing in the area described below. Use your broad knowledge and reasoning capabilities to provide accurate, nuanced guidance.\n\n",
        suffix: "\n\nProvide a structured response with clear sections. Where you use code, ensure it is production-quality with error handling. Highlight any assumptions and call out risks explicitly."
    },
    perplexity: {
        id: "perplexity",
        name: "Perplexity (Sonar)",
        url: "https://www.perplexity.ai",
        prefix: "Research the following technical topic and provide an evidence-based, up-to-date answer with citations:\n\n",
        suffix: "\n\nInclude links to official documentation, recent best practice guides, and relevant GitHub repos where appropriate. Distinguish between what is established practice vs. emerging/experimental."
    },
    deepseek: {
        id: "deepseek",
        name: "DeepSeek V3",
        url: "https://chat.deepseek.com",
        prefix: "You are an expert software engineer with strong reasoning capabilities. Analyze the following problem thoroughly and provide a well-reasoned solution.\n\n",
        suffix: "\n\nProvide a detailed technical response. Show your reasoning process. Include working code examples where applicable and highlight any edge cases or potential pitfalls."
    },
    mistral: {
        id: "mistral",
        name: "Mistral Large",
        url: "https://chat.mistral.ai",
        prefix: "You are a senior software engineer and technical expert. Provide precise, technically accurate guidance for the following:\n\n",
        suffix: "\n\nBe concise and technically precise. Use code where it helps. Structure your response with clear headers and actionable recommendations."
    },
    grok: {
        id: "grok",
        name: "Grok 3",
        url: "https://grok.x.ai",
        prefix: "You are a sharp, technically deep AI assistant. Cut through the noise and give the real answer — not the textbook answer — for the following technical challenge:\n\n",
        suffix: "\n\nBe direct, precise, and opinionated where appropriate. Call out what's commonly done wrong. Give the recommendation you'd actually give a senior engineer colleague."
    },
    custom: {
        id: "custom",
        name: "Custom URL",
        url: "",
        prefix: "",
        suffix: ""
    }
};

// Load platform profiles from localStorage or use defaults
function loadPlatformProfiles() {
    try {
        const saved = localStorage.getItem('platformProfiles');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load platform profiles:', e);
    }
    return JSON.parse(JSON.stringify(defaultPlatformProfiles));
}

// Save platform profiles to localStorage
function savePlatformProfiles(profiles) {
    try {
        localStorage.setItem('platformProfiles', JSON.stringify(profiles));
        return true;
    } catch (e) {
        console.error('Failed to save platform profiles:', e);
        return false;
    }
}

let platformProfiles = loadPlatformProfiles();

// Legacy compatibility
const platformURLs = Object.keys(platformProfiles).reduce((acc, key) => {
    acc[key] = platformProfiles[key].url;
    return acc;
}, {});

const platformNames = Object.keys(platformProfiles).reduce((acc, key) => {
    acc[key] = platformProfiles[key].name;
    return acc;
}, {});

// ===== INITIALIZATION =====
function init() {
    renderCategories();
    renderTemplates();
    attachEventListeners();
    renderRecentPrompts();
    loadPreferredPlatform();
}

// ===== RENDER FUNCTIONS =====
function renderCategories() {
    categoryList.innerHTML = categories.map(cat => `
        <button class="category-btn ${cat.id === selectedCategory ? 'active' : ''}" data-category="${cat.id}">
            <span class="material-symbols-outlined">${cat.icon}</span>
            ${cat.name}
        </button>
    `).join('');
}

function renderTemplates() {
    const filtered = filterPrompts();

    if (filtered.length === 0) {
        templateGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    templateGrid.style.display = 'grid';
    noResults.style.display = 'none';

    templateGrid.innerHTML = filtered.map(prompt => `
        <div class="template-card" data-id="${prompt.id}">
            <h4>
                <span class="material-symbols-outlined">${prompt.icon}</span>
                ${prompt.title}
            </h4>
            <p>${prompt.description}</p>
            <div class="template-meta">
                <span class="badge badge-${prompt.difficulty}">${prompt.difficulty}</span>
            </div>
            <button class="btn btn-primary" style="width: 100%;">
                <span class="material-symbols-outlined">edit_note</span>
                Use This Template
            </button>
        </div>
    `).join('');
}

function filterPrompts() {
    const search = searchInput.value.toLowerCase();
    const difficulty = difficultyFilter.value;

    return prompts.filter(prompt => {
        const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
        const matchesSearch = !search ||
            prompt.title.toLowerCase().includes(search) ||
            prompt.description.toLowerCase().includes(search);
        const matchesDifficulty = !difficulty || prompt.difficulty === difficulty;

        return matchesCategory && matchesSearch && matchesDifficulty;
    });
}

// ===== WIZARD FUNCTIONS =====
function updateWizardStep(step) {
    currentStep = step;

    // Update step indicators
    document.querySelectorAll('.wizard-step').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelector(`.wizard-step[data-step="${step}"]`).classList.add('active');

    // Update progress bar
    document.querySelectorAll('.progress-step').forEach((el, index) => {
        el.classList.remove('active', 'completed');
        if (index + 1 < step) {
            el.classList.add('completed');
        } else if (index + 1 === step) {
            el.classList.add('active');
        }
    });

    const progressPercent = ((step - 1) / (totalSteps - 1)) * 100;
    progressFill.style.width = `${progressPercent}%`;

    // Update navigation buttons
    prevBtn.style.display = step > 1 ? 'flex' : 'none';
    nextBtn.style.display = step < totalSteps ? 'flex' : 'none';
    generateBtn.style.display = step === totalSteps ? 'flex' : 'none';
    regenerateBtn.style.display = 'none';

    // Scroll to top of modal body
    document.querySelector('.modal-body').scrollTop = 0;
}

function validateStep(step) {
    const requiredFields = {
        1: ['projectName', 'projectType'],
        3: ['currentProblem'],
        4: ['desiredOutcome']
    };

    if (!requiredFields[step]) return true;

    for (const fieldId of requiredFields[step]) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showToast(`Please fill in the required field: ${field.placeholder}`, 'error');
            field.focus();
            return false;
        }
    }

    return true;
}

function nextStep() {
    if (!validateStep(currentStep)) return;
    if (currentStep < totalSteps) {
        updateWizardStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 1) {
        updateWizardStep(currentStep - 1);
    }
}

function resetWizard() {
    // Reset all form fields
    document.querySelectorAll('input, textarea, select').forEach(el => {
        if (el.id !== 'searchInput' && el.id !== 'difficultyFilter') {
            el.value = '';
        }
    });

    // Reset wizard state
    currentStep = 1;
    updateWizardStep(1);
    generatedSection.style.display = 'none';
    isEditMode = false;
    promptOutput.contentEditable = 'false';
}

// ===== AI REACTION FEEDBACK =====
const aiReactionInsights = [
    "💬 This prompt is clear but could use more context about the team's experience level.",
    "💬 Good structure — consider specifying the expected timeline more explicitly.",
    "💬 Well-defined problem! Adding success metrics would make this even stronger.",
    "💬 Nice detail level. You might want to clarify the priority of requirements.",
    "💬 Solid prompt! Consider adding examples of what you're looking for.",
    "💬 Clear objectives. Specifying the technical constraints earlier could help.",
    "💬 Good context provided. Adding stakeholder expectations would be valuable.",
    "💬 Well-structured! Consider mentioning any existing solutions you've tried.",
    "💬 Strong prompt. You could enhance it by specifying the output format preference.",
    "💬 Clear requirements! Adding budget or resource constraints would help.",
    "💬 Good detail. Consider specifying what 'success' looks like more concretely.",
    "💬 Well-defined scope. Mentioning the team size could provide useful context.",
    "💬 Solid foundation! Adding edge cases to consider would strengthen this.",
    "💬 Clear problem statement. Consider adding acceptance criteria.",
    "💬 Good structure! Specifying the urgency level would help prioritize the response.",
    "💬 Well-articulated! You might want to mention any compliance requirements.",
    "💬 Strong prompt! Consider adding examples of similar solutions you've seen.",
    "💬 Clear goals. Mentioning the target audience would add valuable context.",
    "💬 Good detail level. Consider specifying any technical debt concerns.",
    "💬 Well-organized! Adding performance requirements would be helpful."
];

function showAIReaction() {
    const aiReactionBox = document.getElementById('aiReactionBox');
    const aiReactionText = document.getElementById('aiReactionText');
    
    // Select a random insight
    const randomInsight = aiReactionInsights[Math.floor(Math.random() * aiReactionInsights.length)];
    
    // Set the text
    aiReactionText.textContent = randomInsight;
    
    // Show the box with animation
    aiReactionBox.style.display = 'block';
    
    // Reset animation by removing and re-adding
    aiReactionBox.style.animation = 'none';
    setTimeout(() => {
        aiReactionBox.style.animation = 'fadeInUp 0.6s ease-out forwards';
    }, 10);
}

// ===== TYPEWRITER ANIMATION =====
function typewriterEffect(text, element, callback) {
    // Clear any existing timeout
    if (typewriterTimeout) {
        clearTimeout(typewriterTimeout);
    }
    
    // Check if fast mode is enabled
    const fastModeToggle = document.getElementById('fastModeToggle');
    const isFastMode = fastModeToggle && fastModeToggle.checked;
    
    if (isFastMode) {
        // Fast mode: display all text immediately
        element.textContent = text;
        typewriterActive = false;
        if (callback) callback();
        return;
    }
    
    // Typewriter mode
    typewriterActive = true;
    element.textContent = '';
    
    // Create cursor element
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.textContent = '|';
    element.appendChild(cursor);
    
    let index = 0;
    const delay = Math.floor(Math.random() * (15 - 10 + 1)) + 10; // Random delay between 10-15ms (much faster)
    
    function typeNextChar() {
        if (index < text.length) {
            // Remove cursor temporarily
            if (cursor.parentNode) {
                cursor.remove();
            }
            
            // Add next character
            element.textContent += text.charAt(index);
            
            // Re-add cursor
            element.appendChild(cursor);
            
            index++;
            typewriterTimeout = setTimeout(typeNextChar, delay);
        } else {
            // Animation complete - remove cursor
            if (cursor.parentNode) {
                cursor.remove();
            }
            typewriterActive = false;
            if (callback) callback();
        }
    }
    
    typeNextChar();
}

function stopTypewriter() {
    if (typewriterTimeout) {
        clearTimeout(typewriterTimeout);
        typewriterTimeout = null;
    }
    typewriterActive = false;
    
    // Remove any cursor elements
    const cursors = promptOutput.querySelectorAll('.typewriter-cursor');
    cursors.forEach(cursor => cursor.remove());
    
    // Display full text immediately
    if (generatedPromptText) {
        promptOutput.textContent = generatedPromptText;
    }
}

// ===== PROMPT BREAKDOWN =====
function generatePromptBreakdown(data) {
    const breakdownItems = [];
    
    // Project Info
    if (data.projectName || data.projectType) {
        breakdownItems.push({
            type: 'project',
            icon: '📁',
            label: 'Project',
            content: `${data.projectName || 'Unnamed Project'}${data.projectType ? ` - ${data.projectType}` : ''}`
        });
    }
    
    // Tech Stack
    if (data.technology) {
        breakdownItems.push({
            type: 'tech',
            icon: '💻',
            label: 'Tech Stack',
            content: data.technology
        });
    }
    
    // Context
    if (data.context || data.teamExperience || data.teamSize) {
        let contextText = [];
        if (data.context) contextText.push(data.context);
        if (data.teamExperience) contextText.push(`Team: ${data.teamExperience}`);
        if (data.teamSize) contextText.push(`Size: ${data.teamSize}`);
        
        breakdownItems.push({
            type: 'context',
            icon: '📋',
            label: 'Context',
            content: contextText.join(' • ')
        });
    }
    
    // Problem
    if (data.currentProblem) {
        breakdownItems.push({
            type: 'problem',
            icon: '⚠️',
            label: 'Problem',
            content: data.currentProblem
        });
    }
    
    // Constraints
    if (data.technicalConstraints || data.businessConstraints || data.budget) {
        let constraintsText = [];
        if (data.technicalConstraints) constraintsText.push(`Tech: ${data.technicalConstraints}`);
        if (data.businessConstraints) constraintsText.push(`Business: ${data.businessConstraints}`);
        if (data.budget) constraintsText.push(`Budget: ${data.budget}`);
        
        breakdownItems.push({
            type: 'constraints',
            icon: '🔒',
            label: 'Constraints',
            content: constraintsText.join(' • ')
        });
    }
    
    // Goal
    if (data.desiredOutcome) {
        breakdownItems.push({
            type: 'goal',
            icon: '🎯',
            label: 'Goal',
            content: data.desiredOutcome
        });
    }
    
    // Requirements
    if (data.mustHave || data.niceToHave) {
        let reqText = [];
        if (data.mustHave) reqText.push(`Must: ${data.mustHave}`);
        if (data.niceToHave) reqText.push(`Nice: ${data.niceToHave}`);
        
        breakdownItems.push({
            type: 'requirements',
            icon: '✅',
            label: 'Requirements',
            content: reqText.join(' • ')
        });
    }
    
    // Tone (if power user mode)
    if (data.powerUserMode && data.tone) {
        const toneLabels = {
            'formal': 'Formal & Professional',
            'casual': 'Casual & Conversational',
            'technical': 'Technical & Precise'
        };
        
        breakdownItems.push({
            type: 'tone',
            icon: '🧠',
            label: 'Tone',
            content: toneLabels[data.tone] || data.tone
        });
    }
    
    return breakdownItems;
}

function renderPromptBreakdown(breakdownItems) {
    const breakdownPanel = document.getElementById('promptBreakdown');
    const breakdownItemsEl = document.getElementById('breakdownItems');
    
    if (breakdownItems.length === 0) {
        breakdownPanel.style.display = 'none';
        return;
    }
    
    breakdownItemsEl.innerHTML = breakdownItems.map(item => `
        <div class="breakdown-item ${item.type}" data-type="${item.type}">
            <div class="breakdown-item-header">
                <span class="breakdown-item-icon">${item.icon}</span>
                <span class="breakdown-item-label">${item.label}</span>
            </div>
            <div class="breakdown-item-content">${item.content}</div>
        </div>
    `).join('');
    
    breakdownPanel.style.display = 'block';
    
    // Add click handlers to breakdown items
    document.querySelectorAll('.breakdown-item').forEach(item => {
        item.addEventListener('click', () => {
            // Add highlight effect
            item.classList.add('highlight');
            setTimeout(() => {
                item.classList.remove('highlight');
            }, 600);
            
            // Scroll prompt output to show relevant section
            // This is a visual feedback that the item was clicked
            showToast(`Viewing ${item.querySelector('.breakdown-item-label').textContent} section`, 'success');
        });
    });
}

function toggleBreakdownPanel() {
    const breakdownContent = document.getElementById('breakdownContent');
    const breakdownToggle = document.getElementById('breakdownToggle');
    
    if (breakdownContent.classList.contains('collapsed')) {
        breakdownContent.classList.remove('collapsed');
        breakdownToggle.classList.remove('collapsed');
    } else {
        breakdownContent.classList.add('collapsed');
        breakdownToggle.classList.add('collapsed');
    }
}

function toggleQualityMeter() {
    const qualityMeterContent = document.getElementById('qualityMeterContent');
    const qualityToggle = document.getElementById('qualityToggle');
    
    if (qualityMeterContent.classList.contains('collapsed')) {
        qualityMeterContent.classList.remove('collapsed');
        qualityToggle.classList.remove('collapsed');
        qualityToggle.querySelector('.material-symbols-outlined').textContent = 'expand_less';
    } else {
        qualityMeterContent.classList.add('collapsed');
        qualityToggle.classList.add('collapsed');
        qualityToggle.querySelector('.material-symbols-outlined').textContent = 'expand_more';
    }
}

// ===== PROMPT QUALITY CALCULATION =====
function calculatePromptQuality(data) {
    let score = 0;
    let maxScore = 100;
    let details = [];
    
    // Core fields (10 points each)
    const coreFields = [
        { key: 'projectName', label: 'Project Name', points: 10 },
        { key: 'projectType', label: 'Project Type', points: 10 },
        { key: 'currentProblem', label: 'Problem Statement', points: 10 },
        { key: 'desiredOutcome', label: 'Desired Outcome', points: 10 }
    ];
    
    coreFields.forEach(field => {
        const isFilled = data[field.key] && data[field.key].trim().length > 0;
        if (isFilled) {
            score += field.points;
        }
        details.push({
            label: field.label,
            filled: isFilled,
            points: field.points
        });
    });
    
    // Important fields (8 points each)
    const importantFields = [
        { key: 'technology', label: 'Technology Stack', points: 8 },
        { key: 'context', label: 'Background Context', points: 8 },
        { key: 'deadline', label: 'Timeline/Deadline', points: 8 }
    ];
    
    importantFields.forEach(field => {
        const isFilled = data[field.key] && data[field.key].trim().length > 0;
        if (isFilled) {
            score += field.points;
        }
        details.push({
            label: field.label,
            filled: isFilled,
            points: field.points
        });
    });
    
    // Supporting fields (6 points each)
    const supportingFields = [
        { key: 'technicalConstraints', label: 'Technical Constraints', points: 6 },
        { key: 'businessConstraints', label: 'Business Constraints', points: 6 },
        { key: 'successMetrics', label: 'Success Metrics', points: 6 },
        { key: 'mustHave', label: 'Must-Have Requirements', points: 6 }
    ];
    
    supportingFields.forEach(field => {
        const isFilled = data[field.key] && data[field.key].trim().length > 0;
        if (isFilled) {
            score += field.points;
        }
        details.push({
            label: field.label,
            filled: isFilled,
            points: field.points
        });
    });
    
    // Calculate percentage
    const percentage = Math.round((score / maxScore) * 100);
    
    // Determine quality level
    let level, feedback, description, barClass;
    if (percentage >= 80) {
        level = 'excellent';
        barClass = 'excellent';
        feedback = '🟢 Excellent Quality';
        description = 'Your prompt is comprehensive and well-structured. It provides all the necessary context for an AI to deliver high-quality results.';
    } else if (percentage >= 50) {
        level = 'good';
        barClass = 'good';
        feedback = '🟡 Good Quality';
        description = 'Your prompt has solid foundations but could benefit from additional details in some areas to get even better results.';
    } else {
        level = 'needs-improvement';
        barClass = 'needs-improvement';
        feedback = '🔴 Needs More Details';
        description = 'Consider adding more information to help the AI understand your requirements better and provide more accurate responses.';
    }
    
    return {
        score: percentage,
        level,
        barClass,
        feedback,
        description,
        details
    };
}

function displayPromptQuality(qualityData) {
    const qualityMeter = document.getElementById('promptQualityMeter');
    const qualityScore = document.getElementById('qualityScore');
    const qualityBar = document.getElementById('qualityBar');
    const qualityFeedback = document.getElementById('qualityFeedback');
    const qualityDetails = document.getElementById('qualityDetails');
    
    // Show the meter
    qualityMeter.style.display = 'block';
    
    // Update score
    qualityScore.textContent = `${qualityData.score}%`;
    
    // Update bar
    qualityBar.className = `quality-bar ${qualityData.barClass}`;
    qualityBar.style.width = `${qualityData.score}%`;
    
    // Update feedback
    qualityFeedback.innerHTML = `
        <div class="quality-feedback-text">
            <span class="material-symbols-outlined">${qualityData.level === 'excellent' ? 'check_circle' : qualityData.level === 'good' ? 'info' : 'warning'}</span>
            ${qualityData.feedback}
        </div>
        <div class="quality-feedback-description">${qualityData.description}</div>
    `;
    
    // Update details
    qualityDetails.innerHTML = qualityData.details.map(detail => `
        <div class="quality-detail-item ${detail.filled ? 'filled' : 'missing'}">
            <span class="material-symbols-outlined">${detail.filled ? 'check_circle' : 'radio_button_unchecked'}</span>
            <span>${detail.label} ${detail.filled ? `(+${detail.points})` : `(${detail.points})`}</span>
        </div>
    `).join('');
    
    // Animate the meter
    setTimeout(() => {
        qualityMeter.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// ===== PROMPT GENERATION =====
function collectFormData() {
    const fields = [
        'projectName', 'projectType', 'technology', 'teamSize', 'timeframe',
        'context', 'teamExperience', 'deadline', 'stakeholders',
        'currentProblem', 'technicalConstraints', 'businessConstraints', 'budget', 'resources',
        'desiredOutcome', 'successMetrics', 'mustHave', 'niceToHave',
        'outputFormat', 'additionalInstructions',
        'tone', 'responseFormat'
    ];

    const data = {};
    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) {
            data[field] = el.value.trim();
        }
    });

    // Add power user mode state
    data.powerUserMode = powerUserModeToggle.checked;

    return data;
}

function generatePrompt() {
    const data = collectFormData();

    // Get selected prompt style (default to 'analyst')
    const promptStyle = localStorage.getItem('promptStyle') || 'analyst';
    
    // Get platform for profile wrapping
    const platform = localStorage.getItem('preferredAIPlatform') || 'chatgpt';
    const profile = platformProfiles[platform];
    
    // Use the new intelligent prompt generation system
    let prompt;
    if (window.PromptLogic && window.PromptLogic.generateIntelligentPrompt) {
        prompt = window.PromptLogic.generateIntelligentPrompt(data, currentTemplate, {
            style: promptStyle,
            platform: platform
        });
    } else {
        // Fallback to basic generation if module not loaded
        console.warn('PromptLogic module not loaded, using fallback generation');
        prompt = generateFallbackPrompt(data);
    }
    
    // Wrap with platform-specific prefix and suffix
    const finalPrompt = (profile.prefix || '') + prompt + (profile.suffix || '');

    // Display generated prompt with typewriter effect
    generatedPromptText = finalPrompt;
    generatedSection.style.display = 'block';
    regenerateBtn.style.display = 'flex';
    generateBtn.style.display = 'none';

    // Calculate and display prompt quality
    const qualityData = calculatePromptQuality(data);
    displayPromptQuality(qualityData);
    
    // Generate and render breakdown
    const breakdownItems = generatePromptBreakdown(data);
    renderPromptBreakdown(breakdownItems);
    
    // Use typewriter effect to display the prompt
    typewriterEffect(finalPrompt, promptOutput, () => {
        // Callback after typewriter completes
        // Render follow-up suggestions
        renderFollowupSuggestions();
        
        // Show AI Reaction
        showAIReaction();
    });

    // Save to localStorage
    savePromptToHistory(data, prompt);

    // Scroll to generated section
    setTimeout(() => {
        generatedSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);

    showToast('Prompt generated successfully!', 'success');
}

function renderFollowupSuggestions() {
    // Select 1 from each category
    const refineOption = followupSuggestions.refine[Math.floor(Math.random() * followupSuggestions.refine.length)];
    const extendOption = followupSuggestions.extend[Math.floor(Math.random() * followupSuggestions.extend.length)];
    const contextOption = followupSuggestions.context[Math.floor(Math.random() * followupSuggestions.context.length)];

    followupSuggestionsEl.innerHTML = `
        <div class="followup-category">
            <div class="category-label">🔹 Refine</div>
            <button class="followup-btn" data-action="${encodeURIComponent(refineOption.action)}">
                <span class="material-symbols-outlined">${refineOption.icon}</span>
                <span>${refineOption.text}</span>
            </button>
        </div>
        <div class="followup-category">
            <div class="category-label">🔹 Extend</div>
            <button class="followup-btn" data-action="${encodeURIComponent(extendOption.action)}">
                <span class="material-symbols-outlined">${extendOption.icon}</span>
                <span>${extendOption.text}</span>
            </button>
        </div>
        <div class="followup-category">
            <div class="category-label">🔹 Context</div>
            <button class="followup-btn" data-action="${encodeURIComponent(contextOption.action)}">
                <span class="material-symbols-outlined">${contextOption.icon}</span>
                <span>${contextOption.text}</span>
            </button>
        </div>
    `;
}

function applyFollowup(action) {
    const decodedAction = decodeURIComponent(action);
    generatedPromptText += decodedAction;
    promptOutput.textContent = generatedPromptText;
    showToast('Follow-up suggestion applied!', 'success');
    
    // Scroll to bottom of prompt output
    promptOutput.scrollTop = promptOutput.scrollHeight;
}

// ===== EDIT FUNCTIONALITY =====
function toggleEditMode() {
    isEditMode = !isEditMode;
    promptOutput.contentEditable = isEditMode;
    
    if (isEditMode) {
        promptOutput.focus();
        editBtn.innerHTML = '<span class="material-symbols-outlined">check</span> Save';
        showToast('Edit mode enabled. Click Save when done.', 'success');
    } else {
        generatedPromptText = promptOutput.textContent;
        editBtn.innerHTML = '<span class="material-symbols-outlined">edit</span> Edit';
        showToast('Changes saved!', 'success');
    }
}

// ===== EXPORT FUNCTIONS =====
function exportPrompt(format) {
    const text = promptOutput.textContent;
    const data = collectFormData();
    const timestamp = new Date().toISOString();
    const templateName = currentTemplate ? currentTemplate.title : 'Custom';
    
    switch(format) {
        case 'json':
            exportAsJSON(data, text, timestamp, templateName);
            break;
        case 'markdown':
            exportAsMarkdown(text, data, timestamp, templateName);
            break;
        case 'pdf':
            exportAsPDF(text, data, timestamp, templateName);
            break;
        case 'text':
            exportAsText(text, data, timestamp, templateName);
            break;
        default:
            showToast('Unknown export format', 'error');
    }
}

function exportAsJSON(data, prompt, timestamp, templateName) {
    const exportData = {
        timestamp: timestamp,
        template: templateName,
        formData: data,
        generatedPrompt: prompt
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-prompt-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Prompt exported as JSON!', 'success');
}

function exportAsMarkdown(prompt, data, timestamp, templateName) {
    const date = new Date(timestamp).toLocaleString();
    let markdown = `# AI Prompt: ${templateName}\n\n`;
    markdown += `**Generated:** ${date}\n\n`;
    markdown += `## Prompt\n\n\`\`\`\n${prompt}\n\`\`\`\n\n`;
    
    // Add form data if available
    if (data.projectName || data.projectType) {
        markdown += `## Project Details\n\n`;
        if (data.projectName) markdown += `- **Project:** ${data.projectName}\n`;
        if (data.projectType) markdown += `- **Type:** ${data.projectType}\n`;
        if (data.technology) markdown += `- **Tech Stack:** ${data.technology}\n`;
        markdown += '\n';
    }
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-prompt-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Prompt exported as Markdown!', 'success');
}

function exportAsPDF(prompt, data, timestamp, templateName) {
    // Create a print-friendly HTML document
    const date = new Date(timestamp).toLocaleString();
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>AI Prompt: ${templateName}</title>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    padding: 40px; 
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    color: #333;
                }
                h1 { 
                    color: #333; 
                    border-bottom: 3px solid #667eea; 
                    padding-bottom: 15px; 
                    margin-bottom: 20px;
                }
                .meta { 
                    color: #666; 
                    margin-bottom: 30px; 
                    font-size: 14px;
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 5px;
                }
                .prompt { 
                    background: #f5f5f5; 
                    padding: 20px; 
                    border-radius: 5px; 
                    font-family: 'Courier New', monospace; 
                    white-space: pre-wrap;
                    border: 1px solid #ddd;
                    margin: 20px 0;
                }
                .project-details { 
                    margin-top: 30px; 
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 5px;
                }
                .project-details h2 { 
                    color: #555; 
                    margin-top: 0;
                }
                ul {
                    padding-left: 20px;
                }
                li {
                    margin-bottom: 8px;
                }
                .instructions {
                    margin-top: 40px;
                    padding: 20px;
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 5px;
                    color: #856404;
                    font-size: 14px;
                }
                @media print {
                    body { 
                        padding: 0;
                        max-width: 100%;
                    }
                    .instructions { 
                        display: none; 
                    }
                    .prompt {
                        page-break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            <h1>AI Prompt: ${templateName}</h1>
            <div class="meta">
                <strong>Generated:</strong> ${date}<br>
                <strong>Source:</strong> LiDa Prompt Pilot • ${window.location.origin}
            </div>
            
            <h2>Prompt</h2>
            <div class="prompt">${escapeHtmlForPDF(prompt)}</div>
            
            ${data.projectName || data.projectType ? `
            <div class="project-details">
                <h2>Project Details</h2>
                <ul>
                    ${data.projectName ? `<li><strong>Project:</strong> ${escapeHtmlForPDF(data.projectName)}</li>` : ''}
                    ${data.projectType ? `<li><strong>Type:</strong> ${escapeHtmlForPDF(data.projectType)}</li>` : ''}
                    ${data.technology ? `<li><strong>Tech Stack:</strong> ${escapeHtmlForPDF(data.technology)}</li>` : ''}
                    ${data.teamSize ? `<li><strong>Team Size:</strong> ${escapeHtmlForPDF(data.teamSize)}</li>` : ''}
                    ${data.timeframe ? `<li><strong>Timeframe:</strong> ${escapeHtmlForPDF(data.timeframe)}</li>` : ''}
                </ul>
            </div>
            ` : ''}
            
            <div class="instructions">
                <strong>📄 How to save as PDF:</strong><br>
                1. In the print dialog, select "Save as PDF" as the destination<br>
                2. Choose your preferred paper size and margins<br>
                3. Click "Save" to download the PDF file<br>
                <em>This message will not appear in the printed document.</em>
            </div>
        </body>
        </html>
    `;
    
    // Open a new window with the print content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then show print dialog
    printWindow.onload = function() {
        // Show toast with instructions
        showToast('Opening print dialog. Select "Save as PDF" to download.', 'success');
        
        // Small delay to ensure content is fully rendered
        setTimeout(() => {
            printWindow.print();
            
            // Close window after printing
            printWindow.onafterprint = function() {
                printWindow.close();
            };
        }, 500);
    };
}

function escapeHtmlForPDF(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

function exportAsText(prompt, data, timestamp, templateName) {
    const date = new Date(timestamp).toLocaleString();
    let text = `AI Prompt: ${templateName}\n`;
    text += `Generated: ${date}\n\n`;
    text += `PROMPT:\n${prompt}\n\n`;
    
    if (data.projectName || data.projectType) {
        text += `PROJECT DETAILS:\n`;
        if (data.projectName) text += `  Project: ${data.projectName}\n`;
        if (data.projectType) text += `  Type: ${data.projectType}\n`;
        if (data.technology) text += `  Tech Stack: ${data.technology}\n`;
        text += '\n';
    }
    
    text += `Generated with LiDa Prompt Pilot • ${window.location.origin}`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-prompt-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Prompt exported as plain text!', 'success');
}

// ===== COPY & SAVE FUNCTIONS =====
function copyToClipboard() {
    const text = promptOutput.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="material-symbols-outlined">check</span> Copied!';
        showToast('Prompt copied to clipboard!', 'success');
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
        }, 2000);
    }).catch(() => {
        showToast('Failed to copy to clipboard', 'error');
    });
}

function copyAndOpenAI() {
    // Get the final prompt text (already includes prefix/suffix from generation)
    const text = promptOutput.textContent;
    const platform = localStorage.getItem('preferredAIPlatform') || 'chatgpt';
    
    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
        showToast(`Prompt copied! Opening ${platformNames[platform]}...`, 'success');
        
        // Open AI platform
        let url = platformURLs[platform];
        
        if (platform === 'custom') {
            url = localStorage.getItem('customPlatformURL');
            if (!url) {
                promptCustomURL();
                return;
            }
        }
        
        window.open(url, '_blank');
    }).catch(() => {
        showToast('Failed to copy to clipboard', 'error');
    });
}

function promptCustomURL() {
    showCustomUrlDialog();
}

function showCustomUrlDialog() {
    const customUrlDialog = document.getElementById('customUrlDialog');
    const customUrlInput = document.getElementById('customUrlInput');
    const saveCustomUrlBtn = document.getElementById('saveCustomUrl');
    const cancelCustomUrlBtn = document.getElementById('cancelCustomUrl');
    
    // Pre-fill with existing URL if available
    const existingUrl = localStorage.getItem('customPlatformURL') || '';
    customUrlInput.value = existingUrl;
    
    // Show dialog
    customUrlDialog.style.display = 'block';
    dialogOverlay.classList.add('active');
    
    // Focus input
    setTimeout(() => customUrlInput.focus(), 100);
    
    // Handle save
    const handleSave = () => {
        const url = customUrlInput.value.trim();
        
        // Validate URL
        if (!url) {
            showToast('Please enter a URL', 'error');
            customUrlInput.focus();
            return;
        }
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            showToast('URL must start with http:// or https://', 'error');
            customUrlInput.focus();
            return;
        }
        
        // Save URL
        localStorage.setItem('customPlatformURL', url);
        platformURLs.custom = url;
        updateSelectedPlatform('custom');
        hideCustomUrlDialog();
        showToast('Custom URL saved successfully!', 'success');
        
        // If we came from copyAndOpenAI, execute it now
        if (generatedSection.style.display !== 'none') {
            copyAndOpenAI();
        }
    };
    
    // Handle cancel
    const handleCancel = () => {
        hideCustomUrlDialog();
    };
    
    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };
    
    // Remove old listeners
    saveCustomUrlBtn.replaceWith(saveCustomUrlBtn.cloneNode(true));
    cancelCustomUrlBtn.replaceWith(cancelCustomUrlBtn.cloneNode(true));
    
    // Get new references
    const newSaveBtn = document.getElementById('saveCustomUrl');
    const newCancelBtn = document.getElementById('cancelCustomUrl');
    
    // Add new listeners
    newSaveBtn.addEventListener('click', handleSave);
    newCancelBtn.addEventListener('click', handleCancel);
    customUrlInput.addEventListener('keydown', handleKeyPress);
}

function hideCustomUrlDialog() {
    const customUrlDialog = document.getElementById('customUrlDialog');
    customUrlDialog.style.display = 'none';
    dialogOverlay.classList.remove('active');
}

function saveAsJSON() {
    const data = collectFormData();
    const exportData = {
        timestamp: new Date().toISOString(),
        template: currentTemplate ? currentTemplate.title : 'Custom',
        formData: data,
        generatedPrompt: promptOutput.textContent
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-prompt-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Prompt saved as JSON!', 'success');
}

// ===== LOCAL STORAGE =====
function savePromptToHistory(data, prompt) {
    try {
        const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
        
        // Create title from project name or template
        const title = data.projectName || (currentTemplate ? currentTemplate.title : 'Untitled Prompt');
        
        history.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            title: title,
            template: currentTemplate ? currentTemplate.title : 'Custom',
            data: data,
            prompt: prompt
        });
        
        // Keep only last 5 prompts
        if (history.length > 5) {
            history.length = 5;
        }
        
        localStorage.setItem('promptHistory', JSON.stringify(history));
        
        // Re-render recent prompts list
        renderRecentPrompts();
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

function getRecentPrompts() {
    try {
        const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
        return history;
    } catch (e) {
        console.error('Failed to load from localStorage:', e);
        return [];
    }
}

function deleteRecentPrompt(id) {
    try {
        let history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
        history = history.filter(item => item.id !== id);
        localStorage.setItem('promptHistory', JSON.stringify(history));
        renderRecentPrompts();
        showToast('Prompt deleted', 'success');
    } catch (e) {
        console.error('Failed to delete prompt:', e);
        showToast('Failed to delete prompt', 'error');
    }
}

function loadPromptFromHistory(id) {
    try {
        const history = getRecentPrompts();
        const item = history.find(h => h.id === id);
        
        if (!item) {
            showToast('Prompt not found', 'error');
            return;
        }
        
        // Set current template if it exists
        if (item.template !== 'Custom') {
            currentTemplate = prompts.find(p => p.title === item.template) || null;
        } else {
            currentTemplate = null;
        }
        
        // Open modal
        openModal();
        
        // Wait for modal to open, then populate fields
        setTimeout(() => {
            // Populate all form fields
            Object.keys(item.data).forEach(key => {
                const el = document.getElementById(key);
                if (el && item.data[key]) {
                    if (el.type === 'checkbox') {
                        el.checked = item.data[key];
                        // Trigger change event for power user mode
                        if (key === 'powerUserMode' && item.data[key]) {
                            powerUserFields.style.display = 'block';
                        }
                    } else {
                        el.value = item.data[key];
                    }
                }
            });
            
            // Go to last step and show the generated prompt
            updateWizardStep(totalSteps);
            generatedPromptText = item.prompt;
            promptOutput.textContent = item.prompt;
            generatedSection.style.display = 'block';
            regenerateBtn.style.display = 'flex';
            generateBtn.style.display = 'none';
            renderFollowupSuggestions();
            
            showToast('Prompt loaded successfully!', 'success');
        }, 300);
    } catch (e) {
        console.error('Failed to load prompt:', e);
        showToast('Failed to load prompt', 'error');
    }
}

function renderRecentPrompts() {
    const history = getRecentPrompts();
    
    if (history.length === 0) {
        recentPromptsList.innerHTML = '<p class="empty-state">No recent prompts yet</p>';
        return;
    }
    
    recentPromptsList.innerHTML = history.map(item => {
        const date = new Date(item.timestamp);
        const timeAgo = getTimeAgo(date);
        const preview = item.prompt.substring(0, 100).replace(/\n/g, ' ');
        
        return `
            <div class="recent-prompt-item" data-id="${item.id}">
                <div class="recent-prompt-header">
                    <div class="recent-prompt-title">${item.title}</div>
                    <button class="recent-prompt-delete" data-id="${item.id}" onclick="event.stopPropagation();">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
                <div class="recent-prompt-preview">${preview}...</div>
                <div class="recent-prompt-meta">
                    <span class="material-symbols-outlined">schedule</span>
                    <span>${timeAgo}</span>
                    <span class="recent-prompt-template">${item.template}</span>
                </div>
            </div>
        `;
    }).join('');
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
        return `${diffDays}d ago`;
    } else if (diffHours > 0) {
        return `${diffHours}h ago`;
    } else if (diffMins > 0) {
        return `${diffMins}m ago`;
    } else {
        return 'just now';
    }
}

// ===== AI PLATFORM SELECTION =====
function loadPreferredPlatform() {
    const platform = localStorage.getItem('preferredAIPlatform') || 'chatgpt';
    updateSelectedPlatform(platform);
}

function updateSelectedPlatform(platform) {
    localStorage.setItem('preferredAIPlatform', platform);
    selectedPlatformLabel.textContent = `Preferred AI: ${platformNames[platform]}`;
    
    // Update selected state in dropdown
    document.querySelectorAll('.platform-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.platform === platform) {
            option.classList.add('selected');
        }
    });
}

function togglePlatformDropdown() {
    const isOpen = platformDropdown.style.display === 'block';
    
    if (isOpen) {
        platformDropdown.style.display = 'none';
        platformSelectorBtn.classList.remove('active');
    } else {
        platformDropdown.style.display = 'block';
        platformSelectorBtn.classList.add('active');
    }
}

function closePlatformDropdown() {
    platformDropdown.style.display = 'none';
    platformSelectorBtn.classList.remove('active');
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : 'error'}</span>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// ===== MODAL FUNCTIONS =====
function openModal() {
    modalTitle.textContent = currentTemplate ? currentTemplate.title : "AI Prompt Wizard";
    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    updateWizardStep(1);
}

function closeModalFn() {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
}

function hasUnsavedChanges() {
    // Check if any form field has content
    const fields = [
        'projectName', 'projectType', 'technology', 'teamSize', 'timeframe',
        'context', 'teamExperience', 'deadline', 'stakeholders',
        'currentProblem', 'technicalConstraints', 'businessConstraints', 'budget', 'resources',
        'desiredOutcome', 'successMetrics', 'mustHave', 'niceToHave',
        'additionalInstructions'
    ];

    return fields.some(field => {
        const el = document.getElementById(field);
        return el && el.value.trim() !== '';
    });
}

function attemptCloseModal() {
    if (hasUnsavedChanges()) {
        showConfirmationDialog();
    } else {
        closeModalFn();
    }
}

function showConfirmationDialog() {
    confirmationDialog.style.display = 'block';
    dialogOverlay.classList.add('active');
}

function hideConfirmationDialog() {
    confirmationDialog.style.display = 'none';
    dialogOverlay.classList.remove('active');
}

function getDraftKey() {
    // Generate template-specific draft key
    if (currentTemplate && currentTemplate.template) {
        return `wizardDraft_${currentTemplate.template}`;
    }
    return 'wizardDraft_custom';
}

function saveDraftToCache() {
    const data = collectFormData();
    const draft = {
        timestamp: new Date().toISOString(),
        template: currentTemplate ? currentTemplate.title : 'Custom',
        templateId: currentTemplate ? currentTemplate.template : 'custom',
        currentStep: currentStep,
        formData: data
    };
    
    try {
        const draftKey = getDraftKey();
        localStorage.setItem(draftKey, JSON.stringify(draft));
        return true;
    } catch (e) {
        console.error('Failed to save draft:', e);
        return false;
    }
}

function loadDraftFromCache() {
    try {
        const draftKey = getDraftKey();
        const draft = localStorage.getItem(draftKey);
        if (draft) {
            const parsed = JSON.parse(draft);
            
            // Restore form data
            Object.keys(parsed.formData).forEach(key => {
                const el = document.getElementById(key);
                if (el && parsed.formData[key]) {
                    el.value = parsed.formData[key];
                }
            });
            
            // Restore step
            if (parsed.currentStep) {
                updateWizardStep(parsed.currentStep);
            }
            
            return true;
        }
    } catch (e) {
        console.error('Failed to load draft:', e);
    }
    return false;
}

function clearDraftFromCache() {
    try {
        const draftKey = getDraftKey();
        localStorage.removeItem(draftKey);
    } catch (e) {
        console.error('Failed to clear draft:', e);
    }
}
// ===== TEMPLATE FIELD CUSTOMIZATION =====
function applyTemplateFieldOverrides() {
    if (!currentTemplate || !currentTemplate.template) {
        return;
    }
    
    const config = templateConfigs[currentTemplate.template];
    if (!config || !config.fieldOverrides) {
        return;
    }
    
    // Apply field overrides
    Object.keys(config.fieldOverrides).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        const override = config.fieldOverrides[fieldId];
        
        // Update placeholder
        if (override.placeholder) {
            field.placeholder = override.placeholder;
        }
        
        // Update label if specified
        if (override.label) {
            const label = field.closest('.form-group')?.querySelector('label');
            if (label) {
                // Preserve the required asterisk if it exists
                const hasRequired = label.innerHTML.includes('<span class="required">*</span>');
                const labelText = override.label;
                label.innerHTML = hasRequired ? 
                    `${labelText} <span class="required">*</span>` : 
                    labelText;
            }
        }
    });
}

function resetFieldOverrides() {
    // Reset to default placeholders and labels
    const defaultFields = {
        projectName: { label: 'Project Name', placeholder: 'e.g., Mobile App Redesign' },
        projectType: { label: 'Project Type', placeholder: 'e.g., Web application, Mobile app, API service' },
        technology: { label: 'Technology Stack', placeholder: 'e.g., React, Node.js, PostgreSQL' },
        teamSize: { label: 'Team Size', placeholder: 'e.g., 5 developers, 2 designers' },
        context: { label: 'Background Context', placeholder: 'Provide relevant background information about the project...' },
        currentProblem: { label: 'Current Problem', placeholder: 'Describe the problem or challenge you\'re facing...' },
        desiredOutcome: { label: 'Desired Outcome', placeholder: 'What do you want to achieve? What does success look like?' },
        mustHave: { label: 'Must-Have Requirements', placeholder: 'Critical requirements that must be met...' },
        niceToHave: { label: 'Nice-to-Have Features', placeholder: 'Optional features or enhancements...' }
    };
    
    Object.keys(defaultFields).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        const defaults = defaultFields[fieldId];
        
        // Reset placeholder
        if (defaults.placeholder) {
            field.placeholder = defaults.placeholder;
        }
        
        // Reset label
        if (defaults.label) {
            const label = field.closest('.form-group')?.querySelector('label');
            if (label) {
                const hasRequired = label.innerHTML.includes('<span class="required">*</span>');
                label.innerHTML = hasRequired ? 
                    `${defaults.label} <span class="required">*</span>` : 
                    defaults.label;
            }
        }
    });
}

function openModal() {
    modalTitle.textContent = currentTemplate ? currentTemplate.title : "AI Prompt Wizard";
    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    
    // Apply template-specific field customizations
    if (currentTemplate) {
        applyTemplateFieldOverrides();
    } else {
        resetFieldOverrides();
    }
    
    // Check if there's a saved draft for THIS specific template
    const draftKey = getDraftKey();
    const draftData = localStorage.getItem(draftKey);
    if (draftData) {
        // Show custom dialog to ask user if they want to load the draft
        setTimeout(() => {
            showLoadDraftDialog(draftData);
        }, 300);
    } else {
        updateWizardStep(1);
    }
}

function showLoadDraftDialog(draftData) {
    try {
        const draft = JSON.parse(draftData);
        const savedDate = new Date(draft.timestamp);
        const now = new Date();
        const diffMs = now - savedDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        let timeAgo = '';
        if (diffDays > 0) {
            timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMins > 0) {
            timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        } else {
            timeAgo = 'just now';
        }
        
        draftTimestamp.innerHTML = `
            <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px; color: var(--primary);">schedule</span>
            <strong>Last saved:</strong> ${timeAgo} • <strong>Template:</strong> ${draft.template || 'Custom'}
        `;
        
        loadDraftDialog.style.display = 'block';
        dialogOverlay.classList.add('active');
    } catch (e) {
        console.error('Failed to parse draft:', e);
        updateWizardStep(1);
    }
}

function hideLoadDraftDialog() {
    loadDraftDialog.style.display = 'none';
    dialogOverlay.classList.remove('active');
}

function showResetDialog() {
    resetDialog.style.display = 'block';
    dialogOverlay.classList.add('active');
}

function hideResetDialog() {
    resetDialog.style.display = 'none';
    dialogOverlay.classList.remove('active');
}

function closeModalFn() {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
}

// ===== SHARE FUNCTIONALITY =====
function sharePrompt() {
    const promptText = promptOutput.textContent;
    const data = collectFormData();
    const templateName = currentTemplate ? currentTemplate.title : 'Custom';
    const timestamp = new Date().toLocaleString();
    
    // Create shareable content with attribution
    let shareContent = `🤖 AI Prompt: ${templateName}\n\n`;
    shareContent += `Generated with LiDa Prompt Pilot\n`;
    shareContent += `🔗 ${window.location.origin}\n\n`;
    shareContent += `📅 ${timestamp}\n\n`;
    
    if (data.projectName) {
        shareContent += `📁 Project: ${data.projectName}\n`;
    }
    if (data.projectType) {
        shareContent += `📋 Type: ${data.projectType}\n`;
    }
    
    shareContent += `\n--- PROMPT ---\n\n`;
    shareContent += `${promptText}\n\n`;
    shareContent += `--- END PROMPT ---\n\n`;
    shareContent += `✨ Try it yourself: ${window.location.href}`;
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: `AI Prompt: ${templateName}`,
            text: shareContent,
            url: window.location.href
        })
        .then(() => {
            showToast('Prompt shared successfully!', 'success');
        })
        .catch((error) => {
            console.error('Error sharing:', error);
            fallbackShare(shareContent);
        });
    } else {
        fallbackShare(shareContent);
    }
}

function fallbackShare(shareContent) {
    // Copy to clipboard as fallback
    navigator.clipboard.writeText(shareContent).then(() => {
        showToast('Prompt copied to clipboard! Share it anywhere.', 'success');
        
        // Show a message about where to share
        const shareOptions = [
            '📧 Email',
            '💬 Slack/Discord',
            '🐦 Twitter/X',
            '💼 LinkedIn',
            '📱 WhatsApp/Telegram'
        ];
        
        const shareMessage = `Prompt copied! You can paste it in:\n\n${shareOptions.join('\n')}`;
        alert(shareMessage);
    }).catch(() => {
        // Last resort: show the content in an alert
        alert('Share this prompt:\n\n' + shareContent);
    });
}

// ===== EXPORT DROPDOWN FUNCTIONALITY =====
function initializeExportDropdown() {
    const exportDropdown = document.querySelector('.export-dropdown');
    const saveBtn = document.getElementById('saveBtn');
    const exportOptions = document.getElementById('exportOptions');
    
    if (!exportDropdown || !saveBtn || !exportOptions) return;
    
    // Toggle dropdown on button click
    saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = exportOptions.style.display === 'block';
        
        if (isOpen) {
            exportOptions.style.display = 'none';
            exportDropdown.classList.remove('active');
        } else {
            exportOptions.style.display = 'block';
            exportDropdown.classList.add('active');
        }
    });
    
    // Handle export option selection
    exportOptions.addEventListener('click', (e) => {
        const option = e.target.closest('.export-option');
        if (option) {
            const format = option.dataset.format;
            exportPrompt(format);
            
            // Close dropdown
            exportOptions.style.display = 'none';
            exportDropdown.classList.remove('active');
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!exportDropdown.contains(e.target)) {
            exportOptions.style.display = 'none';
            exportDropdown.classList.remove('active');
        }
    });
}

// ===== EVENT LISTENERS =====
function attachEventListeners() {
    // Category selection
    categoryList.addEventListener("click", (e) => {
        const btn = e.target.closest(".category-btn");
        if (btn) {
            selectedCategory = btn.dataset.category;
            renderCategories();
            renderTemplates();
        }
    });

    // Template card click
    templateGrid.addEventListener("click", (e) => {
        const card = e.target.closest(".template-card");
        if (card) {
            const promptId = parseInt(card.dataset.id);
            currentTemplate = prompts.find(p => p.id === promptId);
            openModal();
        }
    });

    // Search and filters
    searchInput.addEventListener("input", renderTemplates);
    difficultyFilter.addEventListener("change", renderTemplates);
    clearFilters.addEventListener("click", () => {
        searchInput.value = "";
        difficultyFilter.value = "";
        selectedCategory = "all";
        renderCategories();
        renderTemplates();
    });

    // Modal controls
    closeModal.addEventListener("click", attemptCloseModal);
    // Prevent closing modal by clicking overlay
    modalOverlay.addEventListener("click", (e) => {
        // Do nothing - user must use close button
    });

    // Confirmation dialog handlers
    saveAndExitBtn.addEventListener("click", () => {
        if (saveDraftToCache()) {
            showToast('Progress saved! You can continue later.', 'success');
            hideConfirmationDialog();
            closeModalFn();
            resetWizard();
        } else {
            showToast('Failed to save progress', 'error');
        }
    });

    continueEditingBtn.addEventListener("click", () => {
        hideConfirmationDialog();
    });

    exitWithoutSaveBtn.addEventListener("click", () => {
        clearDraftFromCache();
        hideConfirmationDialog();
        closeModalFn();
        resetWizard();
        showToast('Changes discarded', 'success');
    });

    // Load draft dialog handlers
    loadDraftBtn.addEventListener("click", () => {
        hideLoadDraftDialog();
        if (loadDraftFromCache()) {
            showToast('Draft loaded successfully!', 'success');
        } else {
            showToast('Failed to load draft', 'error');
            updateWizardStep(1);
        }
    });

    startFreshBtn.addEventListener("click", () => {
        hideLoadDraftDialog();
        clearDraftFromCache();
        updateWizardStep(1);
        showToast('Starting fresh!', 'success');
    });

    // Reset dialog handlers
    confirmResetBtn.addEventListener("click", () => {
        hideResetDialog();
        resetWizard();
        showToast('All fields have been reset', 'success');
    });

    cancelResetBtn.addEventListener("click", () => {
        hideResetDialog();
    });

    // Power User Mode toggle
    powerUserModeToggle.addEventListener("change", () => {
        if (powerUserModeToggle.checked) {
            powerUserFields.style.display = 'block';
            showToast('Power User Mode enabled!', 'success');
        } else {
            powerUserFields.style.display = 'none';
            // Reset power user fields
            document.getElementById('tone').value = '';
            document.getElementById('responseFormat').value = '';
            showToast('Power User Mode disabled', 'success');
        }
    });

    // Copy + Open AI button
    copyOpenBtn.addEventListener("click", copyAndOpenAI);
    
    // Share button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener("click", sharePrompt);
    }

    // Platform selector
    platformSelectorBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        togglePlatformDropdown();
    });

    // Platform selection
    platformDropdown.addEventListener("click", (e) => {
        const option = e.target.closest('.platform-option');
        if (option) {
            const platform = option.dataset.platform;
            
            if (platform === 'custom') {
                closePlatformDropdown();
                promptCustomURL();
            } else {
                updateSelectedPlatform(platform);
                closePlatformDropdown();
                showToast(`${platformNames[platform]} selected!`, 'success');
            }
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!platformSelectorBtn.contains(e.target) && !platformDropdown.contains(e.target)) {
            closePlatformDropdown();
        }
    });

    // Platform settings button
    const platformSettingsBtn = document.getElementById('platformSettingsBtn');
    if (platformSettingsBtn) {
        platformSettingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPromptProfileDialog();
        });
    }

    // Profile dialog handlers
    const profilePlatformSelect = document.getElementById('profilePlatformSelect');
    const profilePrefix = document.getElementById('profilePrefix');
    const profileSuffix = document.getElementById('profileSuffix');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    const resetProfileBtn = document.getElementById('resetProfileBtn');

    if (profilePlatformSelect) {
        profilePlatformSelect.addEventListener('change', () => {
            loadProfileForPlatform(profilePlatformSelect.value);
        });
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveCurrentProfile);
    }

    if (cancelProfileBtn) {
        cancelProfileBtn.addEventListener('click', hidePromptProfileDialog);
    }

    if (resetProfileBtn) {
        resetProfileBtn.addEventListener('click', resetCurrentProfile);
    }

    // Wizard navigation
    nextBtn.addEventListener("click", nextStep);
    prevBtn.addEventListener("click", prevStep);
    generateBtn.addEventListener("click", generatePrompt);
    regenerateBtn.addEventListener("click", generatePrompt);
    resetBtn.addEventListener("click", () => {
        showResetDialog();
    });

    // Prompt actions
    copyBtn.addEventListener("click", copyToClipboard);
    // Note: saveBtn event listener is handled in initializeExportDropdown()
    editBtn.addEventListener("click", toggleEditMode);

    // Follow-up suggestions
    followupSuggestionsEl.addEventListener("click", (e) => {
        const btn = e.target.closest(".followup-btn");
        if (btn) {
            const action = btn.dataset.action;
            applyFollowup(action);
        }
    });

    // Recent prompts list
    recentPromptsList.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".recent-prompt-delete");
        if (deleteBtn) {
            e.stopPropagation();
            const id = parseInt(deleteBtn.dataset.id);
            deleteRecentPrompt(id);
            return;
        }
        
        const item = e.target.closest(".recent-prompt-item");
        if (item) {
            const id = parseInt(item.dataset.id);
            loadPromptFromHistory(id);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (modalOverlay.classList.contains('active') && !dialogOverlay.classList.contains('active')) {
            if (e.key === 'Escape') {
                attemptCloseModal();
            } else if (e.key === 'Enter' && e.ctrlKey) {
                if (currentStep === totalSteps && generateBtn.style.display !== 'none') {
                    generatePrompt();
                } else if (nextBtn.style.display !== 'none') {
                    nextStep();
                }
            }
        } else if (dialogOverlay.classList.contains('active')) {
            if (e.key === 'Escape') {
                // Close whichever dialog is open
                if (confirmationDialog.style.display !== 'none') {
                    hideConfirmationDialog();
                } else if (loadDraftDialog.style.display !== 'none') {
                    hideLoadDraftDialog();
                } else if (resetDialog.style.display !== 'none') {
                    hideResetDialog();
                }
            }
        }
    });

    // Breakdown toggle button
    const breakdownToggle = document.getElementById('breakdownToggle');
    if (breakdownToggle) {
        breakdownToggle.addEventListener('click', toggleBreakdownPanel);
    }

    // Quality meter toggle button
    const qualityToggle = document.getElementById('qualityToggle');
    if (qualityToggle) {
        qualityToggle.addEventListener('click', toggleQualityMeter);
    }

    // Check for saved draft on page load
    const hasDraft = localStorage.getItem('wizardDraft');
    if (hasDraft) {
        // Show a subtle notification that there's a saved draft
        setTimeout(() => {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.style.background = 'var(--primary)';
            toast.innerHTML = `
                <span class="material-symbols-outlined">info</span>
                <span>You have a saved draft. Open any template to continue.</span>
            `;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 5000);
        }, 1000);
    }
}

// ===== PROMPT PROFILE DIALOG FUNCTIONS =====
function showPromptProfileDialog() {
    const promptProfileDialog = document.getElementById('promptProfileDialog');
    const profilePlatformSelect = document.getElementById('profilePlatformSelect');
    
    // Show dialog
    promptProfileDialog.style.display = 'block';
    dialogOverlay.classList.add('active');
    
    // Load current platform's profile
    const currentPlatform = localStorage.getItem('preferredAIPlatform') || 'chatgpt';
    profilePlatformSelect.value = currentPlatform;
    loadProfileForPlatform(currentPlatform);
}

function hidePromptProfileDialog() {
    const promptProfileDialog = document.getElementById('promptProfileDialog');
    promptProfileDialog.style.display = 'none';
    dialogOverlay.classList.remove('active');
}

function loadProfileForPlatform(platformId) {
    const profilePrefix = document.getElementById('profilePrefix');
    const profileSuffix = document.getElementById('profileSuffix');
    
    const profile = platformProfiles[platformId];
    if (profile) {
        profilePrefix.value = profile.prefix || '';
        profileSuffix.value = profile.suffix || '';
    }
}

function saveCurrentProfile() {
    const profilePlatformSelect = document.getElementById('profilePlatformSelect');
    const profilePrefix = document.getElementById('profilePrefix');
    const profileSuffix = document.getElementById('profileSuffix');
    
    const platformId = profilePlatformSelect.value;
    
    // Update the profile
    platformProfiles[platformId].prefix = profilePrefix.value;
    platformProfiles[platformId].suffix = profileSuffix.value;
    
    // Save to localStorage
    if (savePlatformProfiles(platformProfiles)) {
        hidePromptProfileDialog();
        showToast('Prompt profile saved successfully!', 'success');
    } else {
        showToast('Failed to save prompt profile', 'error');
    }
}

function resetCurrentProfile() {
    const profilePlatformSelect = document.getElementById('profilePlatformSelect');
    const platformId = profilePlatformSelect.value;
    
    // Get default profile
    const defaultProfile = defaultPlatformProfiles[platformId];
    
    if (defaultProfile) {
        // Reset to default
        platformProfiles[platformId].prefix = defaultProfile.prefix;
        platformProfiles[platformId].suffix = defaultProfile.suffix;
        
        // Save to localStorage
        if (savePlatformProfiles(platformProfiles)) {
            // Reload the form
            loadProfileForPlatform(platformId);
            showToast('Profile reset to default!', 'success');
        } else {
            showToast('Failed to reset profile', 'error');
        }
    }
}

// ===== LIVE PREVIEW FUNCTIONALITY =====
let livePreviewEnabled = false;
let previewUpdateTimeout = null;

function initializeLivePreview() {
    const livePreviewToggle = document.getElementById('livePreviewToggle');
    const livePreviewPanel = document.getElementById('livePreviewPanel');
    
    // Toggle live preview on/off
    livePreviewToggle.addEventListener('change', () => {
        livePreviewEnabled = livePreviewToggle.checked;
        
        if (livePreviewEnabled) {
            livePreviewPanel.style.display = 'block';
            updateLivePreview();
            showToast('Live Preview enabled!', 'success');
        } else {
            livePreviewPanel.style.display = 'none';
            showToast('Live Preview disabled', 'success');
        }
    });
    
    // Attach input listeners to all form fields
    const formFields = [
        'projectName', 'projectType', 'technology', 'teamSize', 'timeframe',
        'context', 'teamExperience', 'deadline', 'stakeholders',
        'currentProblem', 'technicalConstraints', 'businessConstraints', 'budget', 'resources',
        'desiredOutcome', 'successMetrics', 'mustHave', 'niceToHave',
        'outputFormat', 'additionalInstructions',
        'tone', 'responseFormat'
    ];
    
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', () => {
                if (livePreviewEnabled) {
                    debouncedUpdateLivePreview();
                }
            });
            
            field.addEventListener('change', () => {
                if (livePreviewEnabled) {
                    debouncedUpdateLivePreview();
                }
            });
        }
    });
}

function debouncedUpdateLivePreview() {
    // Clear existing timeout
    if (previewUpdateTimeout) {
        clearTimeout(previewUpdateTimeout);
    }
    
    // Set new timeout for 300ms after user stops typing
    previewUpdateTimeout = setTimeout(() => {
        updateLivePreview();
    }, 300);
}

function updateLivePreview() {
    const livePreviewContent = document.getElementById('livePreviewContent');
    
    if (!livePreviewEnabled) {
        return;
    }
    
    // Add updating flash effect
    livePreviewContent.classList.add('updating');
    setTimeout(() => {
        livePreviewContent.classList.remove('updating');
    }, 300);
    
    // Collect current form data
    const data = collectFormData();
    
    // Check if there's any content
    const hasContent = Object.values(data).some(value => 
        value && typeof value === 'string' && value.trim().length > 0
    );
    
    if (!hasContent) {
        livePreviewContent.innerHTML = '<p class="preview-placeholder">Start filling out the form to see your prompt preview...</p>';
        return;
    }
    
    // Build preview prompt (similar to generatePrompt but simplified)
    let preview = '';
    
    // Project Context
    if (data.projectName || data.projectType || data.technology) {
        preview += '<div class="preview-section">';
        preview += '<div class="preview-section-title">Project Context</div>';
        preview += '<div class="preview-section-content">';
        if (data.projectName) preview += `<strong>Project:</strong> ${escapeHtml(data.projectName)}<br>`;
        if (data.projectType) preview += `<strong>Type:</strong> ${escapeHtml(data.projectType)}<br>`;
        if (data.technology) preview += `<strong>Tech Stack:</strong> ${escapeHtml(data.technology)}<br>`;
        preview += '</div></div>';
    }
    
    // Team & Timeline
    if (data.teamSize || data.teamExperience || data.timeframe || data.deadline) {
        preview += '<div class="preview-section">';
        preview += '<div class="preview-section-title">Team & Timeline</div>';
        preview += '<div class="preview-section-content">';
        if (data.teamSize) preview += `<strong>Team Size:</strong> ${escapeHtml(data.teamSize)}<br>`;
        if (data.teamExperience) preview += `<strong>Experience:</strong> ${escapeHtml(data.teamExperience)}<br>`;
        if (data.timeframe) preview += `<strong>Timeframe:</strong> ${escapeHtml(data.timeframe)}<br>`;
        if (data.deadline) preview += `<strong>Deadline:</strong> ${escapeHtml(data.deadline)}<br>`;
        preview += '</div></div>';
    }
    
    // Context
    if (data.context) {
        preview += '<div class="preview-section">';
        preview += '<div class="preview-section-title">Background Context</div>';
        preview += '<div class="preview-section-content">';
        preview += escapeHtml(data.context).replace(/\n/g, '<br>');
        preview += '</div></div>';
    }
    
    // Problem Statement
    if (data.currentProblem) {
        preview += '<div class="preview-section">';
        preview += '<div class="preview-section-title">Problem Statement</div>';
        preview += '<div class="preview-section-content">';
        preview += escapeHtml(data.currentProblem).replace(/\n/g, '<br>');
        preview += '</div></div>';
    }
    
    // Constraints
    if (data.technicalConstraints || data.businessConstraints || data.budget || data.resources) {
        preview += '<div class="preview-section">';
        preview += '<div class="preview-section-title">Constraints</div>';
        preview += '<div class="preview-section-content">';
        if (data.technicalConstraints) preview += `<strong>Technical:</strong> ${escapeHtml(data.technicalConstraints)}<br>`;
        if (data.businessConstraints) preview += `<strong>Business:</strong> ${escapeHtml(data.businessConstraints)}<br>`;
        if (data.budget) preview += `<strong>Budget:</strong> ${escapeHtml(data.budget)}<br>`;
        if (data.resources) preview += `<strong>Resources:</strong> ${escapeHtml(data.resources)}<br>`;
        preview += '</div></div>';
    }
    
    // Desired Outcome
    if (data.desiredOutcome) {
        preview += '<div class="preview-section">';
        preview += '<div class="preview-section-title">Desired Outcome</div>';
        preview += '<div class="preview-section-content">';
        preview += escapeHtml(data.desiredOutcome).replace(/\n/g, '<br>');
        preview += '</div></div>';
    }
    
    // Success Metrics
    if (data.successMetrics) {
        preview += '<div class="preview-section">';
        preview += '<div class="preview-section-title">Success Metrics</div>';
        preview += '<div class="preview-section-content">';
        preview += escapeHtml(data.successMetrics).replace(/\n/g, '<br>');
        preview += '</div></div>';
    }
    
    // Requirements
    if (data.mustHave || data.niceToHave) {
        preview += '<div class="preview-section">';
        preview += '<div class="preview-section-title">Requirements</div>';
        preview += '<div class="preview-section-content">';
        if (data.mustHave) preview += `<strong>Must-Have:</strong><br>${escapeHtml(data.mustHave).replace(/\n/g, '<br>')}<br>`;
        if (data.niceToHave) preview += `<strong>Nice-to-Have:</strong><br>${escapeHtml(data.niceToHave).replace(/\n/g, '<br>')}<br>`;
        preview += '</div></div>';
    }
    
    // Stakeholders
    if (data.stakeholders) {
        preview += '<div class="preview-section">';
        preview += '<div class="preview-section-title">Stakeholders</div>';
        preview += '<div class="preview-section-content">';
        preview += escapeHtml(data.stakeholders);
        preview += '</div></div>';
    }
    
    // Output Format
    if (data.outputFormat) {
        preview += '<div class="preview-section">';
        preview += '<div class="preview-section-title">Output Format</div>';
        preview += '<div class="preview-section-content">';
        const formatLabels = {
            "detailed": "Detailed analysis with recommendations",
            "actionable": "Actionable step-by-step plan",
            "code": "Code implementation with examples",
            "documentation": "Documentation format",
            "comparison": "Comparison of options",
            "checklist": "Checklist or task breakdown"
        };
        preview += formatLabels[data.outputFormat] || data.outputFormat;
        preview += '</div></div>';
    }
    
    // Additional Instructions
    if (data.additionalInstructions) {
        preview += '<div class="preview-section">';
        preview += '<div class="preview-section-title">Additional Instructions</div>';
        preview += '<div class="preview-section-content">';
        preview += escapeHtml(data.additionalInstructions).replace(/\n/g, '<br>');
        preview += '</div></div>';
    }
    
    // Power User Options
    if (data.powerUserMode && (data.tone || data.responseFormat)) {
        preview += '<div class="preview-section">';
        preview += '<div class="preview-section-title">Response Preferences</div>';
        preview += '<div class="preview-section-content">';
        if (data.tone) {
            const toneLabels = {
                'formal': 'Formal & Professional',
                'casual': 'Casual & Conversational',
                'technical': 'Technical & Precise'
            };
            preview += `<strong>Tone:</strong> ${toneLabels[data.tone] || data.tone}<br>`;
        }
        if (data.responseFormat) {
            const formatLabels = {
                'markdown': 'Markdown',
                'bullets': 'Bullet List',
                'code-comments': 'Code Comments'
            };
            preview += `<strong>Format:</strong> ${formatLabels[data.responseFormat] || data.responseFormat}<br>`;
        }
        preview += '</div></div>';
    }
    
    // Update the preview content
    livePreviewContent.innerHTML = preview;
    
    // Scroll to bottom of preview to show latest additions
    livePreviewContent.scrollTop = livePreviewContent.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== FLOATING AI AVATAR WITH TIPS =====
const aiAvatarTips = [
    "💡 Tip: Be specific about your tech stack for better recommendations!",
    "💡 Tip: Include success metrics to get measurable outcomes!",
    "💡 Tip: Mention your team's experience level for tailored advice!",
    "💡 Tip: Add constraints early to get realistic solutions!",
    "💡 Tip: Use Power User Mode for advanced customization options!",
    "💡 Tip: Save your prompts to reuse them later!",
    "💡 Tip: Try different AI platforms to compare responses!",
    "💡 Tip: Include edge cases in your problem description!",
    "💡 Tip: Specify your timeline for time-sensitive recommendations!",
    "💡 Tip: Add stakeholder info to get politically-aware advice!",
    "💡 Tip: Use the Live Preview to see your prompt build in real-time!",
    "💡 Tip: Click on breakdown items to highlight sections!",
    "💡 Tip: Enable Fast Mode to skip the typewriter animation!",
    "💡 Tip: Recent prompts are saved automatically for quick access!",
    "💡 Tip: Use follow-up suggestions to refine your prompts!",
    "💡 Tip: The quality meter shows what's missing from your prompt!",
    "💡 Tip: Customize AI platform prefixes in settings!",
    "💡 Tip: Press Ctrl+Enter to quickly move to the next step!",
    "💡 Tip: Your progress is auto-saved if you close the wizard!",
    "💡 Tip: Export prompts as JSON to share with your team!"
];

let currentTipIndex = 0;
let tipRotationInterval = null;
let tipDisplayTimeout = null;

function initializeAIAvatar() {
    const aiAvatar = document.getElementById('aiAvatar');
    const aiTipBubble = document.getElementById('aiTipBubble');
    const aiTipText = document.getElementById('aiTipText');
    
    if (!aiAvatar || !aiTipBubble || !aiTipText) {
        return;
    }
    
    // Show tip on hover
    aiAvatar.addEventListener('mouseenter', () => {
        showAITip();
    });
    
    // Hide tip when mouse leaves
    aiAvatar.addEventListener('mouseleave', () => {
        hideAITip();
    });
    
    // Click to cycle through tips
    aiAvatar.addEventListener('click', () => {
        currentTipIndex = (currentTipIndex + 1) % aiAvatarTips.length;
        showAITip();
    });
    
    // Auto-rotate tips every 15 seconds when visible
    startTipRotation();
    
    // Show first tip after 3 seconds
    setTimeout(() => {
        showAITip();
        setTimeout(() => {
            hideAITip();
        }, 5000);
    }, 3000);
}

function showAITip() {
    const aiTipBubble = document.getElementById('aiTipBubble');
    const aiTipText = document.getElementById('aiTipText');
    
    if (!aiTipBubble || !aiTipText) {
        return;
    }
    
    // Clear any existing timeout
    if (tipDisplayTimeout) {
        clearTimeout(tipDisplayTimeout);
    }
    
    // Set the tip text
    aiTipText.textContent = aiAvatarTips[currentTipIndex];
    
    // Show the bubble
    aiTipBubble.style.display = 'block';
    
    // Auto-hide after 8 seconds
    tipDisplayTimeout = setTimeout(() => {
        hideAITip();
    }, 8000);
}

function hideAITip() {
    const aiTipBubble = document.getElementById('aiTipBubble');
    
    if (!aiTipBubble) {
        return;
    }
    
    aiTipBubble.style.display = 'none';
    
    // Clear timeout
    if (tipDisplayTimeout) {
        clearTimeout(tipDisplayTimeout);
        tipDisplayTimeout = null;
    }
}

function startTipRotation() {
    // Clear any existing interval
    if (tipRotationInterval) {
        clearInterval(tipRotationInterval);
    }
    
    // Rotate tips every 20 seconds
    tipRotationInterval = setInterval(() => {
        // Only auto-show if modal is not open
        if (!modalOverlay.classList.contains('active')) {
            currentTipIndex = (currentTipIndex + 1) % aiAvatarTips.length;
            showAITip();
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                hideAITip();
            }, 5000);
        }
    }, 20000);
}

function stopTipRotation() {
    if (tipRotationInterval) {
        clearInterval(tipRotationInterval);
        tipRotationInterval = null;
    }
}

// Pause tip rotation when modal is open
function pauseTipsWhenModalOpen() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                if (modalOverlay.classList.contains('active')) {
                    hideAITip();
                }
            }
        });
    });
    
    observer.observe(modalOverlay, {
        attributes: true,
        attributeFilter: ['class']
    });
}

// ===== HELP GUIDE FUNCTIONALITY =====
function initializeHelpGuide() {
    const helpButton = document.getElementById('helpButton');
    const helpGuideModal = document.getElementById('helpGuideModal');
    const closeHelpGuide = document.getElementById('closeHelpGuide');
    const closeHelpGuideBtn = document.getElementById('closeHelpGuideBtn');
    
    if (!helpButton || !helpGuideModal) {
        return;
    }
    
    // Open help guide
    helpButton.addEventListener('click', () => {
        showHelpGuide();
    });
    
    // Close help guide with X button
    if (closeHelpGuide) {
        closeHelpGuide.addEventListener('click', () => {
            hideHelpGuide();
        });
    }
    
    // Close help guide with "Got It!" button
    if (closeHelpGuideBtn) {
        closeHelpGuideBtn.addEventListener('click', () => {
            hideHelpGuide();
        });
    }
}

function showHelpGuide() {
    const helpGuideModal = document.getElementById('helpGuideModal');
    if (helpGuideModal) {
        helpGuideModal.style.display = 'flex';
        
        // Reset scroll position to top
        const helpGuideBody = helpGuideModal.querySelector('.help-guide-body');
        if (helpGuideBody) {
            helpGuideBody.scrollTop = 0;
        }
        
        setTimeout(() => {
            helpGuideModal.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden';
    }
}

function hideHelpGuide() {
    const helpGuideModal = document.getElementById('helpGuideModal');
    if (helpGuideModal) {
        helpGuideModal.classList.remove('active');
        setTimeout(() => {
            helpGuideModal.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    }
}

// ===== THEME TOGGLE FUNCTIONALITY =====
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.material-symbols-outlined');
    
    if (!themeToggle) return;
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    let currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(currentTheme);
    
    // Toggle theme on click
    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
        showToast(`${currentTheme === 'dark' ? 'Dark' : 'Light'} mode enabled!`, 'success');
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            // Only auto-switch if user hasn't set a preference
            const newTheme = e.matches ? 'dark' : 'light';
            applyTheme(newTheme);
        }
    });
}

function applyTheme(theme) {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('.material-symbols-outlined');
    
    // Set data-theme attribute on root
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update icon
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
        themeToggle.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
    }
}

// ===== KEYBOARD SHORTCUTS =====
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts if user is typing in an input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }
        
        const isCtrl = e.ctrlKey || e.metaKey; // metaKey for Mac Command key
        
        // Ctrl/Cmd + Enter: Generate prompt or go to next step
        if (isCtrl && e.key === 'Enter') {
            e.preventDefault();
            if (modalOverlay.classList.contains('active')) {
                if (currentStep === totalSteps && generateBtn.style.display !== 'none') {
                    generatePrompt();
                } else if (nextBtn.style.display !== 'none') {
                    nextStep();
                }
            }
        }
        
        // Ctrl/Cmd + S: Save as JSON
        if (isCtrl && e.key === 's') {
            e.preventDefault();
            if (generatedSection.style.display !== 'none') {
                saveAsJSON();
            }
        }
        
        // Ctrl/Cmd + C: Copy prompt
        if (isCtrl && e.key === 'c') {
            e.preventDefault();
            if (generatedSection.style.display !== 'none') {
                copyToClipboard();
            }
        }
        
        // Ctrl/Cmd + K: Focus search
        if (isCtrl && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Escape: Close modal or dialog
        if (e.key === 'Escape') {
            if (modalOverlay.classList.contains('active') && !dialogOverlay.classList.contains('active')) {
                attemptCloseModal();
            } else if (dialogOverlay.classList.contains('active')) {
                // Close whichever dialog is open
                if (confirmationDialog.style.display !== 'none') {
                    hideConfirmationDialog();
                } else if (loadDraftDialog.style.display !== 'none') {
                    hideLoadDraftDialog();
                } else if (resetDialog.style.display !== 'none') {
                    hideResetDialog();
                } else if (document.getElementById('promptProfileDialog').style.display !== 'none') {
                    hidePromptProfileDialog();
                } else if (document.getElementById('customUrlDialog').style.display !== 'none') {
                    hideCustomUrlDialog();
                }
            } else if (document.getElementById('helpGuideModal').style.display === 'flex') {
                hideHelpGuide();
            }
        }
        
        // Ctrl/Cmd + /: Toggle help guide
        if (isCtrl && e.key === '/') {
            e.preventDefault();
            const helpGuideModal = document.getElementById('helpGuideModal');
            if (helpGuideModal.style.display === 'flex') {
                hideHelpGuide();
            } else {
                showHelpGuide();
            }
        }
        
        // Ctrl/Cmd + T: Toggle theme
        if (isCtrl && e.key === 't') {
            e.preventDefault();
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.click();
            }
        }
        
        // Ctrl/Cmd + F: Toggle fast mode
        if (isCtrl && e.key === 'f') {
            e.preventDefault();
            const fastModeToggle = document.getElementById('fastModeToggle');
            if (fastModeToggle) {
                fastModeToggle.checked = !fastModeToggle.checked;
                // Trigger change event
                fastModeToggle.dispatchEvent(new Event('change'));
                showToast(`Fast mode ${fastModeToggle.checked ? 'enabled' : 'disabled'}!`, 'success');
            }
        }
    });
}

// Show keyboard shortcut help
function showKeyboardShortcutsHelp() {
    const shortcuts = [
        { key: 'Ctrl/Cmd + Enter', action: 'Generate prompt or next step' },
        { key: 'Ctrl/Cmd + S', action: 'Save prompt as JSON' },
        { key: 'Ctrl/Cmd + C', action: 'Copy prompt to clipboard' },
        { key: 'Ctrl/Cmd + K', action: 'Focus search input' },
        { key: 'Ctrl/Cmd + /', action: 'Toggle help guide' },
        { key: 'Ctrl/Cmd + T', action: 'Toggle dark/light mode' },
        { key: 'Ctrl/Cmd + F', action: 'Toggle fast mode' },
        { key: 'Escape', action: 'Close modal/dialog' }
    ];
    
    let helpText = 'Keyboard Shortcuts:\n\n';
    shortcuts.forEach(shortcut => {
        helpText += `${shortcut.key}: ${shortcut.action}\n`;
    });
    
    alert(helpText);
}

// Add keyboard shortcuts help to help guide
function addKeyboardShortcutsToHelpGuide() {
    const helpGuideBody = document.querySelector('.help-guide-body');
    if (!helpGuideBody) return;
    
    // Check if shortcuts section already exists
    if (document.getElementById('keyboard-shortcuts-section')) return;
    
    const shortcutsSection = document.createElement('div');
    shortcutsSection.id = 'keyboard-shortcuts-section';
    shortcutsSection.className = 'help-section';
    shortcutsSection.innerHTML = `
        <div class="help-section-icon">
            <span class="material-symbols-outlined">keyboard</span>
        </div>
        <div class="help-section-content">
            <h3>Keyboard Shortcuts</h3>
            <p>Work faster with these keyboard shortcuts:</p>
            <div class="shortcuts-grid">
                <div class="shortcut-item">
                    <span class="shortcut-key">Ctrl/Cmd + Enter</span>
                    <span class="shortcut-action">Generate prompt or next step</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">Ctrl/Cmd + S</span>
                    <span class="shortcut-action">Save prompt as JSON</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">Ctrl/Cmd + C</span>
                    <span class="shortcut-action">Copy prompt to clipboard</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">Ctrl/Cmd + K</span>
                    <span class="shortcut-action">Focus search input</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">Ctrl/Cmd + /</span>
                    <span class="shortcut-action">Toggle help guide</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">Ctrl/Cmd + T</span>
                    <span class="shortcut-action">Toggle dark/light mode</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">Ctrl/Cmd + F</span>
                    <span class="shortcut-action">Toggle fast mode</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">Escape</span>
                    <span class="shortcut-action">Close modal/dialog</span>
                </div>
            </div>
            <p class="help-tip"><span class="material-symbols-outlined">lightbulb</span> <strong>Tip:</strong> Press <kbd>Ctrl</kbd> + <kbd>/</kbd> anytime to see this help!</p>
        </div>
    `;
    
    // Insert before the footer
    const helpFooter = helpGuideBody.querySelector('.help-footer');
    if (helpFooter) {
        helpFooter.parentNode.insertBefore(shortcutsSection, helpFooter);
    } else {
        helpGuideBody.appendChild(shortcutsSection);
    }
    
    // Add CSS for shortcuts grid
    const style = document.createElement('style');
    style.textContent = `
        .shortcuts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 12px;
            margin: 16px 0;
        }
        .shortcut-item {
            background: white;
            border: 2px solid var(--border);
            border-radius: 8px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .shortcut-key {
            font-family: 'Monaco', 'Courier New', monospace;
            font-weight: 700;
            color: var(--primary);
            font-size: 13px;
        }
        .shortcut-action {
            font-size: 13px;
            color: var(--dark);
        }
        kbd {
            background: var(--light);
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 2px 6px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 12px;
            box-shadow: 0 2px 0 var(--border);
        }
    `;
    document.head.appendChild(style);
}

// ===== START APP =====
init();
initializeLivePreview();
initializeAIAvatar();
pauseTipsWhenModalOpen();
initializeHelpGuide();
initializeThemeToggle();
initializeKeyboardShortcuts();
initializeExportDropdown();

// Add keyboard shortcuts to help guide after initialization
setTimeout(addKeyboardShortcutsToHelpGuide, 100);
