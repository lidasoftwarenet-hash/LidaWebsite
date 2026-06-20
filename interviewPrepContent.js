window.interviewPrepContent = {
  hero: {
    title: "Prepare for Your Next Job Interview With Structure and Confidence",
    subtitle: "A good interview is not about sounding perfect. It is about showing how you think, how you communicate, how you solve problems, and how you handle uncertainty.",
    supportingText: "This practical guide brings together interview tips, realistic examples, software developer preparation, question banks, and checklists you can use before your next interview.",
    primaryCta: {
      text: "Watch the Tutorial",
      href: "#tutorial-video"
    },
    secondaryCta: {
      text: "Explore Interview Tips",
      href: "#what-interviewers-look-for"
    }
  },
  videoSection: {
    title: "Start With the Short Tutorial",
    text: "This 2.5-minute tutorial explains one of the most important interview principles: do not try to sound perfect. Try to sound clear, honest, prepared, and structured.",
    youtubeId: "bz6jDwcPxG0"
  },
  valueCards: {
    title: "What Interviewers Really Look For",
    subtitle: "Beyond coding skills, interviewers assess these core competencies to determine if you can succeed as an individual contributor and teammate.",
    items: [
      {
        title: "Clarity",
        desc: "Can you explain your experience, decisions, and thought process in a way that is easy to follow?",
        icon: "clarity"
      },
      {
        title: "Ownership",
        desc: "Can you describe what you personally did, not only what the team did?",
        icon: "ownership"
      },
      {
        title: "Problem Solving",
        desc: "Can you break a problem into smaller parts, ask good questions, and choose a reasonable solution?",
        icon: "problem-solving"
      },
      {
        title: "Communication",
        desc: "Can you think out loud, listen, adjust, and respond to hints?",
        icon: "communication"
      },
      {
        title: "Technical Judgment",
        desc: "For software roles, can you explain trade-offs, edge cases, performance, reliability, scalability, and maintainability?",
        icon: "judgment"
      },
      {
        title: "Self-Awareness",
        desc: "Can you admit mistakes, explain what you learned, and show growth without blaming others?",
        icon: "self-awareness"
      }
    ]
  },
  interviewProcessTimeline: {
    title: "The Modern Interview Process",
    subtitle: "A step-by-step look at typical software engineering and tech recruitment funnels.",
    steps: [
      {
        name: "Recruiter Screen",
        whatItChecks: "Basic background alignment, salary expectations, notice period, and communication skills.",
        candidateGoal: "Verify fit, convey enthusiasm, and move to the hiring manager round."
      },
      {
        name: "Hiring Manager Interview",
        whatItChecks: "Team fit, relevant experience, working style, and career goals.",
        candidateGoal: "Demonstrate technical context, domain knowledge, and leadership behavior."
      },
      {
        name: "Technical Screen",
        whatItChecks: "Hands-on coding, basic technical fundamentals, and fast problem solving.",
        candidateGoal: "Explain your logic clearly, write clean code, and handle edge cases."
      },
      {
        name: "Take-Home Assignment",
        whatItChecks: "Real-world coding quality, architecture patterns, testing habits, and documentation.",
        candidateGoal: "Deliver production-ready code with tests, a clear README, and clean structure."
      },
      {
        name: "System Design Interview",
        whatItChecks: "High-level architectural thinking, scaling choices, DB selection, and trade-off analysis.",
        candidateGoal: "Clarify assumptions, design a modular solution, scale it, and discuss edge cases."
      },
      {
        name: "Behavioral Interview",
        whatItChecks: "STAR stories, conflict resolution, alignment with company values, and collaboration.",
        candidateGoal: "Share specific personal stories with business impact and lessons learned."
      },
      {
        name: "Final Interview",
        whatItChecks: "Cultural alignment, executive review, or final wrap-up.",
        candidateGoal: "Ask great strategic questions, restate value alignment, and align on offer details."
      }
    ]
  },
  preparationChecklist: {
    title: "How to Prepare Before the Interview",
    intro: "Interview preparation should not start with memorizing answers. It should start with building your story.",
    items: [
      {
        title: "Understand the role",
        text: "Read the job description carefully and mark the main responsibilities, required skills, business domain, seniority level, and repeated keywords."
      },
      {
        title: "Prepare your personal story",
        text: "Be ready to explain who you are professionally, what experience you bring, what you are strong at, and what you are looking for next."
      },
      {
        title: "Prepare five strong stories",
        text: "Prepare examples about a project you are proud of, a difficult bug or problem, a disagreement, a mistake, and a time you learned something new."
      },
      {
        title: "Prepare technical examples",
        text: "For software roles, prepare examples about APIs, databases, production issues, architecture decisions, testing, monitoring, and code quality."
      },
      {
        title: "Prepare questions for them",
        text: "Good candidates also evaluate the company. Ask about the team, process, ownership, deployment, testing, technical debt, roadmap, and success expectations."
      }
    ]
  },
  generalInterviewGuide: {
    title: "How to Answer: Tell Me About Yourself",
    intro: "This question is not an invitation to tell your life story. It is your opening pitch.",
    structure: [
      { phase: "Present", desc: "What you do now." },
      { phase: "Past", desc: "What experience you bring." },
      { phase: "Strength", desc: "What you are good at." },
      { phase: "Future", desc: "What you are looking for next." }
    ],
    template: "I am a [role] with experience in [main technologies or domain]. In my recent work, I focused on [main responsibilities]. I have worked on [systems/projects], including [technical areas]. One of my strengths is [clear strength]. Now I am looking for [next role direction], where I can contribute and continue growing.",
    mistakes: [
      "Too long",
      "Too vague",
      "Too technical too early",
      "No connection to the role"
    ]
  },
  liveInterviewExamples: {
    title: "Behavioral Interviews: Show Real Experience, Not Perfect Stories",
    starMethod: {
      title: "The STAR Framework",
      steps: [
        { label: "Situation", desc: "Describe the context or challenge." },
        { label: "Task", desc: "Identify your responsibility in that challenge." },
        { label: "Action", desc: "Detail the steps you took to address the problem." },
        { label: "Result", desc: "Quantify the outcomes, benefits, and lessons learned." }
      ],
      rule: "The Action part should be the largest part of the answer. Focus on what you personally did."
    },
    example: {
      question: "Tell me about a time you had a disagreement with another developer.",
      answer: "In one project, we had a disagreement about whether to solve a performance issue by adding caching or by changing the database query. The easy solution was to add cache, but I was worried it would hide the real issue and create stale data problems.\n\nMy responsibility was to help the team choose a safe solution without blocking the release. I suggested we first measure the query, check the execution plan, and identify the slow part. After that, we found that one missing index and one unnecessary join caused most of the delay.\n\nWe fixed the query, added the index, and only used caching for a smaller part of the flow where stale data was acceptable. The API response time improved, and we avoided adding unnecessary complexity.\n\nWhat I learned is that technical disagreements are easier to solve when we move from opinions to data.",
      whyItWorks: [
        "Shows technical thinking",
        "Shows collaboration",
        "Shows data-driven decision making",
        "Shows practical outcome",
        "Shows learning"
      ]
    }
  },
  commonMistakes: {
    title: "Common Interview Mistakes",
    items: [
      "Jumping straight into answers",
      "Giving generic answers",
      "Talking only about the team and not your own contribution",
      "Memorizing answers instead of understanding your story",
      "Ignoring the job description",
      "Not preparing questions",
      "Being too negative about previous workplaces",
      "Not explaining trade-offs",
      "Not testing your solution in coding interviews",
      "Trying to sound perfect instead of clear"
    ]
  },
  cta: {
    title: "Need Help Preparing for a Technical Interview?",
    text: "LiDa Software helps professionals and teams think clearly about software, architecture, technical communication, and modern development practices. Use this guide to prepare, practice, and walk into your next interview with structure and confidence.",
    primaryBtn: {
      text: "Contact LiDa Software",
      href: "index.html#contact"
    },
    secondaryBtn: {
      text: "Watch the Tutorial Again",
      href: "#tutorial-video"
    }
  },
  developerInterviewGuide: {
    notOnlyAboutCode: {
      title: "Software Developer Interviews Are Not Only About Code",
      checks: [
        "Can you solve problems?",
        "Can you build maintainable software?",
        "Can you explain your decisions clearly?"
      ],
      summary: "The best candidates do not just write code. They clarify requirements, handle edge cases, explain trade-offs, and think about production."
    },
    codingStrategy: {
      title: "Coding Interview Strategy",
      goldenRule: "Do not jump straight into code.",
      steps: [
        "Repeat the problem in your own words",
        "Ask clarifying questions",
        "Start with a simple solution",
        "Improve the solution",
        "Write clean code",
        "Test with examples",
        "Explain complexity"
      ],
      questions: [
        "Can the input be empty?",
        "Can numbers repeat?",
        "Are negative numbers allowed?",
        "Should I return the first match or any match?",
        "What should happen if there is no solution?",
        "Do we care more about time or memory?",
        "Is the input sorted?"
      ]
    },
    codingExample: {
      title: "Coding Interview Live Example",
      scenario: "Given a list of numbers and a target, return two numbers that add up to the target.",
      weak: "Okay, I will use a hash map.",
      better: "Before I start coding, I want to clarify a few things. Should I return the numbers or their indexes? Can the same number be used twice? Are duplicate values allowed? And if multiple pairs exist, is any pair acceptable?\n\nThe brute-force solution is to check every pair, which is simple but O(n²). A better solution is to scan once and store previously seen numbers in a hash map. For each number, I check whether the complement already exists.\n\nI will write the simple hash map solution first, then test it with edge cases.",
      whyItWorks: [
        "Requirements understanding",
        "Communication",
        "Simple to optimized thinking",
        "Edge-case awareness",
        "Clean problem solving"
      ]
    },
    systemDesign: {
      title: "System Design Interviews: Think Before Choosing Tools",
      intro: "A common mistake in system design interviews is jumping straight to technology. The interviewer asks: \"Design a notification system.\" The candidate answers: \"I would use Kafka, Redis, Kubernetes, and microservices.\" That is not design. That is naming tools.\n\nGood system design starts with requirements.",
      steps: [
        "Clarify requirements",
        "Define core entities",
        "Design the API",
        "Design the data model",
        "Design the core flow",
        "Discuss scaling",
        "Discuss reliability",
        "Discuss trade-offs"
      ],
      topics: [
        "APIs",
        "data modeling",
        "queues",
        "caching",
        "rate limits",
        "retries",
        "dead-letter queues",
        "idempotency",
        "monitoring",
        "alerting",
        "logs",
        "metrics",
        "tracing",
        "security",
        "cost"
      ]
    },
    systemDesignExample: {
      title: "System Design Live Example",
      scenario: "Design a system that sends email, SMS, and push notifications to users.",
      weak: "I would create a notification service with Kafka and Redis. Then I would send messages through providers.",
      better: "Before choosing tools, I want to clarify the requirements. Which channels do we support? Do users have preferences? Is delivery real-time or near real-time? Do we need retries? What scale should we assume? Is message ordering important? Do we need an audit trail?\n\nA simple design would start with a notification API that receives a request, validates it, stores the notification, checks user preferences, and publishes delivery jobs to a queue. Separate workers can handle email, SMS, and push delivery. Each worker records delivery status, handles retries, and moves failed messages to a dead-letter queue after a limit.\n\nFor reliability, I would make delivery idempotent so retrying does not send duplicate messages. I would also add monitoring for queue size, provider errors, retry rate, and delivery latency.",
      whyItWorks: [
        "Starts with requirements",
        "Builds a simple core system first",
        "Handles failure",
        "Mentions idempotency and observability",
        "Explains trade-offs"
      ]
    },
    productionThinking: {
      title: "Production Thinking: What Senior Interviewers Listen For",
      intro: "For experienced developers, interviewers often care less about perfect syntax and more about judgment. They want to know if you understand what happens after code reaches production.",
      cards: [
        { title: "Observability", desc: "logs, metrics, tracing, dashboards, alerts" },
        { title: "Reliability", desc: "retries, timeouts, fallbacks, idempotency" },
        { title: "Performance", desc: "latency, throughput, bottlenecks, indexing, caching" },
        { title: "Maintainability", desc: "clean code, tests, simple design, documentation" },
        { title: "Security", desc: "authentication, authorization, input validation, secrets" },
        { title: "Ownership", desc: "monitoring releases, investigating bugs, learning from incidents" }
      ]
    },
    talkingAboutAi: {
      title: "How to Talk About AI in a Developer Interview",
      intro: "AI is now part of modern software development, but strong developers do not treat AI output as automatically correct. They use AI as an assistant, then review, test, and validate the result.",
      goodAnswer: "I use AI tools to move faster, explore options, generate drafts, and speed up repetitive work. But I do not blindly trust generated code. I still review the logic, check security, test edge cases, and make sure the solution fits the architecture. I am also interested in using AI inside products, not only as a coding assistant, especially around agents, vector search, embeddings, token efficiency, and automation.",
      signals: [
        "Responsible AI usage",
        "Code review",
        "Testing",
        "Security awareness",
        "Product thinking",
        "Token efficiency",
        "Vector search",
        "Integration into real software"
      ]
    }
  },
  questionBanks: {
    title: "Practice With Real Interview-Style Questions",
    subtitle: "Select a category below to browse high-impact questions curated from real interview loops.",
    categories: [
      {
        id: "general",
        name: "General Questions",
        questions: [
          "Tell me about yourself.",
          "Why are you interested in this role?",
          "What are your strengths?",
          "What is one weakness you are working on?",
          "Why are you leaving your current role?",
          "What type of team do you work best with?",
          "Tell me about a project you are proud of.",
          "Tell me about a time you failed.",
          "Tell me about a time you had to learn something quickly.",
          "Where do you see yourself growing next?"
        ]
      },
      {
        id: "behavioral",
        name: "Behavioral",
        questions: [
          "Tell me about a conflict with a teammate.",
          "Tell me about a time you disagreed with a manager.",
          "Tell me about a time you received difficult feedback.",
          "Tell me about a time you made a mistake in production.",
          "Tell me about a time you worked under pressure.",
          "Tell me about a time you had unclear requirements.",
          "Tell me about a time you improved a process.",
          "Tell me about a time you helped another team member.",
          "Tell me about a time you had to convince others.",
          "Tell me about a time you changed your opinion after seeing data."
        ]
      },
      {
        id: "coding",
        name: "Coding",
        questions: [
          "Find two numbers that add up to a target.",
          "Reverse a string.",
          "Check if a string is a palindrome.",
          "Find the first non-repeating character.",
          "Merge two sorted arrays.",
          "Remove duplicates from a list.",
          "Validate parentheses.",
          "Find the longest substring without repeating characters.",
          "Implement a simple cache.",
          "Parse and transform JSON data."
        ]
      },
      {
        id: "backend",
        name: "Backend",
        questions: [
          "How would you design a REST API?",
          "How do you handle authentication and authorization?",
          "What is the difference between synchronous and asynchronous communication?",
          "When would you use a queue?",
          "How do you handle retries safely?",
          "What is idempotency and why does it matter?",
          "How do you debug a slow API?",
          "How do you design database indexes?",
          "When would you use caching?",
          "How do you monitor a production service?"
        ]
      },
      {
        id: "system-design",
        name: "System Design",
        questions: [
          "Design a URL shortener.",
          "Design a notification system.",
          "Design a file upload service.",
          "Design a payment processing flow.",
          "Design a rate limiter.",
          "Design a chat system.",
          "Design a search autocomplete system.",
          "Design an audit log system.",
          "Design a job queue.",
          "Design a feature flag system."
        ]
      },
      {
        id: "ai",
        name: "AI & Dev Tools",
        questions: [
          "How do you use AI tools in your development workflow?",
          "How do you validate AI-generated code?",
          "What are the risks of using AI in production systems?",
          "What is vector search?",
          "What are embeddings?",
          "What is token efficiency?",
          "When would you use an AI agent?",
          "How would you add AI features to an existing product?",
          "How do you avoid leaking sensitive data to AI tools?",
          "How should teams review AI-assisted code."
        ]
      }
    ]
  },
  realInterviewMoments: {
    title: "Real Interview Moments",
    subtitle: "Realistic, anonymized scenarios demonstrating critical lessons observed during active interview cycles.",
    stories: [
      {
        title: "The Candidate Who Started Coding Too Fast",
        scenario: "The interviewer asked a simple algorithm question. The candidate immediately started coding and only later discovered that the input could contain duplicates and negative numbers.",
        lesson: "Clarify before coding. A few questions at the beginning can save you from rewriting the solution later."
      },
      {
        title: "The Strong Engineer Who Explained Too Little",
        scenario: "The candidate solved the technical problem, but stayed silent for most of the interview. The interviewer could not understand the candidate's thinking process.",
        lesson: "In interviews, the process matters. Think out loud, explain assumptions, and show how you evaluate options."
      },
      {
        title: "The System Design Answer That Was Only Tool Names",
        scenario: "The candidate answered a system design question by listing Kafka, Redis, Kubernetes, and microservices, but did not explain requirements, data flow, failure handling, or trade-offs.",
        lesson: "Tools are not architecture. Start with requirements, then design the flow, then choose tools."
      },
      {
        title: "The Behavioral Answer That Was Too Generic",
        scenario: "The candidate said, \"I am a team player and I work well under pressure\", but gave no real example.",
        lesson: "Generic claims are weak. Real stories are stronger."
      },
      {
        title: "The Candidate Who Handled \"I Don't Know\" Well",
        scenario: "The candidate did not know the exact answer, but explained what they did know, asked clarifying questions, and described how they would investigate.",
        lesson: "You do not need to know everything. You need to show structured thinking and honesty."
      }
    ]
  },
  finalChecklist: {
    title: "Final Interview Checklist",
    subtitle: "Use this quick action list before, during, and after your interview loop to stay aligned.",
    groups: [
      {
        id: "before-interview",
        name: "Before the Interview",
        items: [
          "Read the job description again.",
          "Prepare your \"Tell me about yourself\" answer.",
          "Prepare five real stories.",
          "Review your main technical projects.",
          "Prepare examples of impact and ownership.",
          "Prepare questions for the interviewer.",
          "Test your camera, microphone, and internet connection.",
          "Open your notes, but do not read from them like a script."
        ]
      },
      {
        id: "during-interview",
        name: "During the Interview",
        items: [
          "Listen carefully.",
          "Ask clarifying questions.",
          "Think out loud.",
          "Keep answers structured.",
          "Use examples.",
          "Admit when you are unsure.",
          "Explain trade-offs.",
          "Stay calm if you get stuck.",
          "Show curiosity."
        ]
      },
      {
        id: "after-interview",
        name: "After the Interview",
        items: [
          "Write down what was asked.",
          "Review what went well.",
          "Review what was weak.",
          "Send a short thank-you message if appropriate.",
          "Prepare better for the next round."
        ]
      }
    ]
  },
  doDontGuide: {
    title: "Do / Don't Interview Guide",
    intro: "Sometimes the difference between a weak interview and a strong interview is not the knowledge itself. It is how the candidate communicates, structures the answer, and handles uncertainty.",
    items: [
      {
        situation: "Technical question",
        dont: "Jump straight into the final answer.",
        do: "Clarify the requirement, explain assumptions, then solve step by step."
      },
      {
        situation: "Behavioral question",
        dont: "Say generic things like \"I am a team player.\"",
        do: "Give a real story with context, your action, and the result."
      },
      {
        situation: "Question you do not know",
        dont: "Invent an answer or pretend to know.",
        do: "Explain what you do know, ask clarifying questions, and describe how you would investigate."
      },
      {
        situation: "System design question",
        dont: "Start by listing tools like Kafka, Redis, Kubernetes, and microservices.",
        do: "Start with requirements, users, scale, data flow, failure cases, and trade-offs."
      },
      {
        situation: "Coding interview",
        dont: "Write code quickly without checking edge cases.",
        do: "Explain the approach, code clearly, test examples, and discuss complexity."
      },
      {
        situation: "Previous job experience",
        dont: "Talk only about what \"we\" did.",
        do: "Explain what the team did, but clearly show your personal contribution."
      },
      {
        situation: "Production issue",
        dont: "Say only \"I checked logs.\"",
        do: "Mention logs, metrics, traces, recent deployments, database queries, external services, and rollback strategy."
      },
      {
        situation: "AI tools",
        dont: "Say \"AI writes code for me.\"",
        do: "Say you use AI to move faster, but you review, test, validate, and adapt the result."
      }
    ]
  },
  weakStrongAnswers: {
    title: "Weak Answer vs Strong Answer",
    intro: "Interviewers do not only listen for the final answer. They listen for structure, judgment, ownership, and communication.",
    items: [
      {
        question: "Tell me about yourself.",
        weak: "I am a software developer. I worked with Java and Spring Boot, and I am looking for a new challenge.",
        better: "I am a software developer with experience building backend and full-stack systems. In my recent work, I owned services from requirements and design to development, deployment, monitoring, and production support. My strength is understanding the full software flow, not only writing code. In my next role, I am looking to use that experience while continuing to grow in modern software and AI-related development.",
        whyItWorks: "It gives a clear professional identity, shows ownership, explains strengths, and connects the answer to the next role."
      },
      {
        question: "How would you debug a slow API?",
        weak: "I would check the logs and maybe add cache.",
        better: "First, I would confirm where the latency comes from: application code, database, network, external service, or payload size. I would check metrics, traces, logs, recent deployments, database query time, and error rates. Only after identifying the bottleneck would I choose a fix, such as query optimization, indexing, caching, pagination, async processing, or timeout handling.",
        whyItWorks: "It shows production thinking. The candidate does not jump to a random fix before understanding the problem."
      },
      {
        question: "Tell me about a time you made a mistake.",
        weak: "I do not remember a serious mistake. I usually work carefully.",
        better: "In one project, I made a change that passed local testing but caused an issue in a specific production scenario. After we identified it, I helped roll back the change, checked the logs, reproduced the case, and added a test to cover it. The lesson for me was that a feature is not ready only because the happy path works. Since then, I pay more attention to edge cases and production-like testing.",
        whyItWorks: "It shows honesty, ownership, recovery, and learning."
      },
      {
        question: "Why are you interested in this role?",
        weak: "It looks interesting and I want to grow.",
        better: "The role is interesting to me because it combines hands-on engineering with real product impact. I saw that the team works on systems that require reliability, scalability, and strong technical ownership. That matches the kind of work I enjoy and the experience I want to continue building.",
        whyItWorks: "It connects the candidate’s motivation to the role instead of giving a generic answer."
      },
      {
        question: "How do you use AI tools as a developer?",
        weak: "I use AI to write code faster.",
        better: "I use AI tools to speed up research, generate first drafts, explore implementation options, and reduce repetitive work. But I do not blindly trust the output. I still review the logic, validate edge cases, check security implications, and make sure the code fits the architecture. I am also interested in using AI inside products, especially around agents, vector search, embeddings, token efficiency, and automation.",
        whyItWorks: "It shows modern AI awareness without sounding careless."
      }
    ]
  },
  codeExamples: {
    title: "Code Examples: What Interviewers Notice",
    intro: "In software interviews, code is not judged only by whether it works. Interviewers also look for readability, edge cases, error handling, maintainability, and production awareness.",
    items: [
      {
        title: "Handle Missing Data Clearly",
        badCode: "public User getUser(String id) {\n    return userRepository.findById(id).get();\n}",
        problem: [
          "Throws an unclear exception if the user does not exist.",
          "Does not explain the business meaning of the failure.",
          "Makes API error mapping harder."
        ],
        betterCode: "public User getUser(String id) {\n    return userRepository.findById(id)\n            .orElseThrow(() -> new UserNotFoundException(\"User not found: \" + id));\n}",
        whyBetter: [
          "The failure is explicit.",
          "It can be mapped to 404 Not Found.",
          "It is easier to debug and monitor.",
          "It shows production awareness."
        ]
      },
      {
        title: "Use a Correct Cache Key",
        badCode: "@Cacheable(cacheNames = \"products\", key = \"#productId\")\npublic Product getProduct(String productId, String country) {\n    return productService.load(productId, country);\n}",
        problem: [
          "The result depends on both productId and country, but the cache key only uses productId. Two different requests may accidentally receive the same cached result."
        ],
        betterCode: "@Cacheable(cacheNames = \"products\", key = \"#productId + ':' + #country\")\npublic Product getProduct(String productId, String country) {\n    return productService.load(productId, country);\n}",
        whyBetter: [
          "The cache key matches the data dependencies.",
          "It prevents incorrect cache hits.",
          "It shows attention to real production behavior."
        ],
        question: "Could two different requests accidentally share the same cache key even though the expected result should be different?"
      },
      {
        title: "Avoid Catching Everything Without Context",
        badCode: "public void processOrder(Order order) {\n    try {\n        paymentService.charge(order);\n        orderService.markAsPaid(order);\n    } catch (Exception e) {\n        log.error(\"Error\");\n    }\n}",
        problem: [
          "The log is not useful.",
          "The system may hide a failed payment.",
          "The order state may become unclear.",
          "There is no retry or compensation strategy."
        ],
        betterCode: "public void processOrder(Order order) {\n    try {\n        paymentService.charge(order);\n        orderService.markAsPaid(order);\n    } catch (PaymentException e) {\n        log.error(\"Payment failed for orderId={}\", order.getId(), e);\n        orderService.markPaymentFailed(order.getId());\n        throw e;\n    }\n}",
        whyBetter: [
          "The error has context.",
          "The order state is updated clearly.",
          "The exception type is meaningful.",
          "The system can react correctly."
        ]
      },
      {
        title: "Validate Input Before Business Logic",
        badCode: "public void createUser(CreateUserRequest request) {\n    userRepository.save(new User(request.getEmail(), request.getName()));\n}",
        problem: [
          "No validation.",
          "Bad data can enter the system.",
          "Errors may appear later in unexpected places."
        ],
        betterCode: "public void createUser(CreateUserRequest request) {\n    if (request.getEmail() == null || request.getEmail().isBlank()) {\n        throw new InvalidRequestException(\"Email is required\");\n    }\n\n    if (request.getName() == null || request.getName().isBlank()) {\n        throw new InvalidRequestException(\"Name is required\");\n    }\n\n    userRepository.save(new User(request.getEmail(), request.getName()));\n}",
        whyBetter: [
          "The API fails early.",
          "The error is clear.",
          "The system protects data quality."
        ]
      }
    ]
  },
  interviewSimulator: {
    title: "Interview Simulator",
    intro: "Practice is more useful when it feels close to a real interview. These mini scenarios show how a conversation can go wrong and how to improve it.",
    items: [
      {
        title: "The Candidate Who Started Coding Too Fast",
        question: "Given a list of numbers and a target, return two numbers that add up to the target.",
        weak: "I will use a hash map.",
        problem: "The candidate jumped into the solution before confirming the expected output, duplicates, negative numbers, input size, and no-solution behavior.",
        better: "Before coding, I want to clarify a few things. Should I return the values or indexes? Can the same number be used twice? Are duplicates allowed? If there are multiple valid answers, is any answer acceptable? And what should I return if there is no solution?",
        whyPreferred: "It shows the candidate understands that requirements affect the implementation."
      },
      {
        title: "The System Design Answer That Was Only Tool Names",
        question: "Design a notification system.",
        weak: "I would use Kafka, Redis, Kubernetes, and microservices.",
        problem: "The candidate named tools but did not design the system.",
        better: "Before choosing tools, I would clarify the channels, scale, delivery requirements, retry policy, user preferences, ordering needs, and audit requirements. Then I would design the core flow: receive notification request, validate it, store it, check preferences, enqueue delivery jobs, send through channel workers, record status, retry failures, and monitor delivery health.",
        whyPreferred: "It shows architecture thinking instead of buzzwords."
      },
      {
        title: "The Strong Engineer Who Explained Too Little",
        question: "How would you debug high latency in production?",
        weak: "I would check logs.",
        problem: "The answer may be technically valid, but it is too narrow and does not show senior-level production thinking.",
        better: "I would start by identifying where the latency is coming from. I would check metrics and traces to see whether the time is spent in the application, database, network, external services, or serialization. I would compare the issue with recent deployments, traffic changes, error rates, and database query time. After identifying the bottleneck, I would choose the right fix instead of guessing.",
        whyPreferred: "It shows structured investigation and avoids random fixes."
      },
      {
        title: "The Behavioral Answer That Was Too Generic",
        question: "Tell me about a time you worked under pressure.",
        weak: "I work well under pressure and I always do my best.",
        problem: "The answer is a claim, not evidence.",
        better: "In one release, we found a production issue shortly before a deadline. I helped split the problem into two parts: immediate mitigation and permanent fix. We rolled back the risky change, communicated the status, and then reproduced the issue in a test environment. After the release, we added a missing test and improved the checklist for similar changes.",
        whyPreferred: "It shows calm behavior, ownership, teamwork, and learning."
      },
      {
        title: "The Candidate Who Handled \"I Don't Know\" Well",
        question: "Can you explain how distributed tracing works internally?",
        weak: "I have used tracing tools, but I do not know all internal details.",
        problem: "The candidate was honest but still showed useful knowledge.",
        better: "My understanding is that traces connect related operations across services using trace IDs and spans, so we can follow a request through the system. If I needed to go deeper, I would check how context propagation works between services, how sampling is configured, and how spans are exported to the tracing backend.",
        whyPreferred: "It shows maturity. Not knowing everything is acceptable when the candidate thinks clearly."
      }
    ]
  },
  companyResearchToolkit: {
    title: "Company Research Toolkit",
    intro: "Before the interview, research the company like an engineer. Do not only read the homepage. Look for the product, business model, team, interview process, technical stack, recent news, and possible risks.",
    groups: [
      {
        name: "Research the company",
        links: [
          { title: "Company Website", url: "#", desc: "Start with the official website. Understand the product, customers, business model, case studies, and positioning.", isPlaceholder: true },
          { title: "Company Careers Page", url: "#", desc: "Read the open roles. Look for repeated technologies, responsibilities, seniority signals, and team structure.", isPlaceholder: true },
          { title: "LinkedIn", url: "https://www.linkedin.com", desc: "Use LinkedIn to check company size, employees, hiring activity, recent posts, and people who work in similar roles." },
          { title: "Google News", url: "https://news.google.com", desc: "Search the company name to find funding, layoffs, acquisitions, product launches, leadership changes, and recent announcements." }
        ]
      },
      {
        name: "Research the interview process",
        links: [
          { title: "Glassdoor Interviews", url: "https://www.glassdoor.com/Interview/index.htm", desc: "Use Glassdoor to look for interview stages, candidate reports, difficulty level, and common question patterns. Do not rely on one review. Look for repeated patterns." },
          { title: "Indeed Company Reviews and Interviews", url: "https://www.indeed.com/companies", desc: "Use Indeed to compare interview experiences, company reviews, and candidate feedback." },
          { title: "Blind Interview Experiences", url: "https://www.teamblind.com/channels/interview-experiences", desc: "Use Blind carefully. It can provide raw candidate experiences, but the tone may be emotional or biased. Cross-check with other sources." }
        ]
      },
      {
        name: "Research salary and level",
        links: [
          { title: "Levels.fyi", url: "https://www.levels.fyi", desc: "Useful for technology roles, levels, compensation ranges, and comparing companies." },
          { title: "Glassdoor Salaries", url: "https://www.glassdoor.com/Salaries/index.htm", desc: "Useful for salary ranges and role comparisons, but verify with multiple sources." }
        ]
      },
      {
        name: "Research tech stack",
        links: [
          { title: "BuiltWith", url: "https://builtwith.com", desc: "Use it to identify public web technologies used by a company website." },
          { title: "Wappalyzer", url: "https://www.wappalyzer.com", desc: "Use it to detect technologies, frameworks, analytics tools, and infrastructure signals from public websites." },
          { title: "StackShare", url: "https://stackshare.io", desc: "Search whether the company or similar companies have public technology stack information." }
        ]
      },
      {
        name: "Research company structure and stability",
        links: [
          { title: "The Org", url: "https://theorg.com", desc: "Use it to explore public org charts, leadership, departments, and reporting structures when available." },
          { title: "Crunchbase", url: "https://www.crunchbase.com", desc: "Useful for startups. Check funding, investors, acquisitions, and company stage." },
          { title: "Layoffs.fyi", url: "https://layoffs.fyi", desc: "Use it carefully as one signal only. Cross-check with news and company announcements." }
        ]
      }
    ],
    note: "Do not trust one source. Look for patterns across several sources."
  },
  companyResearchPlan30Min: {
    title: "30-Minute Company Research Plan",
    intro: "You do not need to spend days researching every company. A focused 30-minute review can make your answers much stronger.",
    timeline: [
      {
        time: "First 10 minutes",
        title: "Company basics",
        items: [
          "What does the company sell?",
          "Who are the customers?",
          "Is it B2B, B2C, SaaS, marketplace, fintech, cyber, AI, data, or another model?",
          "What problem does the product solve?",
          "What is the main value proposition?"
        ]
      },
      {
        time: "Next 10 minutes",
        title: "Role and team",
        items: [
          "What does the job description repeat?",
          "Which technologies appear?",
          "What responsibilities are emphasized?",
          "Is the role more product, platform, backend, full-stack, data, DevOps, or AI?",
          "What would success look like in the first 3 to 6 months?"
        ]
      },
      {
        time: "Final 10 minutes",
        title: "Interview and risk signals",
        items: [
          "What interview stages are commonly reported?",
          "Are there coding, system design, behavioral, or take-home rounds?",
          "Any recent funding, layoffs, acquisition, or leadership changes?",
          "What questions should you ask the interviewer?",
          "What story from your experience best matches this role?"
        ]
      }
    ],
    outputCard: {
      title: "After 30 minutes, you should be able to answer:",
      items: [
        "What does this company do?",
        "Why are you interested?",
        "Why are you relevant for the role?",
        "What questions do you want to ask them?",
        "What concerns do you want to clarify?"
      ]
    }
  },
  developerResearchChecklist: {
    title: "Developer-Specific Company Research",
    intro: "For software developer roles, company research should include technical signals. You do not need to know their full architecture, but you should understand enough to ask better questions.",
    groups: [
      {
        name: "Product and architecture",
        items: [
          "Is the product real-time, data-heavy, transactional, AI-based, or content-heavy?",
          "Does the product likely need high availability?",
          "Are users internal, external, enterprise, or consumers?",
          "What APIs or integrations might the product need?",
          "What scale problems might exist?"
        ]
      },
      {
        name: "Engineering culture",
        items: [
          "Do they mention code reviews?",
          "Do they mention testing?",
          "Do they mention ownership?",
          "Do they mention production support?",
          "Do they have an engineering blog?",
          "Do they contribute to open source?"
        ]
      },
      {
        name: "Technical stack",
        items: [
          "Which languages appear in job posts?",
          "Which cloud provider appears?",
          "Do they mention Kubernetes, serverless, queues, databases, data pipelines, observability, or AI tools?",
          "Are they modernizing old systems or building new ones?"
        ]
      }
    ],
    questionsToAsk: {
      title: "Questions to Ask in the Interview",
      items: [
        "What does the deployment process look like?",
        "How does the team handle production incidents?",
        "How are technical decisions made?",
        "How much ownership does each developer have?",
        "What is the balance between new features and technical debt?",
        "How is AI currently used by the engineering team?",
        "What would be the first major challenge for someone joining this role?"
      ]
    }
  },
  cta: {
    title: "Let's Build Something Together",
    text: "If you are looking for a teammate, a consultant, or just want to chat about engineering, reach out.",
    primaryBtn: {
      text: "Get in Touch",
      href: "index.html#contact"
    },
    secondaryBtn: {
      text: "View My Projects",
      href: "index.html#projects"
    }
  }
};
