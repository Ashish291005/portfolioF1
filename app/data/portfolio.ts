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
  bio: "A passionate full-stack developer with a relentless drive for building high-performance web experiences. From concept to deployment, I engineer solutions that are fast, beautiful, and built to last.",
  stats: [
    { label: "YEARS EXP", value: "3", unit: "YRS" },
    { label: "PROJECTS", value: "12", unit: "BUILT" },
    { label: "COMMITS", value: "2.4K", unit: "TOTAL" },
    { label: "TOP SPEED", value: "99", unit: "WPM" },
  ],
};

// ─── Projects ────────────────────────────────────────────────────
export const projects: Project[] = [
  {
    id: "sentinel",
    title: "Sentinel AI",
    description:
      "A multi-agent scam detection platform that analyzes job posts using five specialized Gemini-powered AI agents. Features real-time trust scoring, X API integration, and Firecrawl-powered organization verification.",
    tech: ["Next.js", "Gemini AI", "Express", "TypeScript"],
    link: "https://sentinel-ai.vercel.app",
    github: "https://github.com/aditya/sentinel-ai",
    sector: "SECTOR 2",
  },
  {
    id: "kesari",
    title: "Kesari POS",
    description:
      "A full-stack restaurant management system with real-time order tracking, thermal printer integration, inventory management, and detailed analytics dashboards for multi-table service.",
    tech: ["React", "Node.js", "Socket.io", "PostgreSQL"],
    link: "https://kesari-pos.vercel.app",
    github: "https://github.com/aditya/kesari",
    sector: "SECTOR 3",
  },
  {
    id: "raceview",
    title: "RaceView Live",
    description:
      "Real-time Formula 1 telemetry dashboard that streams live timing data, visualizes car positions on track, and displays driver performance metrics with sub-second refresh rates.",
    tech: ["React", "WebSocket", "D3.js", "Python"],
    github: "https://github.com/aditya/raceview",
    sector: "SECTOR 4",
  },
  {
    id: "cloudnest",
    title: "CloudNest",
    description:
      "A self-hosted cloud storage platform with end-to-end encryption, real-time sync, file sharing with granular permissions, and a responsive file manager with drag-and-drop support.",
    tech: ["Next.js", "AWS S3", "Prisma", "tRPC"],
    link: "https://cloudnest.dev",
    github: "https://github.com/aditya/cloudnest",
    sector: "SECTOR 5",
  },
];

// ─── Skills ──────────────────────────────────────────────────────
export const skills: Skill[] = [
  // Languages
  { name: "TypeScript", category: "languages", level: 95 },
  { name: "JavaScript", category: "languages", level: 95 },
  { name: "Python", category: "languages", level: 80 },
  { name: "HTML/CSS", category: "languages", level: 95 },
  { name: "SQL", category: "languages", level: 75 },
  { name: "Rust", category: "languages", level: 40 },

  // Frameworks
  { name: "React", category: "frameworks", level: 95 },
  { name: "Next.js", category: "frameworks", level: 90 },
  { name: "Node.js", category: "frameworks", level: 85 },
  { name: "Express", category: "frameworks", level: 85 },
  { name: "Tailwind CSS", category: "frameworks", level: 90 },
  { name: "GSAP", category: "frameworks", level: 70 },

  // Tools
  { name: "Git", category: "tools", level: 90 },
  { name: "Docker", category: "tools", level: 70 },
  { name: "Figma", category: "tools", level: 75 },
  { name: "VS Code", category: "tools", level: 95 },
  { name: "Vercel", category: "tools", level: 85 },
  { name: "Linux", category: "tools", level: 75 },

  // Databases
  { name: "PostgreSQL", category: "databases", level: 80 },
  { name: "MongoDB", category: "databases", level: 75 },
  { name: "Redis", category: "databases", level: 65 },
  { name: "Prisma", category: "databases", level: 80 },
];

// ─── Contact ─────────────────────────────────────────────────────
export const contactInfo: ContactInfo = {
  email: "hello@aditya.dev",
  github: "https://github.com/aditya",
  linkedin: "https://linkedin.com/in/aditya",
  twitter: "https://x.com/aditya",
  resumeLink: "/resume.pdf",
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
}

export const teams: Record<TeamId, Team> = {
  mercedes: {
    id: "mercedes",
    name: "Mercedes",
    accent: "#00A19C",
    accentRgb: "0, 161, 156",
    secondary: "#C6C6C6",
    carColor: "#00A19C",
  },
  ferrari: {
    id: "ferrari",
    name: "Ferrari",
    accent: "#E8002D",
    accentRgb: "232, 0, 45",
    secondary: "#FFF200",
    carColor: "#E8002D",
  },
  redbull: {
    id: "redbull",
    name: "Red Bull",
    accent: "#3671C6",
    accentRgb: "54, 113, 198",
    secondary: "#FFD700",
    carColor: "#3671C6",
  },
};
