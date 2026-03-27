// Mock database for certificates and courses

export const mockCertificates = [
  {
    id: 1,
    courseName: "Professional Cleaning Fundamentals",
    issueDate: "2024-03-15",
    completionDate: "2024-03-15",
    score: 92,
    status: "completed" as const,
    certificateId: "CERT-2024-001",
    studentName: "John Doe",
    instructorName: "Errbud Training Faculty",
  },
  {
    id: 2,
    courseName: "Deep Cleaning Techniques",
    issueDate: "2024-02-20",
    completionDate: "2024-03-10",
    score: 88,
    status: "completed" as const,
    certificateId: "CERT-2024-002",
    studentName: "John Doe",
    instructorName: "Errbud Training Faculty",
  },
  {
    id: 3,
    courseName: "Sanitation & Health Standards",
    issueDate: "2024-01-25",
    completionDate: "In Progress",
    score: 75,
    status: "in-progress" as const,
    certificateId: null,
    studentName: "John Doe",
    instructorName: "Errbud Training Faculty",
  },
];

export const mockCourses = [
  {
    id: 1,
    title: "Professional Cleaning Fundamentals",
    description: "Master the core techniques and safety standards every professional cleaner needs to know.",
    instructor: "Errbud Training Faculty",
    duration: "4 weeks",
    difficulty: "Beginner",
    status: "completed",
    progress: 100,
    enrolledStudents: 48,
    rating: 4.8,
  },
  {
    id: 2,
    title: "Deep Cleaning Techniques",
    description: "Advanced methods for tackling tough stains, grease, and hard-to-reach areas.",
    instructor: "Errbud Training Faculty",
    duration: "3 weeks",
    difficulty: "Intermediate",
    status: "in-progress",
    progress: 60,
    enrolledStudents: 38,
    rating: 4.9,
  },
  {
    id: 3,
    title: "Sanitation & Health Standards",
    description: "Learn proper sanitation protocols, chemical safety, and health compliance requirements.",
    instructor: "Errbud Training Faculty",
    duration: "2 weeks",
    difficulty: "Beginner",
    status: "not-started",
    progress: 0,
    enrolledStudents: 30,
    rating: 4.7,
  },
  {
    id: 4,
    title: "Client Communication & Professionalism",
    description: "Build strong client relationships with professional etiquette, communication, and reliability.",
    instructor: "Errbud Training Faculty",
    duration: "2 weeks",
    difficulty: "Beginner",
    status: "not-started",
    progress: 0,
    enrolledStudents: 25,
    rating: 4.6,
  },
];

// ─── Curriculum (module) data per course ────────────────────────────────────

export interface Curriculum {
  id: number;
  title: string;
  content: string;
  imageUrl?: string; // Optional image the admin can attach
  isLocked: boolean;
  isCompleted: boolean;
}

export const mockCurricula: Record<number, Curriculum[]> = {
  1: [
    {
      id: 1,
      title: "Introduction to Professional Cleaning",
      content:
        "Professional cleaning is more than just making surfaces look tidy — it's about creating safe, hygienic, and welcoming environments. In this module, we'll cover what separates amateur cleaning from professional-grade work: attention to detail, correct tool use, and methodical approaches.\n\nAs a professional cleaner at Errbud, you represent our brand in every home and office you enter. Punctuality, communication, and consistency are as important as the cleaning itself. Clients expect the same high standard every visit.",
      imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
      isLocked: false,
      isCompleted: false,
    },
    {
      id: 2,
      title: "Essential Cleaning Equipment",
      content:
        "Using the right tool for the right job is fundamental to efficiency and quality. Errbud cleaners carry a standard kit that includes microfibre cloths, colour-coded mops, HEPA vacuum cleaners, squeegees, and a range of approved cleaning chemicals.\n\nColour-coding is critical: blue cloths for general surfaces, red for bathrooms, green for kitchens. This prevents cross-contamination and is a hygiene requirement in all professional settings. Always inspect your equipment before starting a job — worn or dirty tools reduce quality and can cause damage.",
      imageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&q=80",
      isLocked: true,
      isCompleted: false,
    },
    {
      id: 3,
      title: "Cleaning Chemicals & Safe Handling",
      content:
        "Cleaning chemicals must always be used as directed on the product label. Never mix bleach with ammonia-based products — this produces toxic chloramine gas. Always dilute concentrates in a well-ventilated area and wear appropriate PPE: gloves, apron, and eye protection where required.\n\nErrbud uses only approved, eco-friendly products where possible. Store chemicals in their original containers, never in food containers. COSHH regulations require you to know the hazards of every chemical you use — product data sheets (MSDS) are available in your team portal.",
      imageUrl: undefined,
      isLocked: true,
      isCompleted: false,
    },
    {
      id: 4,
      title: "Room-by-Room Cleaning Method",
      content:
        "The most efficient approach is to clean top-to-bottom and dry-to-wet in every room. Start by dusting high surfaces (shelves, light fittings), work downward to furniture, then finish with vacuuming and mopping floors. This ensures dust and debris fall to a surface you haven't cleaned yet.\n\nIn bathrooms, apply toilet cleaner first so it soaks while you clean other surfaces. In kitchens, degrease surfaces before wiping to avoid spreading grease. Always finish each room completely before moving to the next — this prevents doubling back and missing areas.",
      imageUrl: "https://images.unsplash.com/photo-1527515545081-5db817172677?w=800&q=80",
      isLocked: true,
      isCompleted: false,
    },
    {
      id: 5,
      title: "Time Management & Quality Checks",
      content:
        "Professional cleaners must work efficiently without cutting corners. Before starting a job, walk through the property to identify priority areas, note any damage already present, and plan your order of work. Use a checklist to ensure nothing is missed.\n\nAt the end of every clean, do a final quality walkthrough: check for missed spots, streaks on glass, hair in drains, and that all surfaces are dry. Take pride in your work — a great clean is your best advertisement. Notify your supervisor immediately if you notice any pre-existing damage or client concerns.",
      imageUrl: undefined,
      isLocked: true,
      isCompleted: false,
    },
  ],
  2: [
    {
      id: 1,
      title: "What is Deep Cleaning?",
      content:
        "Deep cleaning goes far beyond the scope of a regular maintenance clean. It targets built-up grime, grease, limescale, mould, and areas that are rarely touched during routine cleans: behind appliances, inside ovens, grout lines, extractor fans, and skirting boards.\n\nDeep cleans are typically scheduled quarterly or before a new tenancy begins. They require more time, stronger cleaning agents, and specialist tools. Errbud offers deep clean packages that include a full inventory checklist signed off by the client.",
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
      isLocked: false,
      isCompleted: false,
    },
    {
      id: 2,
      title: "Tackling Grease & Limescale",
      content:
        "Kitchen grease and bathroom limescale are among the most common and stubborn cleaning challenges. For grease, apply a degreaser and allow it to dwell for 3–5 minutes before agitating with a non-scratch pad. Rinse thoroughly — leaving residue can cause surfaces to attract dirt faster.\n\nLimescale responds best to acidic cleaners (such as those containing citric acid). Apply, leave to dwell, then scrub with a nylon brush. For heavy buildup on shower heads, soak in a descaling solution overnight. Never use acidic products on marble or natural stone — they will etch the surface.",
      imageUrl: undefined,
      isLocked: true,
      isCompleted: false,
    },
    {
      id: 3,
      title: "Mould Removal & Prevention",
      content:
        "Mould poses a serious health risk, particularly for people with respiratory conditions. Always wear an N95 mask, gloves, and eye protection when treating mould. Apply a mould-specific treatment and allow it to dwell. Scrub with a stiff brush, then wipe and dry thoroughly.\n\nAfter removal, advise the client on ventilation — most bathroom mould is caused by inadequate airflow after showering. Mould on ceilings or walls covering large areas may indicate a structural damp issue and should be flagged to the supervisor rather than treated as a standard clean.",
      imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
      isLocked: true,
      isCompleted: false,
    },
  ],
  3: [
    {
      id: 1,
      title: "Why Sanitation Matters",
      content:
        "Sanitation is the process of reducing microbial contamination to safe levels. Cleaning removes visible dirt; sanitation kills harmful microorganisms. In professional cleaning, both steps are always required — you must clean before you sanitise, because dirt prevents sanitisers from working effectively.\n\nErrbud cleaners work in homes, offices, and occasionally healthcare-adjacent environments. Understanding the difference between cleaning, sanitising, and disinfecting — and when each is appropriate — is a core competency.",
      imageUrl: undefined,
      isLocked: false,
      isCompleted: false,
    },
    {
      id: 2,
      title: "Personal Protective Equipment (PPE)",
      content:
        "Wearing the correct PPE protects both you and the client. Errbud's minimum PPE requirements are: disposable or reusable gloves (changed between rooms), an apron for chemical work, and closed-toe shoes. Eye protection is required when using spray chemicals above waist height.\n\nPPE should be checked before each job. Damaged or worn PPE must be replaced — do not reuse single-use items. Dispose of used PPE properly; do not leave it in the client's property. Washing hands before putting on and after removing gloves is mandatory.",
      imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80",
      isLocked: true,
      isCompleted: false,
    },
  ],
  4: [
    {
      id: 1,
      title: "First Impressions with Clients",
      content:
        "You arrive at the client's door as the face of Errbud. Wear your uniform cleanly pressed, arrive on time (or notify in advance if delayed), and greet the client with confidence and friendliness. Introduce yourself by name and confirm the scope of the clean before starting.\n\nDo not use your phone for personal calls while on the job. Keep conversation professional and polite. If the client raises a complaint, listen fully before responding — never be defensive. Your goal is to leave them feeling heard and confident that the issue will be resolved.",
      imageUrl: undefined,
      isLocked: false,
      isCompleted: false,
    },
    {
      id: 2,
      title: "Handling Complaints & Feedback",
      content:
        "No matter how experienced you are, client complaints will occasionally arise. The correct response is always: acknowledge the concern, apologise for their experience (without admitting fault), and offer a resolution. If you cannot resolve it on the spot, escalate immediately to your supervisor.\n\nPositive feedback is equally important — share compliments with your team and use them to identify what you do well. Errbud uses client satisfaction scores to track team performance. Consistently high scores are rewarded during quarterly reviews.",
      imageUrl: undefined,
      isLocked: true,
      isCompleted: false,
    },
  ],
};

export interface QuizQuestion {
  id: number;
  courseId: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

export const mockQuizQuestions: QuizQuestion[] = [
  // ── Course 1: Professional Cleaning Fundamentals ──────────────────────────
  {
    id: 1,
    courseId: 1,
    category: "Professional Cleaning Fundamentals",
    question: "Under the Errbud colour-coding system, which colour cloth is used in bathrooms?",
    options: ["Blue", "Green", "Red", "Yellow"],
    correctAnswer: 2,
  },
  {
    id: 2,
    courseId: 1,
    category: "Professional Cleaning Fundamentals",
    question: "What is the correct order when cleaning a room?",
    options: [
      "Floors first, then surfaces, then high areas",
      "Top-to-bottom and dry-to-wet",
      "Wet surfaces first, then dry areas",
      "Any order as long as everything is cleaned",
    ],
    correctAnswer: 1,
  },
  {
    id: 3,
    courseId: 1,
    category: "Professional Cleaning Fundamentals",
    question: "Which combination of chemicals must NEVER be mixed?",
    options: [
      "Bleach and water",
      "Vinegar and baking soda",
      "Bleach and ammonia-based products",
      "Disinfectant and detergent",
    ],
    correctAnswer: 2,
  },
  {
    id: 4,
    courseId: 1,
    category: "Professional Cleaning Fundamentals",
    question: "What should you do at the very start of a cleaning job?",
    options: [
      "Start immediately with the most visible areas",
      "Walk through the property, plan your work and note existing damage",
      "Ask the client to leave so you can work without interruption",
      "Apply all chemicals first to let them soak",
    ],
    correctAnswer: 1,
  },
  {
    id: 5,
    courseId: 1,
    category: "Professional Cleaning Fundamentals",
    question: "What does PPE stand for?",
    options: [
      "Professional Premises Equipment",
      "Protective Product Essentials",
      "Personal Protective Equipment",
      "Practical Protective Elements",
    ],
    correctAnswer: 2,
  },

  // ── Course 2: Deep Cleaning Techniques ───────────────────────────────────
  {
    id: 6,
    courseId: 2,
    category: "Deep Cleaning Techniques",
    question: "How long should a degreaser dwell on a kitchen surface before you agitate it?",
    options: ["30 seconds", "1–2 minutes", "3–5 minutes", "10 minutes"],
    correctAnswer: 2,
  },
  {
    id: 7,
    courseId: 2,
    category: "Deep Cleaning Techniques",
    question: "Which type of cleaner works best against limescale?",
    options: [
      "Alkaline cleaners",
      "Acidic cleaners (e.g. citric acid-based)",
      "Solvent-based cleaners",
      "Neutral pH cleaners",
    ],
    correctAnswer: 1,
  },
  {
    id: 8,
    courseId: 2,
    category: "Deep Cleaning Techniques",
    question: "Which surfaces must NEVER have acidic cleaning products applied to them?",
    options: [
      "Ceramic tiles",
      "Stainless steel",
      "Marble and natural stone",
      "Plastic and acrylic",
    ],
    correctAnswer: 2,
  },
  {
    id: 9,
    courseId: 2,
    category: "Deep Cleaning Techniques",
    question: "What PPE must always be worn when treating mould?",
    options: [
      "Apron only",
      "Gloves and closed-toe shoes",
      "N95 mask, gloves, and eye protection",
      "High-visibility vest and gloves",
    ],
    correctAnswer: 2,
  },
  {
    id: 10,
    courseId: 2,
    category: "Deep Cleaning Techniques",
    question: "After removing mould, what should you advise the client to improve?",
    options: [
      "Lighting in the affected room",
      "Ventilation and airflow after showering",
      "The frequency of their regular cleans",
      "The type of paint used on the walls",
    ],
    correctAnswer: 1,
  },

  // ── Course 3: Sanitation & Health Standards ───────────────────────────────
  {
    id: 11,
    courseId: 3,
    category: "Sanitation & Health Standards",
    question: "What step must ALWAYS be completed before sanitising a surface?",
    options: [
      "Apply a disinfectant spray",
      "Rinse the surface with water",
      "Clean the surface to remove visible dirt",
      "Let the surface air-dry completely",
    ],
    correctAnswer: 2,
  },
  {
    id: 12,
    courseId: 3,
    category: "Sanitation & Health Standards",
    question: "When is eye protection required under Errbud policy?",
    options: [
      "Only when working outdoors",
      "When using spray chemicals above waist height",
      "Only when cleaning commercial kitchens",
      "Whenever bleach is on site",
    ],
    correctAnswer: 1,
  },
  {
    id: 13,
    courseId: 3,
    category: "Sanitation & Health Standards",
    question: "What are Errbud's minimum PPE requirements for every job?",
    options: [
      "Hard hat, gloves, and steel-toe boots",
      "Gloves, apron, and closed-toe shoes",
      "Face mask, gloves, and goggles",
      "Apron and rubber boots",
    ],
    correctAnswer: 1,
  },
  {
    id: 14,
    courseId: 3,
    category: "Sanitation & Health Standards",
    question: "What must you do with single-use PPE once a job is complete?",
    options: [
      "Leave it in the client's waste bin",
      "Keep it for reuse on the next job",
      "Dispose of it properly and never reuse it",
      "Return it to your supervisor for cleaning",
    ],
    correctAnswer: 2,
  },
  {
    id: 15,
    courseId: 3,
    category: "Sanitation & Health Standards",
    question: "When should you wash your hands in relation to wearing gloves?",
    options: [
      "Only after removing gloves at the end of the day",
      "Before putting gloves on and after taking them off",
      "Only before putting gloves on",
      "Hand-washing is not needed if you wear gloves",
    ],
    correctAnswer: 1,
  },

  // ── Course 4: Client Communication & Professionalism ─────────────────────
  {
    id: 16,
    courseId: 4,
    category: "Client Communication & Professionalism",
    question: "When a client raises a complaint, what should you do first?",
    options: [
      "Explain what you did correctly",
      "Apologise and immediately offer a full refund",
      "Listen fully before responding — never be defensive",
      "Contact your supervisor before speaking to the client",
    ],
    correctAnswer: 2,
  },
  {
    id: 17,
    courseId: 4,
    category: "Client Communication & Professionalism",
    question: "If you cannot resolve a complaint on the spot, what is the correct action?",
    options: [
      "Tell the client to contact head office directly",
      "Escalate immediately to your supervisor",
      "Promise to return next week and fix it",
      "Offer a discount and move on",
    ],
    correctAnswer: 1,
  },
  {
    id: 18,
    courseId: 4,
    category: "Client Communication & Professionalism",
    question: "How are Errbud client satisfaction scores used?",
    options: [
      "They are shared publicly on the Errbud website",
      "They are used only for marketing",
      "They track team performance and feed into quarterly reviews",
      "They determine which clients are charged more",
    ],
    correctAnswer: 2,
  },
  {
    id: 19,
    courseId: 4,
    category: "Client Communication & Professionalism",
    question: "What is the correct sequence when handling a client complaint?",
    options: [
      "Deny, escalate, apologise",
      "Apologise, argue, resolve",
      "Acknowledge, apologise, offer a resolution",
      "Ignore, document, notify",
    ],
    correctAnswer: 2,
  },
  {
    id: 20,
    courseId: 4,
    category: "Client Communication & Professionalism",
    question: "Why should you never use your phone for personal calls while on a job?",
    options: [
      "It drains the battery needed for the job app",
      "It is against UK employment law",
      "It is unprofessional and reflects badly on Errbud's brand",
      "Clients may ask to use your phone",
    ],
    correctAnswer: 2,
  },
];

// 20-question final exam drawn from all courses
export const finalExamQuestions: QuizQuestion[] = [
  mockQuizQuestions[0],  // course 1
  mockQuizQuestions[1],
  mockQuizQuestions[2],
  mockQuizQuestions[3],
  mockQuizQuestions[4],
  mockQuizQuestions[5],  // course 2
  mockQuizQuestions[6],
  mockQuizQuestions[7],
  mockQuizQuestions[8],
  mockQuizQuestions[9],
  mockQuizQuestions[10], // course 3
  mockQuizQuestions[11],
  mockQuizQuestions[12],
  mockQuizQuestions[13],
  mockQuizQuestions[14],
  mockQuizQuestions[15], // course 4
  mockQuizQuestions[16],
  mockQuizQuestions[17],
  mockQuizQuestions[18],
  mockQuizQuestions[19],
];
