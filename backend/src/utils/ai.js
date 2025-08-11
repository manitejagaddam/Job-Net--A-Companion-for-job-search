// AI utilities for skill extraction and job matching using Google Gemini
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Extract skills from resume/bio text using Gemini
const extractSkills = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Extract technical skills from the following text. Return only a JSON array of skill names. Example: ["JavaScript", "React", "Node.js"]`;

    const result = await model.generateContent([prompt, text]);
    const response = await result.response;
    const skills = JSON.parse(response.text());

    return skills;
  } catch (error) {
    console.error("Skill extraction failed:", error);
    // Fallback to basic keyword matching
    return extractSkillsBasic(text);
  }
};

// Basic skill extraction using regex/keywords
const extractSkillsBasic = (text) => {
  const commonSkills = [
    // Programming Languages
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C",
    "C#",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    "Swift",
    "Kotlin",
    "Scala",
    "Perl",

    // Web Frontend
    "HTML",
    "CSS",
    "Sass",
    "Less",
    "React",
    "Redux",
    "Next.js",
    "Vue.js",
    "Nuxt.js",
    "Angular",
    "Svelte",
    "Bootstrap",
    "Tailwind CSS",

    // Web Backend
    "Node.js",
    "Express.js",
    "Django",
    "Flask",
    "FastAPI",
    "Spring Boot",
    "Laravel",
    "Ruby on Rails",
    "ASP.NET",
    "Hapi.js",

    // Mobile Development
    "React Native",
    "Flutter",
    "Ionic",
    "SwiftUI",
    "Android SDK",
    "Xamarin",
    "NativeScript",

    // Databases
    "SQL",
    "PostgreSQL",
    "MySQL",
    "MariaDB",
    "SQLite",
    "MongoDB",
    "Cassandra",
    "Redis",
    "Neo4j",
    "DynamoDB",
    "Firebase",
    "Firestore",

    // APIs & Protocols
    "REST API",
    "GraphQL",
    "gRPC",
    "SOAP",
    "WebSockets",
    "OAuth 2.0",
    "OpenID Connect",

    // Cloud & DevOps
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "Terraform",
    "Ansible",
    "Jenkins",
    "GitHub Actions",
    "CircleCI",
    "Travis CI",
    "Vercel",
    "Netlify",

    // Version Control & Collaboration
    "Git",
    "GitHub",
    "GitLab",
    "Bitbucket",
    "SVN",

    // Data Science & AI/ML
    "NumPy",
    "Pandas",
    "Matplotlib",
    "Seaborn",
    "Scikit-learn",
    "TensorFlow",
    "PyTorch",
    "Keras",
    "OpenCV",
    "NLTK",
    "Spacy",
    "Hugging Face Transformers",
    "LangChain",

    // Big Data & Analytics
    "Apache Spark",
    "Hadoop",
    "Kafka",
    "Hive",
    "Snowflake",
    "Airflow",
    "dbt",

    // Cybersecurity
    "Penetration Testing",
    "Ethical Hacking",
    "Metasploit",
    "Wireshark",
    "Nmap",
    "Burp Suite",
    "SIEM Tools",
    "Network Security",

    // Testing
    "Jest",
    "Mocha",
    "Chai",
    "Cypress",
    "Selenium",
    "Playwright",
    "JUnit",
    "PyTest",

    // UI/UX & Design
    "Figma",
    "Adobe XD",
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Sketch",
    "InVision",
    "Canva",
    "Prototyping",
    "Wireframing",

    // Soft Skills
    "Agile",
    "Scrum",
    "Kanban",
    "Project Management",
    "Problem Solving",
    "Communication",
    "Collaboration",
    "Time Management",
    "Critical Thinking",

    // Miscellaneous
    "Blockchain",
    "Solidity",
    "Web3.js",
    "Ethers.js",
    "Smart Contracts",
    "IoT Development",
    "Embedded Systems",
  ];  

  const foundSkills = commonSkills.filter((skill) =>
    text.toLowerCase().includes(skill.toLowerCase())
  );

  return foundSkills;
};

// Calculate match score between job and candidate
const calculateMatchScore = (jobSkills, candidateSkills) => {
  const jobSkillsSet = new Set(jobSkills.map((s) => s.toLowerCase()));
  const candidateSkillsSet = new Set(
    candidateSkills.map((s) => s.toLowerCase())
  );

  const intersection = new Set(
    [...jobSkillsSet].filter((skill) => candidateSkillsSet.has(skill))
  );

  const union = new Set([...jobSkillsSet, ...candidateSkillsSet]);

  return (intersection.size / union.size) * 100;
};

// Get job recommendations based on user skills using Gemini
const getJobRecommendations = async (userSkills, allJobs) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Given these user skills: ${userSkills.join(
      ", "
    )} and these job descriptions: ${allJobs
      .map((job) => `${job.title}: ${job.description}`)
      .join(
        " | "
      )}, rank the jobs by relevance and return only the top 10 job IDs in order of best match. Return as JSON array: [1, 3, 2, ...]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rankedJobIds = JSON.parse(response.text());

    // Map back to full job objects with match scores
    const recommendations = rankedJobIds
      .map((jobId, index) => {
        const job = allJobs.find((j) => j.id === jobId);
        if (job) {
          return {
            job,
            matchScore: 100 - index * 10, // Score based on ranking
          };
        }
        return null;
      })
      .filter(Boolean);

    return recommendations;
  } catch (error) {
    console.error("AI recommendations failed, using basic matching:", error);
    // Fallback to basic matching
    const recommendations = allJobs.map((job) => ({
      job,
      matchScore: calculateMatchScore(job.skills, userSkills),
    }));

    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }
};

module.exports = {
  extractSkills,
  extractSkillsBasic,
  calculateMatchScore,
  getJobRecommendations,
};
