// ===== PROMPT LOGIC MODULE =====
// Intelligent, adaptive prompt generation system

// ===== CATEGORY-AWARE ROLE DEFINITIONS =====
const categoryRoles = {
    planning: {
        role: "You are an experienced Agile Coach and Project Manager",
        context: "with expertise in sprint planning, backlog refinement, and team velocity optimization.",
        approach: "systematic and structured"
    },
    development: {
        role: "You are a Senior Software Architect and Technical Lead",
        context: "with deep expertise in software design patterns, system architecture, and best practices.",
        approach: "technical and implementation-focused"
    },
    testing: {
        role: "You are a Quality Assurance Expert and Test Automation Specialist",
        context: "with extensive experience in testing strategies, automation frameworks, and quality metrics.",
        approach: "thorough and quality-focused"
    },
    security: {
        role: "You are a Senior Security Auditor and Cybersecurity Consultant",
        context: "with expertise in vulnerability assessment, threat modeling, and security best practices.",
        approach: "security-first and risk-aware"
    },
    devops: {
        role: "You are a DevOps Engineer and Infrastructure Architect",
        context: "with expertise in CI/CD pipelines, cloud infrastructure, and deployment automation.",
        approach: "automation-focused and reliability-oriented"
    },
    documentation: {
        role: "You are a Technical Writer and Documentation Specialist",
        context: "with expertise in creating clear, comprehensive technical documentation.",
        approach: "clear and user-focused"
    }
};

// ===== PROMPT STYLES =====
const promptStyles = {
    analyst: {
        name: "Analyst Mode",
        tone: "analytical and data-driven",
        structure: "structured with clear sections and logical flow",
        depth: "comprehensive with detailed reasoning",
        emphasis: "Focus on analysis, metrics, and evidence-based recommendations."
    },
    creative: {
        name: "Creative Mode",
        tone: "exploratory and innovative",
        structure: "open-ended with room for brainstorming",
        depth: "broad with multiple perspectives",
        emphasis: "Encourage creative thinking, alternative approaches, and innovative solutions."
    },
    technical: {
        name: "Technical Mode",
        tone: "precise and implementation-oriented",
        structure: "code-focused with technical specifications",
        depth: "detailed with code examples and architecture diagrams",
        emphasis: "Provide technical implementation details, code samples, and architectural guidance."
    }
};

// ===== MODULAR PROMPT BLOCKS =====

/**
 * Build the opening section with role and context
 */
function buildOpeningBlock(template, style = 'analyst') {
    let opening = '';
    
    // Get category-specific role
    const category = template?.category || 'development';
    const roleInfo = categoryRoles[category] || categoryRoles.development;
    
    opening += `${roleInfo.role} ${roleInfo.context}\n\n`;
    opening += `I need your help with a ${roleInfo.approach} approach to the following challenge.\n\n`;
    
    // Add style-specific guidance
    const styleInfo = promptStyles[style] || promptStyles.analyst;
    opening += `**Response Style:** ${styleInfo.emphasis}\n\n`;
    
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
    
    // Core project info
    if (data.projectName) {
        block += `**Project:** ${data.projectName}\n`;
    }
    if (data.projectType) {
        block += `**Type:** ${data.projectType}\n`;
    }
    if (data.technology) {
        block += `**Technology Stack:** ${data.technology}\n`;
    }
    
    // Team information with intelligent interpretation
    if (data.teamSize || data.teamExperience) {
        block += '\n**Team Composition:**\n';
        if (data.teamSize) {
            block += `- Size: ${data.teamSize}`;
            // Add interpretation
            const teamSizeNum = extractNumber(data.teamSize);
            if (teamSizeNum && teamSizeNum <= 3) {
                block += ' *(small team - recommend lightweight processes)*';
            } else if (teamSizeNum && teamSizeNum >= 10) {
                block += ' *(large team - consider coordination overhead)*';
            }
            block += '\n';
        }
        if (data.teamExperience) {
            block += `- Experience Level: ${data.teamExperience}\n`;
        }
    }
    
    // Timeline with urgency interpretation
    if (data.timeframe || data.deadline) {
        block += '\n**Timeline:**\n';
        if (data.timeframe) {
            block += `- Duration: ${data.timeframe}`;
            // Add interpretation
            if (isShortTimeframe(data.timeframe)) {
                block += ' *(tight timeline - prioritize MVP and quick wins)*';
            }
            block += '\n';
        }
        if (data.deadline) {
            block += `- Deadline: ${data.deadline}\n`;
        }
    }
    
    // Background context
    if (data.context) {
        block += `\n**Background:**\n${data.context}\n`;
    }
    
    return block + '\n';
}

/**
 * Build the problem statement block
 */
function buildProblemBlock(data) {
    if (!data.currentProblem) {
        return '';
    }
    
    let block = '## ⚠️ Problem Statement\n\n';
    block += `${data.currentProblem}\n\n`;
    
    // Add constraints if they exist
    const constraints = [];
    if (data.technicalConstraints) {
        constraints.push(`**Technical:** ${data.technicalConstraints}`);
    }
    if (data.businessConstraints) {
        constraints.push(`**Business:** ${data.businessConstraints}`);
    }
    if (data.budget) {
        constraints.push(`**Budget:** ${data.budget} *(consider cost-effective solutions)*`);
    }
    if (data.resources) {
        constraints.push(`**Resources:** ${data.resources}`);
    }
    
    if (constraints.length > 0) {
        block += '**Constraints to Consider:**\n';
        constraints.forEach(c => block += `- ${c}\n`);
        block += '\n';
    }
    
    return block;
}

/**
 * Build the goals and objectives block
 */
function buildGoalBlock(data) {
    if (!hasAnyValue(data, ['desiredOutcome', 'successMetrics', 'mustHave', 'niceToHave'])) {
        return '';
    }
    
    let block = '## 🎯 Goals & Success Criteria\n\n';
    
    if (data.desiredOutcome) {
        block += `**Primary Objective:**\n${data.desiredOutcome}\n\n`;
    }
    
    if (data.successMetrics) {
        block += `**Success Metrics:**\n${data.successMetrics}\n\n`;
    }
    
    // Requirements with priority
    if (data.mustHave || data.niceToHave) {
        block += '**Requirements Priority:**\n\n';
        
        if (data.mustHave) {
            block += `**🔴 CRITICAL (Must-Have):**\n${data.mustHave}\n\n`;
        }
        
        if (data.niceToHave) {
            block += `**🟡 OPTIONAL (Nice-to-Have):**\n${data.niceToHave}\n`;
            block += '*Note: Only include if time and resources permit.*\n\n';
        }
    }
    
    return block;
}

/**
 * Build the stakeholders block
 */
function buildStakeholdersBlock(data) {
    if (!data.stakeholders) {
        return '';
    }
    
    let block = '## 👥 Stakeholders & Communication\n\n';
    block += `**Key Stakeholders:** ${data.stakeholders}\n\n`;
    block += '*Please ensure recommendations consider stakeholder communication and buy-in.*\n\n';
    
    return block;
}

/**
 * Build the output format request block
 */
function buildFinalRequestBlock(data, style = 'analyst') {
    let block = '## 📤 Expected Output\n\n';
    
    // Output format
    const formatDescriptions = {
        "detailed": "Provide a **comprehensive analysis** with detailed recommendations, covering all aspects thoroughly with reasoning and examples.",
        "actionable": "Deliver a **step-by-step action plan** with clear tasks, implementation order, and estimated effort for each step.",
        "code": "Include **code examples and implementations** with technical specifics, best practices, and inline explanations.",
        "documentation": "Format as **professional documentation** with proper sections, structure, and ready-to-use content.",
        "comparison": "Present a **comparison of different approaches** with pros, cons, trade-offs, and a clear recommendation.",
        "checklist": "Break down into a **detailed checklist** with actionable items, dependencies, and completion criteria."
    };
    
    block += formatDescriptions[data.outputFormat] || formatDescriptions["detailed"];
    block += '\n\n';
    
    // Additional instructions
    if (data.additionalInstructions) {
        block += `**Additional Requirements:**\n${data.additionalInstructions}\n\n`;
    }
    
    // Power user preferences
    if (data.powerUserMode) {
        if (data.tone) {
            const toneDescriptions = {
                "formal": "Use a **formal, professional tone** suitable for executive presentations and official documentation.",
                "casual": "Use a **casual, conversational tone** that's easy to understand and approachable.",
                "technical": "Use **precise technical language** with detailed explanations suitable for experienced developers."
            };
            block += `**Tone:** ${toneDescriptions[data.tone]}\n`;
        }
        
        if (data.responseFormat) {
            const formatInstructions = {
                "markdown": "Format using **proper Markdown syntax** with headers, lists, code blocks, and emphasis.",
                "bullets": "Structure primarily as **bullet points and numbered lists** for easy scanning.",
                "code-comments": "Present as **detailed code comments** that can be directly inserted into source files."
            };
            block += `**Format:** ${formatInstructions[data.responseFormat]}\n`;
        }
        
        block += '\n';
    }
    
    return block;
}

/**
 * Build the closing block with final instructions
 */
function buildClosingBlock(data, template) {
    let block = '---\n\n';
    
    // Add context-aware closing based on data
    if (data.teamSize && extractNumber(data.teamSize) <= 3) {
        block += '**Note:** Given the small team size, please prioritize practical, lightweight solutions that don\'t require extensive overhead.\n\n';
    }
    
    if (isShortTimeframe(data.timeframe)) {
        block += '**Note:** Given the tight timeline, please focus on quick wins and MVP features that deliver immediate value.\n\n';
    }
    
    if (data.budget) {
        block += '**Note:** Please consider cost-effectiveness and ROI in your recommendations.\n\n';
    }
    
    block += '**Final Request:** Please provide a comprehensive, actionable response that addresses all points above. ';
    block += 'Focus on practical insights that can be immediately applied. ';
    block += 'Include reasoning for your recommendations and highlight any potential risks or trade-offs.\n';
    
    return block;
}

// ===== INTELLIGENT PROMPT GENERATION =====

/**
 * Main function to generate intelligent, adaptive prompts
 */
function generateIntelligentPrompt(data, template, options = {}) {
    const style = options.style || 'analyst';
    const platform = options.platform || 'chatgpt';
    
    let prompt = '';
    
    // 1. Opening with role and context
    prompt += buildOpeningBlock(template, style);
    
    // 2. Template-specific introduction
    if (template) {
        prompt += `# ${template.title}\n\n`;
        prompt += `${template.description}\n\n`;
    }
    
    // 3. Context block
    prompt += buildContextBlock(data);
    
    // 4. Problem block
    prompt += buildProblemBlock(data);
    
    // 5. Goals block
    prompt += buildGoalBlock(data);
    
    // 6. Stakeholders block
    prompt += buildStakeholdersBlock(data);
    
    // 7. Final request block
    prompt += buildFinalRequestBlock(data, style);
    
    // 8. Closing block
    prompt += buildClosingBlock(data, template);
    
    return prompt;
}

// ===== HELPER FUNCTIONS =====

/**
 * Check if any of the specified fields have values
 */
function hasAnyValue(data, fields) {
    return fields.some(field => data[field] && data[field].trim().length > 0);
}

/**
 * Extract number from string (e.g., "5 developers" -> 5)
 */
function extractNumber(str) {
    if (!str) return null;
    const match = str.match(/\d+/);
    return match ? parseInt(match[0]) : null;
}

/**
 * Determine if timeframe is short (less than 2 weeks)
 */
function isShortTimeframe(timeframe) {
    if (!timeframe) return false;
    const lower = timeframe.toLowerCase();
    
    // Check for explicit short indicators
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('immediate')) {
        return true;
    }
    
    // Check for day mentions
    const days = extractNumber(lower.match(/(\d+)\s*day/)?.[0]);
    if (days && days < 14) return true;
    
    // Check for week mentions
    const weeks = extractNumber(lower.match(/(\d+)\s*week/)?.[0]);
    if (weeks && weeks < 2) return true;
    
    return false;
}

/**
 * Generate prompt variants (short, balanced, detailed)
 */
function generatePromptVariants(data, template, options = {}) {
    const basePrompt = generateIntelligentPrompt(data, template, options);
    
    return {
        short: generateShortVariant(basePrompt),
        balanced: basePrompt,
        detailed: generateDetailedVariant(basePrompt, data)
    };
}

/**
 * Generate a shorter, more concise version
 */
function generateShortVariant(prompt) {
    // Remove optional sections and keep only essentials
    let short = prompt;
    
    // Remove notes and additional context
    short = short.replace(/\*\(.*?\)\*/g, '');
    short = short.replace(/\*Note:.*?\n/g, '');
    
    // Simplify formatting
    short = short.replace(/\n{3,}/g, '\n\n');
    
    return short;
}

/**
 * Generate a more detailed version with additional guidance
 */
function generateDetailedVariant(prompt, data) {
    let detailed = prompt;
    
    // Add additional guidance sections
    detailed += '\n\n## 💡 Additional Guidance\n\n';
    detailed += 'Please also consider:\n';
    detailed += '- Potential risks and mitigation strategies\n';
    detailed += '- Alternative approaches and their trade-offs\n';
    detailed += '- Long-term maintainability and scalability\n';
    detailed += '- Best practices and industry standards\n';
    detailed += '- Common pitfalls to avoid\n';
    
    if (data.technology) {
        detailed += `- Specific considerations for ${data.technology}\n`;
    }
    
    return detailed;
}

// ===== EXPORT =====
// Make functions available globally
if (typeof window !== 'undefined') {
    window.PromptLogic = {
        generateIntelligentPrompt,
        generatePromptVariants,
        categoryRoles,
        promptStyles,
        // Export individual block builders for flexibility
        buildOpeningBlock,
        buildContextBlock,
        buildProblemBlock,
        buildGoalBlock,
        buildStakeholdersBlock,
        buildFinalRequestBlock,
        buildClosingBlock
    };
}
