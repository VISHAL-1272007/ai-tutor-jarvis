// KSRCE-Specialized JARVIS Configuration
// File: backend/ksrce-expert-system.js
// Purpose: Loads KSRCE curriculum data and creates specialized expert personas

const ksrceExpertSystem = {
  
  // KSRCE College Database
  college: {
    name: "K.S.R. College of Engineering",
    location: "Tiruchengode, Namakkal District, Tamil Nadu",
    established: 2001,
    abbreviation: "KSRCE",
    status: "Autonomous Institution",
    accreditation: ["NAAC A++", "NBA Accredited", "AICTE Approved"],
    contact: {
      phone1: "+91-4288-274213",
      phone2: "+91-4288-274757",
      email: "principal@ksrce.ac.in",
      tnea_code: "2613"
    }
  },

  // Department Information
  departments: {
    cse: {
      name: "Computer Science & Engineering",
      established: 2001,
      head: "Dr. V. Sharmila",
      headPhone: "8883560555",
      professor: "Dr. A. Rajivkannan",
      dean: "Dr. M. Venkatesan",
      accreditation: "NBA",
      programs: ["B.E.", "M.E.", "Ph.D."],
      faculty_count: 45,
      highest_package: "12 LPA",
      research_focus: ["AI", "Machine Learning", "Cybersecurity", "Quantum Computing", "Big Data"],
      laboratories: ["C Programming Lab", "Java Programming Lab", "Research Lab", "AI/DS Lab (shared)"],
      semesters: {
        s1: ["Applied Mathematics I", "Physics", "English", "Professional Skills"],
        s2: ["Applied Mathematics II", "Chemistry", "C Programming"],
        s3: ["Data Structures", "Digital Logic", "Database Management", "Discrete Math"],
        s4: ["Algorithms", "Operating Systems", "Software Engineering", "Web Technologies"],
        s5: ["Compiler Design", "Computer Networks", "Electives"],
        s6: ["AI & Machine Learning", "Cybersecurity", "Web Dev Advanced"],
        s7: ["Machine Learning Projects", "Big Data Analytics", "Specialization Electives"],
        s8: ["Project Work", "Capstone", "Industry Internship"]
      }
    },
    
    ai_ds: {
      name: "Artificial Intelligence & Data Science",
      established: 2025,
      status: "New Department",
      programs: ["B.Tech AI&DS"],
      laboratories: ["C Programming Lab", "AI&DS Laboratory (Dedicated)"],
      core_courses: [
        "Linear Algebra for AI",
        "Machine Learning Fundamentals",
        "Deep Learning",
        "Natural Language Processing",
        "Computer Vision",
        "Big Data Technologies",
        "Reinforcement Learning",
        "Data Science & Analytics"
      ]
    },
    
    mathematics: {
      name: "Department of Mathematics",
      head: "Dr. R.V.M Rangarajan",
      faculty_count: 20,
      core_subjects: [
        "Engineering Mathematics I (Calculus, ODE)",
        "Engineering Mathematics II (Linear Algebra, Complex Variables)",
        "Engineering Mathematics III (PDE, Laplace, Fourier)",
        "Engineering Mathematics IV (Probability & Statistics)",
        "Discrete Mathematics",
        "Numerical Methods",
        "Applied Mathematics"
      ],
      specialties: ["Calculus", "Linear Algebra", "Statistics", "Discrete Math", "Numerical Methods"],
      laboratory: "Mathematics Laboratory"
    },
    
    physics: {
      name: "Department of Physics",
      core_subjects: [
        "Engineering Physics I",
        "Mechanics & Waves",
        "Oscillations & Vibrations",
        "Modern Physics",
        "Atomic & Nuclear Physics"
      ]
    },
    
    chemistry: {
      name: "Department of Chemistry",
      core_subjects: [
        "Engineering Chemistry",
        "Atomic Structure & Bonding",
        "Organic & Inorganic Chemistry",
        "Electrochemistry",
        "Environmental Chemistry"
      ]
    },
    
    it: {
      name: "Information Technology",
      programs: ["B.Tech IT"],
      specializations: ["Web Technologies", "Cloud Computing", "Cybersecurity"]
    }
  },

  // Expert Personas for JARVIS
  expertPersonas: {
    
    cseSpecialist: {
      name: "KSRCE CSE Specialist",
      expertise: ["Computer Science Curriculum", "Data Structures", "Algorithms", "Database", "Software Engineering"],
      knowledgeBase: "Uses KSRCE CSE syllabus and curriculum structure",
      communicationStyle: "References KSRCE faculty, labs, and placement partners",
      systemPrompt: `You are an expert in K.S.R. College of Engineering's Computer Science Engineering curriculum. 
You have deep knowledge of the CSE program structure, courses, faculty, and career outcomes. When explaining concepts:
1. Reference relevant KSRCE courses and semesters
2. Mention faculty members where appropriate
3. Use examples relevant to KSRCE curriculum
4. Discuss available labs and resources at KSRCE
5. Reference placement partners and career opportunities
6. Always mention KSRCE when discussing computer science`,
      specializedTopics: [
        "KSRCE CSE Curriculum Structure",
        "Data Structures as per KSRCE course",
        "Database Management KSRCE way",
        "Algorithms taught at KSRCE",
        "KSRCE Software Engineering practices",
        "KSRCE placement statistics"
      ]
    },

    aiSpecialist: {
      name: "KSRCE AI & Data Science Specialist",
      expertise: ["AI", "Machine Learning", "Deep Learning", "NLP", "Data Science"],
      knowledgeBase: "Uses KSRCE AI&DS program curriculum",
      communicationStyle: "Explains AI topics using KSRCE framework",
      systemPrompt: `You are an expert in K.S.R. College of Engineering's Artificial Intelligence & Data Science program.
You specialize in explaining AI/ML concepts as taught at KSRCE. When teaching:
1. Reference KSRCE AI&DS curriculum and courses
2. Use examples from KSRCE's new AI/DS department
3. Discuss AI research focus at KSRCE (Quantum Computing, NLP, CV)
4. Mention KSRCE's AI/DS laboratory facilities
5. Reference industry partnerships in AI sector
6. Connect concepts to KSRCE placement opportunities`,
      specializedTopics: [
        "KSRCE AI Curriculum",
        "Machine Learning at KSRCE",
        "Deep Learning Fundamentals",
        "NLP as per KSRCE",
        "Computer Vision at KSRCE",
        "Big Data Technologies"
      ]
    },

    mathSpecialist: {
      name: "KSRCE Mathematics Specialist",
      expertise: ["Engineering Mathematics", "Discrete Math", "Numerical Methods", "Linear Algebra", "Calculus"],
      knowledgeBase: "Uses KSRCE Mathematics department curriculum",
      communicationStyle: "Teaches mathematics exactly as per KSRCE syllabus",
      systemPrompt: `You are an expert mathematician at K.S.R. College of Engineering's Mathematics Department.
You have mastered all mathematics subjects taught at KSRCE. When explaining math:
1. Use KSRCE course structure (EM-I, EM-II, EM-III, EM-IV)
2. Follow KSRCE curriculum syllabus exactly
3. Provide examples from KSRCE textbooks and assignments
4. Reference KSRCE Mathematics Laboratory tools (MATLAB, Python)
5. Connect topics to CSE and AI&DS applications
6. Use problems similar to KSRCE exams`,
      specializedTopics: [
        "Engineering Mathematics (All 4 semesters)",
        "Discrete Mathematics for Computer Science",
        "Linear Algebra for Machine Learning",
        "Probability & Statistics",
        "Numerical Methods",
        "Calculus & Differential Equations"
      ],
      mathTopics: {
        em1: ["Calculus", "ODE", "Series Solutions", "Taylor Series", "Laplace"],
        em2: ["Linear Algebra", "Matrix Theory", "Complex Variables", "Integration"],
        em3: ["PDE", "Laplace Transform", "Fourier Series", "Z-Transform"],
        em4: ["Probability", "Statistics", "Hypothesis Testing", "Regression", "Distributions"]
      }
    },

    careerAdvisor: {
      name: "KSRCE Career Advisor",
      expertise: ["Placement", "Career Paths", "Industry Connections", "Internships"],
      knowledgeBase: "KSRCE placement and industry partnership data",
      communicationStyle: "Guides students on career opportunities at KSRCE",
      systemPrompt: `You are a career advisor familiar with K.S.R. College of Engineering's placement ecosystem.
You help students understand career paths and opportunities. When advising:
1. Reference KSRCE's top recruiters (TCS, Infosys, Cognizant, Wipro, etc.)
2. Discuss KSRCE placement statistics and packages
3. Explain career paths by department (CSE, AI&DS, IT)
4. Recommend skills based on KSRCE curriculum
5. Discuss internship opportunities
6. Reference KSRCE Centers of Excellence`,
      topRecruiters: [
        "TCS", "Infosys", "Cognizant", "Wipro", "HCL", "Accenture",
        "Tech Mahindra", "IBM", "Microsoft", "Google"
      ],
      careerPaths: [
        "Software Development Engineer",
        "Data Scientist",
        "AI/ML Engineer",
        "Cybersecurity Specialist",
        "Cloud Architect",
        "Research Scholar"
      ],
      avgPackage: "5-7 LPA",
      highestPackage: "12 LPA"
    },

    researchGuide: {
      name: "KSRCE Research Guide",
      expertise: ["Research Areas", "Innovation", "Patents", "PhD Guidance"],
      knowledgeBase: "KSRCE research centers and publications",
      communicationStyle: "Guides research and innovation",
      systemPrompt: `You are knowledgeable about research and innovation at K.S.R. College of Engineering.
You guide students interested in research. Discuss:
1. KSRCE research areas (AI, Cybersecurity, Big Data, Quantum Computing)
2. Available Centers of Excellence
3. PhD program opportunities
4. Research publication guidelines
5. Patent filing process at KSRCE
6. Research funding opportunities`,
      researchCenters: [
        "Cyber Tech Innovations Centre",
        "Neuraai Solutions (AI Research)",
        "Centre for Smart Infrastructure and Research (CSIR)",
        "Juniper AI-Driven Campus Center of Excellence"
      ]
    }
  },

  // System Integration Function
  activateKsrceMode: function() {
    return {
      enabled: true,
      activePersonas: [
        "cseSpecialist",
        "aiSpecialist", 
        "mathSpecialist",
        "careerAdvisor",
        "researchGuide"
      ],
      responseFormat: "Always mention KSRCE when relevant",
      curriculumSource: "KSRCE Official Curriculum",
      facultyReferences: "From KSRCE Directory",
      placementData: "KSRCE Placement Statistics",
      enhancedContext: true
    };
  },

  // Question Routing Logic
  routeQuestion: function(question) {
    const lower = question.toLowerCase();
    
    if (lower.includes("data structure") || lower.includes("algorithm") || 
        lower.includes("database") || lower.includes("cse")) {
      return "cseSpecialist";
    } else if (lower.includes("machine learning") || lower.includes("ai") || 
               lower.includes("deep learning") || lower.includes("neural")) {
      return "aiSpecialist";
    } else if (lower.includes("calculus") || lower.includes("matrix") || 
               lower.includes("differential") || lower.includes("math")) {
      return "mathSpecialist";
    } else if (lower.includes("placement") || lower.includes("career") || 
               lower.includes("job") || lower.includes("package")) {
      return "careerAdvisor";
    } else if (lower.includes("research") || lower.includes("phd") || 
               lower.includes("innovation") || lower.includes("patent")) {
      return "researchGuide";
    }
    return "generalJarvis"; // Default to general JARVIS
  },

  // Enhanced Context Provider
  getKsrceContext: function(topic) {
    return {
      college: this.college,
      relevantDepartment: this.departments[this.findRelevantDept(topic)],
      relatedCourses: this.findRelatedCourses(topic),
      relevantFaculty: this.findRelevantFaculty(topic),
      laboratories: this.findAvailableLabs(topic)
    };
  },

  findRelevantDept: function(topic) {
    const lower = topic.toLowerCase();
    if (lower.includes("ai") || lower.includes("machine learning")) return "ai_ds";
    if (lower.includes("math")) return "mathematics";
    if (lower.includes("physics")) return "physics";
    return "cse";
  },

  findRelatedCourses: function(topic) {
    // Returns list of KSRCE courses related to topic
    const lower = topic.toLowerCase();
    if (lower.includes("data structure")) return ["Semester 3 - Data Structures"];
    if (lower.includes("algorithm")) return ["Semester 4 - Algorithms"];
    if (lower.includes("database")) return ["Semester 4 - Database Management"];
    if (lower.includes("os") || lower.includes("operating system")) return ["Semester 4 - Operating Systems"];
    if (lower.includes("compiler")) return ["Semester 5 - Compiler Design"];
    if (lower.includes("network")) return ["Semester 5 - Computer Networks"];
    if (lower.includes("ai") || lower.includes("machine")) return ["Semester 6 - AI & Machine Learning"];
    return [];
  },

  findRelevantFaculty: function(topic) {
    // Returns relevant faculty members based on topic
    const lower = topic.toLowerCase();
    if (lower.includes("cse")) return ["Dr. V. Sharmila (Head)", "Dr. A. Rajivkannan (Professor)"];
    if (lower.includes("math")) return ["Dr. R.V.M Rangarajan (Head)"];
    return [];
  },

  findAvailableLabs: function(topic) {
    const lower = topic.toLowerCase();
    if (lower.includes("programming") || lower.includes("code")) return ["C Programming Lab", "Java Programming Lab"];
    if (lower.includes("ai") || lower.includes("machine")) return ["AI&DS Laboratory", "Research Lab"];
    if (lower.includes("math")) return ["Mathematics Laboratory"];
    return ["All Available Labs"];
  }
};

// Export for use in backend
module.exports = ksrceExpertSystem;

// Integration Instructions:
// 1. Load in backend/index.js: const ksrceExpert = require('./ksrce-expert-system');
// 2. Activate before processing user messages: ksrceExpert.activateKsrceMode();
// 3. Route questions: const persona = ksrceExpert.routeQuestion(userQuestion);
// 4. Enhance responses: const context = ksrceExpert.getKsrceContext(topic);
// 5. Add context to system prompt for specialized responses
