/**
 * Interview Prep Interactive Addon Tools - Data File
 * Contains paths configuration, workouts, question bank pool, mock flow, scorecards, templates, company tools, and advanced guides.
 */
(function () {
  'use strict';

  window.interviewPrepToolsData = {
    // 1. CHOOSE YOUR PATH DATA
    paths: [
      {
        name: "First job interview",
        desc: "Start with structure, confidence, and basic interview answers.",
        target: "preparation-checklist"
      },
      {
        name: "General job interview",
        desc: "Practice your story, examples, and communication.",
        target: "general-guide"
      },
      {
        name: "Backend interview",
        desc: "Focus on APIs, databases, production issues, queues, caching, and debugging.",
        target: "dev-not-only-code"
      },
      {
        name: "Full-stack interview",
        desc: "Prepare to discuss frontend, backend, API contracts, state, performance, and user flows.",
        target: "dev-not-only-code"
      },
      {
        name: "Senior developer interview",
        desc: "Show ownership, trade-offs, architecture thinking, and production judgment.",
        target: "dev-production-thinking"
      },
      {
        name: "System design interview",
        desc: "Practice requirements, data flow, scale, reliability, and trade-offs.",
        target: "dev-sys-example"
      },
      {
        name: "AI-focused interview",
        desc: "Prepare to discuss AI tools, agents, vector search, embeddings, validation, and responsible usage.",
        target: "dev-ai-guidelines"
      }
    ],

    // 2. DAILY WORKOUTS
    dailyWorkouts: [
      {
        category: "Behavioral",
        title: "Production Issue Story",
        question: "Tell me about a time you made a mistake or encountered a critical issue in production.",
        timeLimit: "15 Minutes",
        focusPoints: [
          "Explain the technical failure briefly and objectively.",
          "Describe how you took ownership of the mitigation.",
          "Focus on the post-mortem: what safeguards did you put in place?"
        ],
        mistakeToAvoid: "Blaming another team member or downplaying the business impact of the outage.",
        strongAnswerShouldInclude: [
          "Timeline of the incident and how it was discovered.",
          "Specific mitigation steps you personally executed.",
          "Long-term fixes (e.g. better monitoring, circuit breakers, CI validation)."
        ]
      },
      {
        category: "General",
        title: "Tell Me About Yourself",
        question: "Walk me through your professional background and highlight why you are a fit for this role.",
        timeLimit: "10 Minutes",
        focusPoints: [
          "Follow the Present-Past-Strength-Future framework.",
          "Keep the explanation under 2 minutes.",
          "Connect your strength directly to the requirements of the job description."
        ],
        mistakeToAvoid: "Reciting your entire resume chronologically or talking about non-professional history.",
        strongAnswerShouldInclude: [
          "Your current role and stack.",
          "One major accomplishment from a previous project.",
          "Clear direction for why this target role is the logical next step."
        ]
      },
      {
        category: "System Design",
        title: "Notification System",
        question: "Design a notification service that sends email, SMS, and push notifications to millions of users daily.",
        timeLimit: "25 Minutes",
        focusPoints: [
          "Clarify peak traffic requirements and delivery guarantees (e.g., at-least-once).",
          "Identify downstream service rate-limiting or provider failures.",
          "Discuss message queues, retries, and deduplication."
        ],
        mistakeToAvoid: "Jumping directly to naming third-party SaaS APIs without discussing system internals first.",
        strongAnswerShouldInclude: [
          "High-level block diagram showing queues (Kafka/RabbitMQ) and worker nodes.",
          "Strategies for user preference stores and database caching.",
          "Idempotency keys to avoid duplicate notifications."
        ]
      },
      {
        category: "AI",
        title: "Using AI Tools as a Developer",
        question: "How do you integrate LLM assistance into your daily software development workflow?",
        timeLimit: "12 Minutes",
        focusPoints: [
          "Highlight how you maintain code ownership and validation.",
          "Explain how you prevent security leaks and copyright issues.",
          "Show how you use AI for bootstrapping, boilerplates, or writing test assertions."
        ],
        mistakeToAvoid: "Claiming you never use AI tools, or admitting that you copy-paste generated code blindly.",
        strongAnswerShouldInclude: [
          "A description of how you verify generated code (local testing, peer reviews).",
          "Using AI as a technical brainstorming partner or documentation explorer.",
          "Adherence to company policies on code uploads."
        ]
      },
      {
        category: "Backend",
        title: "Slow Endpoint Resolution",
        question: "A search endpoint is taking over 3 seconds to respond. How do you go about diagnosing and solving it?",
        timeLimit: "18 Minutes",
        focusPoints: [
          "Walk through diagnostics: tracing requests, database queries, and code profiling.",
          "Suggest multiple bottleneck causes (indexing, network payload, unoptimized joins).",
          "Describe caching and pagination policies."
        ],
        mistakeToAvoid: "Instantly suggesting 'add redis cache' before identifying why the query itself is slow.",
        strongAnswerShouldInclude: [
          "Explaining database profiling tools (e.g. EXPLAIN ANALYZE).",
          "Adding missing composite indexes or rewriting queries.",
          "Using async processing or client-side debouncing to reduce unnecessary load."
        ]
      },
      {
        category: "Behavioral",
        title: "Disagreement With Teammate",
        question: "Describe a situation where you had a strong technical disagreement with another engineer. How did you handle it?",
        timeLimit: "15 Minutes",
        focusPoints: [
          "Show mutual respect and empathy for their counter-argument.",
          "Explain the objective trade-off evaluation criteria you used.",
          "Highlight the collaborative resolution path."
        ],
        mistakeToAvoid: "Portraying yourself as completely right and the other developer as incompetent.",
        strongAnswerShouldInclude: [
          "The core technical issue (e.g., monolith vs. microservices, library choices).",
          "How you gathered data or built prototypes to evaluate solutions objectively.",
          "Your willingness to commit and execute even if the final decision went their way."
        ]
      },
      {
        category: "Coding",
        title: "Two Sum Problem",
        question: "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
        timeLimit: "15 Minutes",
        focusPoints: [
          "State the brute-force time complexity first (O(N^2)).",
          "Introduce a hash map to reduce complexity to O(N) time and O(N) space.",
          "Handle array boundary cases and duplicate values."
        ],
        mistakeToAvoid: "Writing nested loops immediately without suggesting optimal search lookup indices.",
        strongAnswerShouldInclude: [
          "Dry-running the hash map logic using an example input.",
          "Handling missing output conditions gracefully.",
          "Explaining spatial trade-offs compared to the brute force method."
        ]
      },
      {
        category: "Senior",
        title: "Technical Trade-off Decision",
        question: "Tell me about a time you chose a quick solution to meet a deadline, knowing it created technical debt.",
        timeLimit: "20 Minutes",
        focusPoints: [
          "Explain the business context that made the deadline critical.",
          "Describe how you documented and tracked the technical debt.",
          "Explain the eventual resolution or refactoring plan."
        ],
        mistakeToAvoid: "Admitting you wrote low-quality code without capturing it, or expressing disregard for codebase health.",
        strongAnswerShouldInclude: [
          "The commercial reason behind the rush (e.g., client demo, launch date).",
          "Specific trade-offs accepted (e.g., lack of automated test coverage, simplified DB schema).",
          "How the debt was prioritized, tracked in Jira, and eventually resolved."
        ]
      }
    ],

    // 3. CONSOLIDATED QUESTION BANK POOL
    questionGenerator: [
      {
        category: "General",
        question: "Why do you want to join this company?",
        followUp: "What specific project or product area here excites you most?",
        strongAnswer: "Demonstrates research on the company's recent announcements, values, and engineering challenges. Links your background directly to their mission.",
        mistakeToAvoid: "Giving a generic response ('You seem like a great place to work') without naming specific aspects of their product or team."
      },
      {
        category: "General",
        question: "What is your biggest professional weakness?",
        followUp: "Can you give a recent example of how this weakness impacted you and what you did?",
        strongAnswer: "Discusses a genuine skill gap or professional habit you are working on, showing active steps, tools, or feedback cycles you use to improve.",
        mistakeToAvoid: "Using fake weaknesses like 'I work too hard' or claiming you have no weaknesses."
      },
      {
        category: "Behavioral",
        question: "Tell me about a time you failed to meet a project deadline.",
        followUp: "How did you communicate the delay to stakeholders?",
        strongAnswer: "Owns the failure, details the project bottlenecks, explains early mitigation/communication, and focuses on what process changes were made to prevent recurrence.",
        mistakeToAvoid: "Blaming external factors or claiming you've never missed a deadline."
      },
      {
        category: "Behavioral",
        question: "Describe a time you had to deliver bad news to a manager or stakeholder.",
        followUp: "What was their reaction, and how did you manage the follow-up work?",
        strongAnswer: "Shows proactive communication, presenting the problem alongside potential solutions, and taking accountability for the recovery plan.",
        mistakeToAvoid: "Hiding the problem until the last minute or showing lack of ownership."
      },
      {
        category: "Coding",
        question: "Write an algorithm to reverse a linked list.",
        followUp: "Can you do it both iteratively and recursively?",
        strongAnswer: "Draws out node reference modifications, keeps track of previous, current, and next nodes, and analyzes O(N) time and O(1) space complexity.",
        mistakeToAvoid: "Losing pointer references during reference manipulation, leading to memory leaks or loops."
      },
      {
        category: "Coding",
        question: "Determine if a string contains balanced parentheses.",
        followUp: "How does your solution scale when adding brackets and braces?",
        strongAnswer: "Utilizes a stack data structure to push opening brackets and match them against closing brackets. Time complexity is O(N), space O(N).",
        mistakeToAvoid: "Using simple integer counters, which fails to track the correct ordering of mixed bracket types."
      },
      {
        category: "Backend",
        question: "How do you design database schema indexes for optimal search query performance?",
        followUp: "When can indexing slow down your application instead of accelerating it?",
        strongAnswer: "Analyzes query filters, discusses B-Tree vs. Hash indexes, covers composite index order, and cautions against write overhead on high-frequency insertion tables.",
        mistakeToAvoid: "Suggesting indexing every column on the database table indiscriminately."
      },
      {
        category: "Backend",
        question: "Explain the difference between optimistic and pessimistic locking in databases.",
        followUp: "In what scenarios would you choose one over the other?",
        strongAnswer: "Optimistic uses version checks (best for low contention), pessimistic blocks resources (best for high conflict). Discusses trade-offs in API latency and UX.",
        mistakeToAvoid: "Confusing database lock isolation levels with application-level mutex concurrency."
      },
      {
        category: "Full-stack",
        question: "How do you manage client-side state synchronization with a backend database?",
        followUp: "How do you handle offline sync conflict resolution?",
        strongAnswer: "Discusses caching policies (e.g. React Query/SWR), optimistic UI updates, background polling, WebSockets for push notifications, and clear API boundaries.",
        mistakeToAvoid: "Fetching large collections repeatedly on every user action or ignoring loading/error UI states."
      },
      {
        category: "System Design",
        question: "How would you design a real-time collaborative document editor (like Google Docs)?",
        followUp: "How do you choose between Operational Transformation (OT) and CRDTs?",
        strongAnswer: "Discusses WebSockets, concurrency resolution models (OT/CRDT), document partitioning, cache stores (Redis), and message routing layers.",
        mistakeToAvoid: "Treating the design as a simple CRUD database application without discussing conflicts or delta synchronization."
      },
      {
        category: "System Design",
        question: "How do you build a highly reliable rate limiter for a public API gateway?",
        followUp: "Which algorithm would you select: Token Bucket, Leaking Bucket, or Sliding Window Log?",
        strongAnswer: "Discusses rate-limiting algorithms, middleware placement, distributed stores (Redis for counter tracking), and returning appropriate HTTP 429 response headers.",
        mistakeToAvoid: "Storing rate limits in memory on a multi-instance stateless application server."
      },
      {
        category: "AI",
        question: "What are the common causes of LLM hallucination and how do you mitigate them in system architecture?",
        followUp: "What evaluation frameworks would you use to verify LLM response quality?",
        strongAnswer: "Discusses retrieval-augmented generation (RAG), prompt structuring, temperature controls, context length management, validation schema layers, and guarding rails.",
        mistakeToAvoid: "Assuming that fine-tuning or adding more raw prompts is the only solution to hallucination issues."
      },
      {
        category: "Production",
        question: "How do you set up an effective alerting and monitoring system for high-scale microservices?",
        followUp: "How do you prevent developer 'alert fatigue'?",
        strongAnswer: "Distinguishes between key system metrics (Latency, Traffic, Errors, Saturation) and business KPIs. Focuses on actionable alerts with playbooks and clear thresholds.",
        mistakeToAvoid: "Routing spam warning logs directly to priority pager alerts."
      },
      {
        category: "Leadership",
        question: "How do you handle a junior team member who is consistently underperforming?",
        followUp: "At what point do you escalate the issue to HR or formal action?",
        strongAnswer: "Begins with empathy, seeks to identify root causes (personal, skills, alignment), sets clear actionable milestones (1-on-1s), provides prompt feedback, and maintains documentation.",
        mistakeToAvoid: "Publicly criticizing the engineer or jumping straight to disciplinary action without guidance."
      }
    ],

    // 4. MINI MOCK INTERVIEW MODE DATA
    mockInterviewFlows: [
      {
        type: "Opening",
        question: "Tell me about yourself.",
        timeLimit: 60,
        strongAnswer: "Present role, relevant experience, ownership, main strength, and next role direction.",
        mistakeToAvoid: "Do not tell your full life story."
      },
      {
        type: "Behavioral",
        question: "Tell me about a time you handled a disagreement with another developer.",
        timeLimit: 90,
        strongAnswer: "Context, disagreement, your action, collaboration, decision, result, and lesson.",
        mistakeToAvoid: "Do not blame the other person."
      },
      {
        type: "Technical",
        question: "How would you debug high latency in production?",
        timeLimit: 120,
        strongAnswer: "Metrics, traces, logs, recent deployment, DB, external service, bottleneck isolation, and validation.",
        mistakeToAvoid: "Do not say only \"I would check logs.\""
      },
      {
        type: "System Design",
        question: "Design a notification system.",
        timeLimit: 180,
        strongAnswer: "Requirements, channels, user preferences, queue, workers, retry policy, idempotency, status tracking, monitoring.",
        mistakeToAvoid: "Do not start with tool names."
      },
      {
        type: "Candidate Questions",
        question: "What would you ask the interviewer at the end?",
        timeLimit: 60,
        strongAnswer: "Team structure, expectations, deployment, ownership, technical debt, roadmap, and success criteria.",
        mistakeToAvoid: "Do not say \"I have no questions.\""
      }
    ],

    // 5. SCORECARD SIGNALS
    scorecardSignals: [
      {
        name: "Clarity",
        question: "Was the answer easy to follow?"
      },
      {
        name: "Ownership",
        question: "Did I explain what I personally did?"
      },
      {
        name: "Structure",
        question: "Did I answer in a clear order?"
      },
      {
        name: "Technical Depth",
        question: "Did I explain trade-offs, edge cases, or technical decisions?"
      },
      {
        name: "Production Thinking",
        question: "Did I mention real-world behavior like monitoring, reliability, failure cases, or debugging?"
      },
      {
        name: "Learning",
        question: "Did I explain what changed or improved after the situation?"
      }
    ],

    // 6. ANSWER BUILDERS TEMPLATES
    answerBuilders: [
      {
        id: "tell-me-about-yourself",
        title: "Tell me about yourself.",
        fields: [
          { key: "role", label: "Current role", placeholder: "e.g., Senior Full-stack Engineer" },
          { key: "experience", label: "Main experience", placeholder: "e.g., 5 years building scalable SaaS applications" },
          { key: "projects", label: "Systems or projects you worked on", placeholder: "e.g., a real-time analytics dashboard and user onboarding flows" },
          { key: "strength", label: "Main strength", placeholder: "e.g., resolving performance bottlenecks and micro-frontends" },
          { key: "future", label: "What you are looking for next", placeholder: "e.g., a collaborative team where I can own system architecture" }
        ],
        template: "I am a [role] with experience in [experience]. In my recent work, I focused on [projects]. One of my strengths is [strength]. For my next role, I am looking for [future]."
      },
      {
        id: "production-issue",
        title: "Tell me about a production issue you solved.",
        fields: [
          { key: "whatHappened", label: "What happened", placeholder: "e.g., database connection pool exhaustion triggered a service outage" },
          { key: "responsibility", label: "What was your responsibility", placeholder: "e.g., mitigating the immediate failure and writing the post-mortem" },
          { key: "whatChecked", label: "What you checked", placeholder: "e.g., APM memory usage traces and long-running DB queries" },
          { key: "whatFixed", label: "What you fixed", placeholder: "e.g., optimized DB connection pooling limits and added indexes" },
          { key: "whatChanged", label: "What changed after", placeholder: "e.g., API latency stabilized and connection warnings dropped to zero" }
        ],
        template: "In one situation, [whatHappened]. My responsibility was [responsibility]. I checked [whatChecked], found the issue, and fixed it by [whatFixed]. After that, [whatChanged]."
      },
      {
        id: "role-interest",
        title: "Why are you interested in this role?",
        fields: [
          { key: "companyInterest", label: "What interests you about the company", placeholder: "e.g., your focus on developer productivity tools" },
          { key: "roleInterest", label: "What interests you about the role", placeholder: "e.g., building distributed event-driven systems at scale" },
          { key: "experienceConnect", label: "Which experience connects to it", placeholder: "e.g., my 3 years working with Node.js and Kafka pipelines" },
          { key: "contribution", label: "What you want to contribute", placeholder: "e.g., optimization strategies to reduce messaging latency" }
        ],
        template: "I am interested in this role because [companyInterest] and because the role includes [roleInterest]. My experience with [experienceConnect] connects well to this, and I believe I can contribute by [contribution]."
      }
    ],

    // 7. AFTER INTERVIEW NOTES TEMPLATE
    notesTemplate: 
`Company: 
Role: 
Date: 
Interviewers: 
Questions they asked:
- 

Questions I answered well:
- 

Questions I struggled with:
- 

Technical topics to review:
- 

Red flags:
- 

Green flags:
- 

Next step:
- 

Follow-up message needed: [Yes/No]`,

    // 8. FOLLOW UP EMAIL TEMPLATE
    followUpEmailTemplate: {
      template: "Hi [interviewerName],\n\nThank you for your time today. I enjoyed learning more about the role and the team.\n\nThe conversation made me even more interested in the opportunity, especially the parts related to [specificTopic].\n\nPlease let me know if you need anything else from my side.\n\nBest,\n[yourName]"
    },

    // 9. INTERVIEW TOMORROW REVIEW CARDS
    tomorrowCards: [
      {
        title: "Prepare your opening pitch",
        text: "Practice your \"Tell me about yourself\" answer out loud once or twice."
      },
      {
        title: "Review two technical projects",
        text: "Be ready to explain what you built, why it mattered, what you personally did, and what trade-offs existed."
      },
      {
        title: "Prepare three behavioral stories",
        text: "Prepare one story about conflict, one about pressure, and one about a mistake or learning moment."
      },
      {
        title: "Review the company product",
        text: "Understand what the company sells, who the users are, and why the product matters."
      },
      {
        title: "Prepare five questions",
        text: "Ask about team structure, technical ownership, deployment, roadmap, and success expectations."
      },
      {
        title: "Do not over-study",
        text: "Review your structure, then rest. A tired candidate usually communicates worse."
      }
    ],

    // 10. RED FLAGS & GREEN FLAGS DATA
    flags: {
      green: [
        "The interviewer explains the role clearly.",
        "The team can explain how they deploy.",
        "They talk honestly about technical debt.",
        "They describe onboarding.",
        "They allow questions.",
        "They care about testing and production ownership.",
        "They can explain what success looks like after 3 to 6 months.",
        "They explain how code reviews work.",
        "They discuss trade-offs instead of pretending everything is perfect.",
        "They respect your questions and time."
      ],
      red: [
        "They cannot explain what success looks like.",
        "The process feels chaotic.",
        "They avoid questions about workload.",
        "They say \"we are like a family\" too much.",
        "They expect senior ownership but describe junior-level salary.",
        "They have no clear code review or deployment process.",
        "They avoid talking about technical debt.",
        "The role sounds very different from the job description.",
        "They pressure you without explaining the process.",
        "They give vague answers about production responsibility."
      ]
    },

    // 11. DEVELOPER FLASHCARDS DATA
    flashcards: [
      {
        category: "Backend",
        front: "What is idempotency?",
        back: "An operation is idempotent when running it multiple times has the same effect as running it once. It matters in retries, payments, APIs, queues, and distributed systems."
      },
      {
        category: "Backend",
        front: "Why is cache invalidation difficult?",
        back: "Because cached data can become stale, keys may not represent all dependencies, and distributed systems may update data in different places at different times."
      },
      {
        category: "System Design",
        front: "What is rate limiting?",
        back: "Rate limiting controls how many requests a user or system can make in a period of time. It protects systems from abuse, overload, and unexpected spikes."
      },
      {
        category: "Messaging",
        front: "What is a dead-letter queue?",
        back: "A dead-letter queue stores messages that could not be processed after retries. It helps investigate failures without blocking the main processing flow."
      },
      {
        category: "Database",
        front: "Why do database indexes improve reads?",
        back: "Indexes help the database find rows faster without scanning the full table. The trade-off is extra storage and slower writes."
      },
      {
        category: "API",
        front: "Why do APIs use pagination?",
        back: "Pagination prevents returning too much data at once. It improves performance, reduces payload size, and makes APIs easier to scale."
      },
      {
        category: "Production",
        front: "Why are timeouts important?",
        back: "Timeouts prevent a request from waiting forever. They help services fail fast and protect threads, connections, and user experience."
      },
      {
        category: "Production",
        front: "What is the risk of retries?",
        back: "Retries can cause duplicate actions, traffic spikes, and cascading failures if not designed carefully. Idempotency and backoff are important."
      },
      {
        category: "Production",
        front: "What is a circuit breaker?",
        back: "A circuit breaker stops calling a failing dependency for a period of time. It helps prevent cascading failures and gives the dependency time to recover."
      },
      {
        category: "Production",
        front: "What is observability?",
        back: "Observability is the ability to understand system behavior using logs, metrics, traces, dashboards, and alerts."
      },
      {
        category: "AI",
        front: "What is vector search?",
        back: "Vector search finds items based on semantic similarity rather than exact keyword matches. It is often used with embeddings in AI applications."
      },
      {
        category: "AI",
        front: "What are embeddings?",
        back: "Embeddings are numerical representations of text, images, or other data that capture meaning and allow similarity comparison."
      }
    ],

    // 12. EXPLAIN IT BETTER EXAMPLES
    explainBetter: [
      {
        weak: "I used Kafka.",
        better: "We used Kafka because we needed asynchronous processing, retry support, and the ability to handle traffic spikes without blocking the main request flow."
      },
      {
        weak: "I fixed a bug.",
        better: "I reproduced the issue, checked logs and traces, found that the failure happened only for a specific input, added a test, fixed the validation logic, and monitored the release after deployment."
      },
      {
        weak: "I added cache.",
        better: "I added cache only after confirming the bottleneck was repeated reads for data that did not change often. I also made sure the cache key included all fields that affected the response."
      },
      {
        weak: "I worked on microservices.",
        better: "I worked on microservices that communicated through APIs and asynchronous events. I had to think about failures, retries, observability, and ownership boundaries."
      },
      {
        weak: "I used AI tools.",
        better: "I used AI tools to speed up research and draft code, but I reviewed the output, tested edge cases, checked security implications, and adapted it to our architecture."
      }
    ],

    // 13. QUESTIONS BY LEVEL
    questionsByLevel: {
      junior: {
        listenFor: "fundamentals and learning ability",
        questions: [
          "What is the difference between List and Set?",
          "What is an HTTP status code?",
          "What is a REST API?",
          "What is the difference between GET and POST?",
          "What is a database index?"
        ]
      },
      mid: {
        listenFor: "independence and practical delivery",
        questions: [
          "How would you design a REST API for orders?",
          "How would you handle validation and error responses?",
          "How would you debug a slow API?",
          "When would you use a queue?",
          "How do you test a service?"
        ]
      },
      senior: {
        listenFor: "ownership, trade-offs, production judgment",
        questions: [
          "How would you debug intermittent latency in a distributed system?",
          "How do you choose between cache and query optimization?",
          "How would you design a reliable notification system?",
          "How do you handle retries safely?",
          "How do you monitor production services?"
        ]
      },
      lead: {
        listenFor: "decision making, communication, team influence",
        questions: [
          "How do you decide between speed of delivery and long-term maintainability?",
          "How do you guide a team through a technical disagreement?",
          "How do you evaluate architecture trade-offs?",
          "How do you reduce technical debt without blocking product delivery?",
          "How do you set engineering standards for a team?"
        ]
      }
    },

    // 14. AI INTERVIEW PREP DATA
    aiPrep: {
      title: "AI Interview Prep: Use LLMs to Prepare Smarter",
      subtitle: "LLMs can help you research companies, understand job descriptions, practice answers, simulate interviews, improve technical explanations, and prepare stronger questions. The goal is not to fake an interview. The goal is to prepare better, think clearer, and communicate with more confidence.",
      callout: "Use AI before the interview, not as a hidden real-time answer machine during the interview. Recruiters increasingly notice robotic answers, long pauses, or candidates reading from another screen. AI should help you prepare, not replace your thinking.",
      
      capabilities: [
        {
          title: "Analyze Job Descriptions",
          desc: "Extract key technologies, core challenges, and soft skills required by the employer so you know what to focus on."
        },
        {
          title: "Simulate Mock Interviews",
          desc: "Roleplay with an LLM playing the interviewer, asking follow-up questions based on your background and the role."
        },
        {
          title: "Critique and Refine Answers",
          desc: "Input your STAR behavioral drafts and get immediate feedback on clarity, impact, technical depth, and metrics."
        },
        {
          title: "Explain Complex Concepts",
          desc: "Have the model explain complex system designs, concurrency issues, or database locking algorithms at different difficulty tiers."
        }
      ],

      categoriesIntro: "The AI tool landscape changes quickly. New tools appear often, features change, and pricing changes. Use this list as a starting point, then search for updated options before relying on any specific tool.",
      categories: [
        {
          title: "General Chat LLMs",
          tools: ["ChatGPT", "Claude", "Gemini", "Microsoft Copilot"],
          useCases: [
            "Analyze job descriptions",
            "Build answer drafts",
            "Practice behavioral questions",
            "Simulate mock interviews",
            "Improve clarity and tone",
            "Summarize company research",
            "Generate follow-up questions"
          ],
          notes: "These are flexible tools. They are usually the best starting point because you can give them your own context and create your own preparation flow."
        },
        {
          title: "AI Mock Interview Tools",
          tools: ["Interviewing.io AI Interviewer", "Final Round AI", "InterviewBuddy", "Instant Interview", "Big Interview", "AMA Interview"],
          useCases: [
            "Mock interview practice",
            "Voice practice",
            "Interview-style feedback",
            "Confidence building",
            "Behavioral practice",
            "Technical interview simulation"
          ],
          notes: "Use these tools for practice before the real interview. Be careful with any product that markets itself as a hidden live interview assistant."
        },
        {
          title: "Coding Interview Practice",
          tools: ["LeetCode", "HackerRank", "CodeSignal", "Interviewing.io", "Pramp", "NeetCode", "Exponent"],
          useCases: [
            "Algorithms",
            "Data structures",
            "Coding rounds",
            "System design practice",
            "Peer mock interviews",
            "Timed technical practice"
          ],
          notes: "For developers, combine coding platforms with an LLM. The platform gives problems and structure. The LLM helps explain mistakes, compare solutions, and create follow-up questions."
        },
        {
          title: "Company and Market Research",
          tools: ["Gemini Deep Research", "ChatGPT Deep Research", "Perplexity", "Google News", "LinkedIn", "Glassdoor", "Levels.fyi", "Crunchbase"],
          useCases: [
            "Company background",
            "Recent news",
            "Funding",
            "Layoffs",
            "Interview process",
            "Salary range",
            "Role level",
            "Company structure"
          ],
          notes: "Always verify important information with original sources. AI summaries can miss context or be outdated."
        },
        {
          title: "Resume and Story Preparation",
          tools: ["ChatGPT", "Claude", "Gemini", "Teal", "Careerflow", "Rezi"],
          useCases: [
            "Resume tailoring",
            "LinkedIn profile review",
            "STAR story building",
            "Cover letter drafts",
            "Role matching",
            "Keyword extraction"
          ],
          notes: "Do not let AI make your story generic. Your examples should still sound like you and include real details."
        },
        {
          title: "AI Coding Assistants",
          tools: ["Claude Code", "Cursor", "GitHub Copilot", "Windsurf", "Codeium"],
          useCases: [
            "Review code examples",
            "Practice refactoring explanations",
            "Generate test cases",
            "Explain unfamiliar code",
            "Prepare project walkthroughs",
            "Compare implementation approaches"
          ],
          notes: "For interview prep, use coding assistants to understand code and practice explanations. Do not rely on them to answer live interview questions for you."
        }
      ],

      workflowIntro: "A strong AI-assisted preparation flow should move from research to practice to feedback.",
      workflow: [
        {
          step: 1,
          title: "Give AI the Context",
          text: "Start by giving the LLM the job description, your resume or experience summary, the company name, and the role level.",
          prompt: "I am preparing for a [role] interview at [company]. Here is the job description and my experience summary. Analyze the match and tell me what I should prepare."
        },
        {
          step: 2,
          title: "Extract the Interview Map",
          text: "Ask AI to identify likely interview stages and topics.",
          prompt: "Based on this role, what interview rounds should I expect? Separate the topics into recruiter, behavioral, coding, system design, and hiring manager questions."
        },
        {
          step: 3,
          title: "Build Your Story Bank",
          text: "Prepare reusable stories for ownership, conflict, production issues, technical decisions, learning, and impact.",
          prompt: "Help me build five STAR stories from my experience: one about conflict, one about production issue, one about technical trade-off, one about learning fast, and one about impact."
        },
        {
          step: 4,
          title: "Practice Out Loud",
          text: "Use AI as an interviewer. It should ask one question at a time and wait for your answer.",
          prompt: "Act as a technical interviewer. Ask me one question at a time. Wait for my answer. Then give feedback on clarity, structure, technical depth, and confidence."
        },
        {
          step: 5,
          title: "Improve the Answer",
          text: "Ask AI to rewrite your answer in a stronger but still natural voice.",
          prompt: "Here is my answer. Make it clearer, shorter, and more structured. Keep it natural and do not make it sound robotic."
        },
        {
          step: 6,
          title: "Prepare Follow-Up Questions",
          text: "Ask AI to generate smart questions for the interviewer.",
          prompt: "Generate 10 smart questions I can ask the interviewer about the team, architecture, deployment process, ownership, technical debt, and success expectations."
        }
      ],

      prompts: [
        {
          title: "Analyze a Job Description",
          bestFor: "Understanding what to prepare",
          promptText: "I am preparing for a job interview for this role:\n\n[Paste job description]\n\nMy background:\n[Paste short experience summary]\n\nAnalyze the job description and return:\n\n1. The top responsibilities\n2. The most important technical skills\n3. The seniority signals\n4. Likely interview questions\n5. Gaps I should prepare for\n6. Stories from my experience that I should highlight\n7. Smart questions I should ask the interviewer"
        },
        {
          title: "Create a Mock Interview",
          bestFor: "Realistic practice",
          promptText: "Act as an interviewer for a [role] position at a [company type] company.\n\nRules:\n\n1. Ask one question at a time.\n2. Wait for my answer.\n3. After each answer, score me from 1 to 5 on clarity, structure, relevance, and confidence.\n4. Give specific feedback.\n5. Ask a follow-up question like a real interviewer.\n6. Do not give me the perfect answer immediately unless I ask for it.\n\nStart with \"Tell me about yourself.\""
        },
        {
          title: "Improve My Answer",
          bestFor: "Making answers clearer",
          promptText: "Here is my interview answer:\n\n[Paste answer]\n\nImprove it without making it sound fake.\nMake it:\n\n1. Clearer\n2. Shorter\n3. More structured\n4. More specific\n5. More confident\n6. Less robotic\n\nAlso explain what was weak in my original answer."
        },
        {
          title: "Build STAR Stories",
          bestFor: "Behavioral interviews",
          promptText: "Help me prepare behavioral interview stories using the STAR method.\n\nMy raw notes:\n[Paste notes]\n\nCreate 5 stories:\n\n1. Conflict or disagreement\n2. Production issue or difficult problem\n3. Mistake and learning\n4. Working under pressure\n5. Technical decision or trade-off\n\nFor each story, return:\n\n* Situation\n* Task\n* Action\n* Result\n* What I learned\n* A 60-second spoken version"
        },
        {
          title: "Prepare for a Technical Project Walkthrough",
          bestFor: "Software developers",
          promptText: "I need to explain this project in a software developer interview:\n\nProject:\n[Describe project]\n\nHelp me prepare:\n\n1. A short 60-second explanation\n2. Architecture overview\n3. My personal contribution\n4. Main technical challenges\n5. Trade-offs\n6. Production concerns\n7. What I would improve today\n8. Possible follow-up questions the interviewer may ask"
        },
        {
          title: "System Design Practice",
          bestFor: "Backend and senior interviews",
          promptText: "Act as a system design interviewer.\n\nGive me a system design question suitable for a [level] software developer.\n\nAfter I answer, evaluate:\n\n1. Requirements clarification\n2. API design\n3. Data model\n4. Scalability\n5. Reliability\n6. Observability\n7. Trade-offs\n8. Communication\n\nAsk follow-up questions and challenge my assumptions."
        },
        {
          title: "AI Usage Interview Answer",
          bestFor: "Modern developer interviews",
          promptText: "Help me answer this interview question:\n\n\"How do you use AI tools as a developer?\"\n\nI want the answer to sound responsible and practical.\nInclude:\n\n1. Productivity\n2. Research\n3. Code review\n4. Testing\n5. Security\n6. Architecture fit\n7. Product AI opportunities like agents, vector search, embeddings, and token efficiency\n8. A clear statement that I do not blindly trust AI-generated code"
        },
        {
          title: "Company Research",
          bestFor: "Before any interview",
          promptText: "I am interviewing with [company] for [role].\n\nCreate a company research brief:\n\n1. What the company does\n2. Main products\n3. Customers or market\n4. Recent news\n5. Possible risks\n6. Technologies likely relevant to the role\n7. Interview topics I should prepare\n8. Questions I should ask\n9. Red flags to watch for\n10. How my experience may connect to the role\n\nImportant:\nTell me what information should be verified from original sources."
        },
        {
          title: "Turn Weak Answer Into Strong Answer",
          bestFor: "Practicing communication",
          promptText: "Here is a weak interview answer:\n\n[Paste answer]\n\nRewrite it into a stronger answer.\n\nRules:\n\n1. Keep it natural.\n2. Do not invent fake experience.\n3. Add structure.\n4. Add ownership.\n5. Add measurable or concrete details only if I provided them.\n6. Add a short explanation of why the new answer is stronger."
        },
        {
          title: "Post-Interview Review",
          bestFor: "After the interview",
          promptText: "I just finished an interview.\n\nHere are my notes:\n[Paste notes]\n\nHelp me review:\n\n1. What went well\n2. What sounded weak\n3. Questions I should prepare better next time\n4. Technical topics to review\n5. Follow-up message draft\n6. Red flags or green flags from the company\n7. Recommended next preparation steps"
        }
      ],

      devPrepTipsIntro: "For software developers, AI prep is most useful when it helps you explain your engineering thinking, not just memorize answers.",
      devPrepTips: [
        {
          title: "Explain Your Projects Better",
          text: "Ask AI to help turn raw project notes into a clear explanation: problem, architecture, your contribution, trade-offs, production impact, and lessons learned."
        },
        {
          title: "Practice Debugging Scenarios",
          text: "Ask AI to generate production debugging scenarios around latency, errors, memory, database queries, queues, retries, and external services."
        },
        {
          title: "Review Code Quality",
          text: "Paste a small code example and ask AI to review readability, error handling, edge cases, testing, and maintainability."
        },
        {
          title: "Prepare System Design Follow-Ups",
          text: "After practicing a design question, ask AI to challenge your design with scale, failure, consistency, cost, and operational questions."
        },
        {
          title: "Learn to Explain AI Concepts",
          text: "Practice explaining embeddings, vector search, RAG, agents, token limits, model latency, evaluation, and hallucination risk."
        },
        {
          title: "Turn Tools Into Reasoning",
          text: "Do not say \"I used Kafka.\" Say why you used it, what problem it solved, what trade-offs it created, and how you monitored it."
        }
      ],

      ethics: {
        title: "Ethical AI Use in Interview Preparation",
        dos: [
          "Use AI to practice before the interview.",
          "Use AI to improve clarity and structure.",
          "Use AI to research the company.",
          "Use AI to generate mock questions.",
          "Use AI to review your answers after practice.",
          "Use AI to identify gaps in your preparation.",
          "Use AI to explain topics you do not understand."
        ],
        donts: [
          "Do not use hidden real-time AI answers during a live interview.",
          "Do not read robotic AI-generated answers from another screen.",
          "Do not invent fake stories or fake experience.",
          "Do not paste confidential company data into public AI tools.",
          "Do not trust AI-generated code without review.",
          "Do not let AI remove your real voice and personality.",
          "Do not use AI to avoid learning the actual material."
        ],
        highlight: "The best AI-assisted candidate still sounds human, honest, and prepared."
      },

      toolsAlert: {
        title: "Tools Change Fast. Search Before You Choose.",
        text: "AI interview tools change quickly. New products appear, pricing changes, and features move between free and paid plans. Before using any tool seriously, search for updated reviews, check the official website, and test whether the tool actually helps your interview goal.",
        suggestions: [
          "best AI mock interview tools [current year]",
          "AI coding interview practice tools",
          "AI system design interview practice",
          "ChatGPT interview prep prompts",
          "Claude interview prep prompts",
          "Gemini Deep Research company interview prep",
          "AI mock interview software developers",
          "ethical AI use in job interviews"
        ]
      },
      
      cta: {
        title: "Use AI to Prepare, Then Bring Your Own Thinking",
        text: "AI can help you prepare faster, organize your thoughts, and practice more effectively. But in the interview, your real value is still your judgment, communication, honesty, and experience."
      }
    }
  };
})();



