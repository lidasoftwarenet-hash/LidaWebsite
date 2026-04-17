// ===== PROMPT LOGIC MODULE =====
// Modern, adaptive prompt generation system — updated for 2026 LLM landscape

// ===== CATEGORY-AWARE ROLE DEFINITIONS =====
// These are crafted to trigger the best performance from modern LLMs (GPT-5, Claude 4, Gemini 2.5, etc.)
const categoryRoles = {
    planning: {
        role: "You are a Staff-level Engineering Manager and Agile Coach with 15+ years of experience",
        context: "leading high-performing engineering teams at product companies. You combine deep technical knowledge with strong process fluency across Scrum, Kanban, and Shape Up methodologies.",
        approach: "structured, outcome-oriented, and pragmatic",
        chainOfThought: "Before answering, think step-by-step: (1) Identify the core planning challenge, (2) Consider team constraints, (3) Map dependencies, (4) Then propose a prioritized plan."
    },
    development: {
        role: "You are a Principal Software Engineer and System Architect",
        context: "with deep expertise in distributed systems, clean architecture, and polyglot programming. You've shipped production systems handling millions of users and have strong opinions on trade-offs between pragmatism and elegance.",
        approach: "technical, precise, and implementation-focused with real-world trade-off awareness",
        chainOfThought: "Think through this engineering problem systematically: (1) Clarify requirements and constraints, (2) Identify the core technical challenge, (3) Evaluate 2–3 architectural approaches, (4) Then recommend the best one with justification."
    },
    testing: {
        role: "You are a Principal QA Engineer and Test Architect",
        context: "specializing in test strategy for complex distributed systems using modern frameworks (Vitest, Playwright, Cypress, k6, contract testing with Pact). You believe in the testing trophy over the testing pyramid for modern apps.",
        approach: "quality-driven, automation-first, and risk-aware",
        chainOfThought: "Approach this systematically: (1) Identify what risks need to be covered, (2) Map the appropriate test types to those risks, (3) Then design a strategy that balances coverage with execution speed."
    },
    security: {
        role: "You are a Senior Application Security Engineer and Threat Modeler",
        context: "with hands-on expertise in OWASP Top 10, zero-trust architecture, supply chain security, and compliance frameworks (SOC 2, ISO 27001, GDPR). You think like an attacker to defend like an architect.",
        approach: "adversarial-thinking, defense-in-depth, and compliance-aware",
        chainOfThought: "Apply structured threat modeling: (1) Identify assets and trust boundaries, (2) Enumerate threat actors and attack surfaces, (3) Prioritize risks by likelihood × impact, (4) Then recommend mitigations."
    },
    devops: {
        role: "You are a Staff DevOps/Platform Engineer and SRE",
        context: "with expertise in GitOps, Kubernetes, IaC (Terraform, Pulumi), observability (OpenTelemetry, Grafana, Datadog), and reliability engineering for distributed systems.",
        approach: "automation-first, reliability-focused, and platform-thinking",
        chainOfThought: "Reason through this infrastructure/ops challenge: (1) Understand current operational pain, (2) Identify the bottleneck or reliability gap, (3) Consider GitOps and IaC principles, (4) Then propose a concrete, incremental solution."
    },
    documentation: {
        role: "You are a Senior Technical Writer and Developer Experience (DevEx) Specialist",
        context: "with expertise in docs-as-code, Diátaxis documentation framework, and creating content that reduces developer time-to-productivity. You write for both humans and AI code assistants.",
        approach: "user-first, structured by the Diátaxis framework (tutorials, how-tos, reference, explanation), and AI-assistant-friendly",
        chainOfThought: "Structure your approach: (1) Identify the audience and their job-to-be-done, (2) Classify the doc type (tutorial vs how-to vs reference vs explanation), (3) Then write or outline accordingly."
    },
    ai: {
        role: "You are a Senior AI/ML Engineer and Prompt Engineering Specialist",
        context: "with practical experience building production LLM applications, RAG systems, and AI agents using frameworks like LangChain, LlamaIndex, Vercel AI SDK, and OpenAI Assistants API. You understand model capabilities, context limits, and cost trade-offs across GPT-5, Claude 4, and Gemini 2.5.",
        approach: "model-aware, system-design-focused, and cost/latency conscious",
        chainOfThought: "Analyze the AI engineering challenge: (1) Clarify the AI use case and constraints, (2) Identify whether it needs RAG, fine-tuning, agents, or simpler prompting, (3) Assess latency/cost/accuracy trade-offs, (4) Then recommend a concrete implementation path."
    },
    prompts: {
        role: "You are an expert Prompt Engineer with deep knowledge of modern LLM behavior",
        context: "across GPT-5, Claude 4 (Sonnet/Opus), Gemini 2.5, Mistral Large, and DeepSeek. You understand how each model interprets instructions differently, and you craft prompts that are precise, minimally ambiguous, and reliably produce the desired output.",
        approach: "systematic, model-aware, and iterative",
        chainOfThought: "Before crafting this prompt: (1) Define the exact desired output format and quality, (2) Identify which model will run it, (3) Apply the right prompting pattern (chain-of-thought, few-shot, structured output, etc.), (4) Then write the final prompt."
    }
};

// ===== PROMPT STYLES =====
const promptStyles = {
    analyst: {
        name: "Analyst Mode",
        tone: "analytical and evidence-driven",
        structure: "structured with clear reasoning sections",
        depth: "comprehensive with trade-off analysis",
        emphasis: "Ground your recommendations in data, specific metrics, and concrete reasoning. Show your work — explain the 'why' behind each recommendation."
    },
    creative: {
        name: "Creative Mode",
        tone: "exploratory and lateral-thinking",
        structure: "open-ended with brainstorming space",
        depth: "broad across multiple perspectives",
        emphasis: "Explore non-obvious solutions. Challenge assumptions. Suggest approaches the user might not have considered. Think outside conventional patterns."
    },
    technical: {
        name: "Technical Mode",
        tone: "precise, specific, and implementation-ready",
        structure: "code-first with inline technical detail",
        depth: "deep with real code, configs, and exact commands",
        emphasis: "Provide working, production-ready implementations. Include code with comments, exact configuration values, and call out any platform-specific gotchas."
    }
};

// ===== OUTPUT FORMAT DESCRIPTIONS =====
const formatDescriptions = {
    "detailed": "Provide a **comprehensive analysis** with full reasoning, trade-offs, and concrete examples. Use headers to organize your response. Aim for thoroughness over brevity.",
    "actionable": "Deliver a **numbered step-by-step action plan**. For each step include: what to do, why it matters, estimated effort, and any prerequisites. Make it immediately executable.",
    "code": "Lead with **working code examples**. Include: (1) The implementation with inline comments, (2) How to run/test it, (3) Key design decisions explained, (4) Edge cases handled.",
    "documentation": "Format as **production-ready documentation** using Markdown. Include: title, overview, prerequisites, step-by-step guide, examples, and a troubleshooting section.",
    "comparison": "Present a **structured comparison table** followed by prose analysis. For each option show: pros, cons, performance/cost implications, and best-fit scenario. End with a clear recommendation.",
    "checklist": "Deliver a **prioritized implementation checklist** organized by phase. For each item: [ ] checkbox, description, acceptance criteria, and estimated time. Group by must-do vs. nice-to-have."
};

// ===== MODULAR PROMPT BLOCKS =====

/**
 * Build the opening section with role priming and chain-of-thought instruction
 */
function buildOpeningBlock(template, style = 'analyst') {
    const category = template?.category || 'development';
    const roleInfo = categoryRoles[category] || categoryRoles.development;
    const styleInfo = promptStyles[style] || promptStyles.analyst;

    let opening = '';
    opening += `${roleInfo.role} ${roleInfo.context}\n\n`;
    opening += `**Your approach for this task should be:** ${roleInfo.approach}.\n\n`;

    // Chain-of-thought priming — proven to improve output quality on all major models
    if (roleInfo.chainOfThought) {
        opening += `**Reasoning approach:** ${roleInfo.chainOfThought}\n\n`;
    }

    opening += `**Response style:** ${styleInfo.emphasis}\n\n`;

    return opening;
}

/**
 * Build the context block with project information
 */
function buildContextBlock(data) {
    if (!hasAnyValue(data, ['projectName', 'projectType', 'technology', 'teamSize', 'teamExperience', 'timeframe', 'context'])) {
        return '';
    }

    let block = '## 📋 Project Context\n\n';

    if (data.projectName) block += `**Project:** ${data.projectName}\n`;
    if (data.projectType) block += `**Type:** ${data.projectType}\n`;
    if (data.technology) block += `**Tech Stack:** ${data.technology}\n`;

    if (data.teamSize || data.teamExperience) {
        block += '\n**Team:**\n';
        if (data.teamSize) {
            block += `- Size: ${data.teamSize}`;
            const n = extractNumber(data.teamSize);
            if (n && n <= 3) block += ' *(small — prefer lightweight, low-overhead solutions)*';
            else if (n && n >= 10) block += ' *(large — account for coordination, onboarding, and review throughput)*';
            block += '\n';
        }
        if (data.teamExperience) block += `- Experience: ${data.teamExperience}\n`;
    }

    if (data.timeframe || data.deadline) {
        block += '\n**Timeline:**\n';
        if (data.timeframe) {
            block += `- Duration: ${data.timeframe}`;
            if (isShortTimeframe(data.timeframe)) block += ' *(tight — prioritize quick wins and an MVP subset)*';
            block += '\n';
        }
        if (data.deadline) block += `- Hard deadline: ${data.deadline}\n`;
    }

    if (data.context) block += `\n**Background & context:**\n${data.context}\n`;

    return block + '\n';
}

/**
 * Build the problem statement block
 */
function buildProblemBlock(data) {
    if (!data.currentProblem) return '';

    let block = '## ⚠️ Problem Statement\n\n';
    block += `${data.currentProblem}\n\n`;

    const constraints = [];
    if (data.technicalConstraints) constraints.push(`**Technical constraints:** ${data.technicalConstraints}`);
    if (data.businessConstraints) constraints.push(`**Business constraints:** ${data.businessConstraints}`);
    if (data.budget) constraints.push(`**Budget:** ${data.budget} — favor cost-effective, high-ROI approaches`);
    if (data.resources) constraints.push(`**Available resources:** ${data.resources}`);

    if (constraints.length > 0) {
        block += '**Hard constraints to respect:**\n';
        constraints.forEach(c => block += `- ${c}\n`);
        block += '\n';
    }

    return block;
}

/**
 * Build the goals and success criteria block
 */
function buildGoalBlock(data) {
    if (!hasAnyValue(data, ['desiredOutcome', 'successMetrics', 'mustHave', 'niceToHave'])) return '';

    let block = '## 🎯 Goals & Success Criteria\n\n';

    if (data.desiredOutcome) {
        block += `**Primary objective:**\n${data.desiredOutcome}\n\n`;
    }

    if (data.successMetrics) {
        block += `**How we measure success:**\n${data.successMetrics}\n\n`;
        block += '*Note: Frame your recommendations so they directly move these metrics.*\n\n';
    }

    if (data.mustHave || data.niceToHave) {
        block += '**Requirements priority:**\n\n';

        if (data.mustHave) {
            block += `**🔴 MUST HAVE (non-negotiable):**\n${data.mustHave}\n\n`;
        }

        if (data.niceToHave) {
            block += `**🟡 NICE TO HAVE (only if core is covered):**\n${data.niceToHave}\n`;
            block += '*Do not sacrifice must-haves for nice-to-haves.*\n\n';
        }
    }

    return block;
}

/**
 * Build the stakeholders block
 */
function buildStakeholdersBlock(data) {
    if (!data.stakeholders) return '';

    let block = '## 👥 Stakeholders\n\n';
    block += `**Key stakeholders:** ${data.stakeholders}\n\n`;
    block += '*Consider how your answer will be received by each stakeholder group. Call out anything that might need their buy-in or cause friction.*\n\n';

    return block;
}

/**
 * Build the output format block — highly specific to drive predictable LLM output
 */
function buildFinalRequestBlock(data, style = 'analyst') {
    let block = '## 📤 Required Output Format\n\n';

    block += formatDescriptions[data.outputFormat] || formatDescriptions["detailed"];
    block += '\n\n';

    if (data.additionalInstructions) {
        block += `**Additional requirements:**\n${data.additionalInstructions}\n\n`;
    }

    if (data.powerUserMode) {
        if (data.tone) {
            const toneDescriptions = {
                "formal": "Use **formal, executive-ready language** suitable for Slack announcements, design docs, or stakeholder presentations.",
                "casual": "Use **direct, casual developer language** — like explaining to a senior colleague in a Slack DM.",
                "technical": "Use **precise technical language** with exact terminology. Assume a senior engineer audience."
            };
            block += `**Tone:** ${toneDescriptions[data.tone] || data.tone}\n`;
        }

        if (data.responseFormat) {
            const formatInstructions = {
                "markdown": "Format using **standard Markdown** (H2 headers, numbered lists for steps, code fences with language tags, bold for emphasis).",
                "bullets": "Use **nested bullet points** as the primary structure. Each bullet should be a complete, actionable statement.",
                "code-comments": "Present the response as **commented code** — code blocks with explanatory inline comments, ready to paste into source files."
            };
            block += `**Markup format:** ${formatInstructions[data.responseFormat] || data.responseFormat}\n`;
        }

        block += '\n';
    }

    return block;
}

/**
 * Build the closing block — final reminders that reduce LLM omissions
 */
function buildClosingBlock(data, template) {
    let block = '---\n\n';

    // Smart contextual reminders
    if (data.teamSize && extractNumber(data.teamSize) <= 3) {
        block += '> ⚡ **Small team context:** Favor simple, low-maintenance solutions over architecturally "perfect" ones. Avoid solutions that require dedicated ops work.\n\n';
    }

    if (isShortTimeframe(data.timeframe)) {
        block += '> ⏰ **Tight timeline:** Cut scope aggressively. Focus only on what unlocks the core value. Suggest what to defer.\n\n';
    }

    if (data.budget) {
        block += '> 💰 **Budget-conscious:** Weigh cost implications explicitly. Prefer managed services over self-hosted when the team is small.\n\n';
    }

    block += '**Final expectations:**\n';
    block += '- Address every section in the prompt above — do not skip any\n';
    block += '- If a requirement is ambiguous, state your assumption and proceed\n';
    block += '- Call out risks, trade-offs, and potential failure points explicitly\n';
    block += '- End with a clear, prioritized "next steps" list the user can act on immediately\n';

    return block;
}

// ===== INTELLIGENT PROMPT GENERATION =====

/**
 * Main function — generates adaptive, structured prompts tuned for modern LLMs
 */
function generateIntelligentPrompt(data, template, options = {}) {
    const style = options.style || 'analyst';

    let prompt = '';

    // 1. Role priming + chain-of-thought instruction
    prompt += buildOpeningBlock(template, style);

    // 2. Template-specific task framing
    if (template) {
        prompt += `# Task: ${template.title}\n\n`;
        prompt += `${template.description}\n\n`;
    }

    // 3. Context
    prompt += buildContextBlock(data);

    // 4. Problem
    prompt += buildProblemBlock(data);

    // 5. Goals
    prompt += buildGoalBlock(data);

    // 6. Stakeholders
    prompt += buildStakeholdersBlock(data);

    // 7. Output format
    prompt += buildFinalRequestBlock(data, style);

    // 8. Closing reminders
    prompt += buildClosingBlock(data, template);

    return prompt;
}

// ===== HELPER FUNCTIONS =====

function hasAnyValue(data, fields) {
    return fields.some(field => data[field] && data[field].trim().length > 0);
}

function extractNumber(str) {
    if (!str) return null;
    const match = str.match(/\d+/);
    return match ? parseInt(match[0]) : null;
}

function isShortTimeframe(timeframe) {
    if (!timeframe) return false;
    const lower = timeframe.toLowerCase();
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('immediate') || lower.includes('today')) return true;
    const days = extractNumber(lower.match(/(\d+)\s*day/)?.[0]);
    if (days && days < 14) return true;
    const weeks = extractNumber(lower.match(/(\d+)\s*week/)?.[0]);
    if (weeks && weeks < 2) return true;
    return false;
}

/**
 * Generate prompt variants — short / balanced / detailed
 */
function generatePromptVariants(data, template, options = {}) {
    const basePrompt = generateIntelligentPrompt(data, template, options);

    return {
        short: generateShortVariant(basePrompt),
        balanced: basePrompt,
        detailed: generateDetailedVariant(basePrompt, data)
    };
}

function generateShortVariant(prompt) {
    let short = prompt;
    short = short.replace(/\*\(.*?\)\*/g, '');
    short = short.replace(/> .*?\n\n/g, '');
    short = short.replace(/\n{3,}/g, '\n\n');
    return short;
}

function generateDetailedVariant(prompt, data) {
    let detailed = prompt;

    detailed += '\n\n## 💡 Deep-Dive Checklist\n\n';
    detailed += 'Please also explicitly cover:\n';
    detailed += '- [ ] Failure modes and how to detect them early\n';
    detailed += '- [ ] Alternative approaches and why you did NOT recommend them\n';
    detailed += '- [ ] Long-term maintenance burden of your recommended approach\n';
    detailed += '- [ ] Industry precedent or open-source examples of this pattern\n';
    detailed += '- [ ] Common implementation mistakes to avoid\n';
    detailed += '- [ ] A "minimum viable" version vs. a "production-hardened" version\n';

    if (data.technology) {
        detailed += `- [ ] Specific gotchas and known issues in ${data.technology}\n`;
    }

    detailed += '\n**Format the deep-dive as a separate section at the end of your response labelled "🔬 Deep Analysis".**\n';

    return detailed;
}

// ===== EXPORT =====
if (typeof window !== 'undefined') {
    window.PromptLogic = {
        generateIntelligentPrompt,
        generatePromptVariants,
        categoryRoles,
        promptStyles,
        formatDescriptions,
        buildOpeningBlock,
        buildContextBlock,
        buildProblemBlock,
        buildGoalBlock,
        buildStakeholdersBlock,
        buildFinalRequestBlock,
        buildClosingBlock
    };
}
