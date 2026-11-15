// Portfolio data — author-maintained content for the f1port experience
// Replace placeholder content with real data when ready

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link?: string;
  github?: string;
  image?: string;
  sector: string; // e.g., "SECTOR 2"
}

export interface DriverStat {
  label: string;
  value: string;
  unit?: string;
}

export interface DriverProfile {
  name: string;
  title: string;
  number: string; // driver number
  avatar: string;
  bio: string;
  stats: DriverStat[];
}

export interface Skill {
  name: string;
  category: "languages" | "frameworks" | "tools" | "databases";
  level: number; // 0-100
}

export interface ContactInfo {
  email: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  resumeLink?: string;
}

// ─── Driver Profile ──────────────────────────────────────────────
export const driverProfile: DriverProfile = {
  name: "ADITYA",
  title: "Full Stack Developer",
  number: "01",
  avatar: "/avatar.png",
  bio: "Computer Science undergraduate at Chitkara University building full-stack, AI-integrated web applications with React, Next.js, Node.js and MongoDB/PostgreSQL on a strong DSA foundation. Shipped real-world software as a freelancer, including a recruitment platform for a U.S. staffing firm and a kitchen order system for a local restaurant.",
  stats: [
    { label: "CGPA", value: "9.71", unit: "/ 10" },
    { label: "REEL VIEWS", value: "60K+", unit: "OSC" },
    { label: "CODE FOR GOOD FINALIST", value: "JPMC" },
    { label: "FREELANCE CLIENTS", value: "2", unit: "SHIPPED" },
  ],
};

// ─── Projects ────────────────────────────────────────────────────
// Add `link` / `github` to a project to show its VIEW PROJECT / SOURCE CODE buttons.
export const projects: Project[] = [
  {
    id: "sentinel",
    title: "Sentinel",
    description:
      "An AI-powered job scam detection platform. Multi-agent orchestration analyzes job postings, recruiter profiles and historical X activity to produce structured fraud-risk assessments, alongside a resume/LinkedIn analyzer, voice-evaluated interview practice and community scam reporting.",
    tech: ["Next.js", "PostgreSQL", "Prisma", "AI Agents", "Google Generative AI", "X API"],
    sector: "SECTOR 2",
  },
  {
    id: "curifix",
    title: "Curifix",
    description:
      "A full-stack AI healthcare platform: an AI doctor chatbot, symptom assessment and lab-report summaries with Gemini and LangChain, real-time video consultations over WebRTC, and location-based doctor and hospital discovery with medicine reminders and emergency alerts.",
    tech: ["React", "Node.js", "MongoDB", "Socket.io", "WebRTC", "Gemini"],
    sector: "SECTOR 3",
  },
  {
    id: "kesari",
    title: "Kesari POS",
    description:
      "A full-stack restaurant management system with real-time order tracking, thermal printer integration, inventory management, and detailed analytics dashboards for multi-table service.",
    tech: ["React", "Node.js", "Socket.io", "PostgreSQL"],
    sector: "SECTOR 4",
  },
];

// ─── Skills ──────────────────────────────────────────────────────
// `level` is only used by the (currently unused) SkillsSection bars — adjust to taste.
export const skills: Skill[] = [
  // Languages
  { name: "JavaScript", category: "languages", level: 90 },
  { name: "TypeScript", category: "languages", level: 90 },
  { name: "Java", category: "languages", level: 75 },
  { name: "Python", category: "languages", level: 70 },
  { name: "SQL", category: "languages", level: 75 },
  { name: "C", category: "languages", level: 65 },

  // Frameworks
  { name: "React", category: "frameworks", level: 90 },
  { name: "Next.js", category: "frameworks", level: 90 },
  { name: "Node.js", category: "frameworks", level: 85 },
  { name: "Express.js", category: "frameworks", level: 85 },
  { name: "Prisma", category: "frameworks", level: 80 },
  { name: "LangChain", category: "frameworks", level: 70 },
  { name: "Tailwind CSS", category: "frameworks", level: 85 },

  // Tools
  { name: "Docker", category: "tools", level: 70 },
  { name: "NGINX", category: "tools", level: 65 },
  { name: "CI/CD", category: "tools", level: 65 },
  { name: "AWS", category: "tools", level: 65 },
  { name: "Google Cloud", category: "tools", level: 60 },
  { name: "Git", category: "tools", level: 85 },

  // Databases
  { name: "PostgreSQL", category: "databases", level: 80 },
  { name: "MongoDB", category: "databases", level: 80 },
  { name: "MySQL", category: "databases", level: 70 },
  { name: "Redis", category: "databases", level: 65 },
];

// ─── Contact ─────────────────────────────────────────────────────
export const contactInfo: ContactInfo = {
  email: "adityadgr29@gmail.com",
  github: "https://github.com/adityash2006",
  resumeLink: "/aditya_sharma_resume.pdf",
};

// ─── Team Definitions ────────────────────────────────────────────
export type TeamId = "mercedes" | "ferrari" | "redbull";

export interface Team {
  id: TeamId;
  name: string;
  accent: string;
  accentRgb: string;
  secondary: string;
  carColor: string;
  /** Car shown on track for this team */
  carName: string;
  /** glTF served from /public */
  carModel: string;
}

export const teams: Record<TeamId, Team> = {
  mercedes: {
    id: "mercedes",
    name: "Mercedes",
    accent: "#00A19C",
    accentRgb: "0, 161, 156",
    secondary: "#C6C6C6",
    carColor: "#00A19C",
    carName: "Mercedes W17",
    carModel: "/model3/scene.web.gltf",
  },
  ferrari: {
    id: "ferrari",
    name: "Ferrari",
    accent: "#E8002D",
    accentRgb: "232, 0, 45",
    secondary: "#FFF200",
    carColor: "#E8002D",
    carName: "Ferrari SF-26",
    carModel: "/model2/scene.web.gltf",
  },
  redbull: {
    id: "redbull",
    name: "Red Bull",
    accent: "#3671C6",
    accentRgb: "54, 113, 198",
    secondary: "#FFD700",
    carColor: "#3671C6",
    carName: "Red Bull RB22",
    carModel: "/model1/scene.web.gltf",
  },
};
