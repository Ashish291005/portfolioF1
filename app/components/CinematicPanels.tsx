"use client";

import { AnimatePresence, motion } from "framer-motion";
import { contactInfo, driverProfile, projects, skills } from "@/app/data/portfolio";
import { useTeam } from "@/app/context/TeamContext";
import TeamSelector from "./TeamSelector";

interface CinematicPanelsProps {
  activeSectorId: string;
  onNavigateToSector: (sectorId: string) => void;
}

const panelTransition = {
  type: "spring" as const,
  stiffness: 190,
  damping: 24,
  mass: 0.8,
};

export default function CinematicPanels({
  activeSectorId,
  onNavigateToSector,
}: CinematicPanelsProps) {
  const { team } = useTeam();
  const projectIndex = Number(activeSectorId.replace("sector-", "")) - 2;
  const activeProject = projects[projectIndex];
  const panelNumber = activeProject
    ? projectIndex + 2
    : activeSectorId === "sector-pit"
      ? 7
      : activeSectorId === "sector-finish"
        ? 8
        : 1;
  const placementMap: Record<string, string> = {
    hero: "left-low",
    "sector-1": "right-mid",
    "sector-2": "left-mid",
    "sector-3": "right-low",
    "sector-4": "left-high",
    "sector-5": "right-mid",
    "sector-pit": "left-low",
    "sector-finish": "right-high",
  };
  const placement = placementMap[activeSectorId] ?? "left-low";
  const fromRight = placement.startsWith("right");

  if (activeSectorId === "sector-resume") {
    return null;
  }

  let panel = (
    <section className="cinematic-panel-content" aria-labelledby="grid-title">
      <p className="panel-status"><span /> LIVE LAP / 01</p>
      <h1 id="grid-title">ADITYA <em>01</em></h1>
      <p className="panel-lede">
        Full-stack developer engineering high-performance digital experiences.
      </p>
      <div className="grid-meta">
        <span>DRIVER: {driverProfile.title.toUpperCase()}</span>
        <span>CONSTRUCTOR: {team.name.toUpperCase()}</span>
      </div>
      <div className="panel-actions">
        <button
          className="panel-primary"
          onClick={() => onNavigateToSector("sector-1")}
          style={{ backgroundColor: team.accent, boxShadow: `0 16px 32px rgba(${team.accentRgb}, 0.28)` }}
        >
          ENTER THE LAP
        </button>
        <a className="panel-text-link" href={`mailto:${contactInfo.email}`}>CONTACT</a>
      </div>
      <div className="livery-control">
        <span>CHOOSE LIVERY</span>
        <TeamSelector />
      </div>
    </section>
  );

  if (activeSectorId === "sector-1") {
    panel = (
      <section className="cinematic-panel-content" aria-labelledby="about-title">
        <p className="panel-status"><span /> TURN 01 / ABOUT</p>
        <h2 id="about-title">Built for the <em>last millisecond.</em></h2>
        <p className="panel-lede">{driverProfile.bio}</p>
        <div className="stat-strip">
          {driverProfile.stats.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>
    );
  } else if (activeProject) {
    panel = (
      <section className="cinematic-panel-content project-panel" aria-labelledby={`project-${activeProject.id}`}>
        <p className="panel-status"><span /> {activeProject.sector} / SELECTED WORK</p>
        <h2 id={`project-${activeProject.id}`}>{activeProject.title}</h2>
        <p className="panel-lede">{activeProject.description}</p>
        <div className="tech-list">
          {activeProject.tech.map((tech) => <span key={tech}>{tech}</span>)}
        </div>
        <div className="panel-actions">
          {activeProject.link && <a className="panel-primary" style={{ backgroundColor: team.accent, boxShadow: `0 16px 32px rgba(${team.accentRgb}, 0.28)` }} href={activeProject.link} target="_blank" rel="noreferrer">VIEW PROJECT</a>}
          {activeProject.github && <a className="panel-text-link" href={activeProject.github} target="_blank" rel="noreferrer">SOURCE CODE</a>}
        </div>
      </section>
    );
  } else if (activeSectorId === "sector-pit") {
    panel = (
      <section className="cinematic-panel-content" aria-labelledby="skills-title">
        <p className="panel-status"><span /> PIT LANE / CAPABILITY</p>
        <h2 id="skills-title">The <em>race crew.</em></h2>
        <p className="panel-lede">A focused stack for product thinking, responsive interfaces, and dependable systems.</p>
        <div className="skill-wall">
          {skills.slice(0, 12).map((skill) => (
            <span key={skill.name}>{skill.name}</span>
          ))}
        </div>
        <p className="pit-note">DEPLOYMENT DELTA: 2.14S / CONTINUOUSLY OPTIMIZED</p>
      </section>
    );
  } else if (activeSectorId === "sector-finish") {
    panel = (
      <section className="cinematic-panel-content" aria-labelledby="finish-title">
        <p className="panel-status"><span /> CHEQUERED FLAG / FINISH</p>
        <h2 id="finish-title">Ready for the <em>next race.</em></h2>
        <p className="panel-lede">Bring performance-minded engineering to your next product and let&apos;s make the work memorable.</p>
        <div className="panel-actions">
          <a className="panel-primary" style={{ backgroundColor: team.accent, boxShadow: `0 16px 32px rgba(${team.accentRgb}, 0.28)` }} href={`mailto:${contactInfo.email}`}>START A CONVERSATION</a>
          {contactInfo.resumeLink && <a className="panel-text-link" href={contactInfo.resumeLink}>RESUME</a>}
        </div>
      </section>
    );
  }

  return (
    <div className={`cinematic-panel-wrap panel-placement-${placement}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSectorId}
          className="cinematic-panel"
          initial={{ opacity: 0, x: fromRight ? 42 : -42, y: 24, scale: 0.955, filter: "blur(8px)" }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: fromRight ? 26 : -26, y: -18, scale: 0.985, filter: "blur(5px)" }}
          transition={panelTransition}
        >
          <div className="panel-index" style={{ color: team.accent }}>
            {panelNumber.toString().padStart(2, "0")}
          </div>
          {panel}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
