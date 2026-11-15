"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { contactInfo, projects } from "@/app/data/portfolio";
import { useTeam } from "@/app/context/TeamContext";
import TeamSelector from "./components/TeamSelector";
import CinematicPanels from "./components/CinematicPanels";
import SoundToggle from "./components/SoundToggle";
import dynamic from "next/dynamic";
import { FINISH_SCROLL, SECTOR_IDS, race } from "./components/scene/circuit";

// The WebGL scene is client-only and heavy: keep it out of the server render
// and out of the initial JS bundle.
const F1Canvas3D = dynamic(() => import("./components/F1Canvas3D"), { ssr: false });

export default function Home() {
  const { team } = useTeam();
  const [activeSectorId, setActiveSectorId] = useState("hero");
  const [canvasCovered, setCanvasCovered] = useState(false);
  const tickingRef = useRef(false);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Handle scroll calculation and active sector detection
  const updateScrollState = useCallback(() => {
    const totalHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (totalHeight > 0) {
      const currentScroll = window.scrollY;
      const progress = Math.max(0, Math.min(1, currentScroll / totalHeight));

      // Scroll position goes to a mutable store and straight to the DOM —
      // never into React state — so scrolling does not re-render the page.
      const sectionHeight = document.getElementById("hero")?.offsetHeight || window.innerHeight;
      race.scroll = currentScroll / sectionHeight;
      if (readoutRef.current) {
        const lap = Math.round(Math.min(1, race.scroll / FINISH_SCROLL) * 100);
        readoutRef.current.textContent = lap.toString().padStart(3, "0");
      }
      progressRef.current?.style.setProperty("--lap", progress.toFixed(4));
    }

    // Once the resume page has scrolled over the whole viewport the 3D scene
    // is invisible, so stop rendering it.
    const resume = document.getElementById("sector-resume");
    if (resume) {
      const covered = resume.getBoundingClientRect().top <= 0;
      setCanvasCovered((prev) => (prev !== covered ? covered : prev));
    }

    // Determine active sector based on section viewport position
    const sectorIds = [
      "hero",
      "sector-1",
      ...projects.map((_, i) => `sector-${i + 2}`),
      "sector-pit",
      "sector-finish",
      "sector-resume",
    ];

    for (let i = sectorIds.length - 1; i >= 0; i--) {
      const el = document.getElementById(sectorIds[i]);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.45) {
          setActiveSectorId((prev) =>
            prev !== sectorIds[i] ? sectorIds[i] : prev
          );
          break;
        }
      }
    }

    tickingRef.current = false;
  }, []);

  const onScroll = useCallback(() => {
    if (!tickingRef.current) {
      tickingRef.current = true;
      requestAnimationFrame(updateScrollState);
    }
  }, [updateScrollState]);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    const initialFrame = requestAnimationFrame(updateScrollState);
    return () => {
      cancelAnimationFrame(initialFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onScroll, updateScrollState]);

  // Every stop on the lap, in order, for the previous / next buttons
  const checkpoints = [...SECTOR_IDS, "sector-resume"];
  const checkpointIndex = Math.max(0, checkpoints.indexOf(activeSectorId));

  // Smooth navigate to sector
  const navigateToSector = (sectorId: string | undefined) => {
    if (!sectorId) return;
    const el = document.getElementById(sectorId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="race-shell">
      <div className="cinematic-canvas">
        <F1Canvas3D activeSectorId={activeSectorId} paused={canvasCovered} />
      </div>
      <div className="race-vignette" />

      <header className="aero-hud">
        <button className="driver-mark" onClick={() => navigateToSector("hero")} aria-label="Return to the start grid">
          <span style={{ color: team.accent }}>01</span>
          <span>ADITYA / PORTFOLIO</span>
        </button>
        <div className="hud-readout"><i style={{ backgroundColor: team.accent }} /> LIVE CIRCUIT / <span ref={readoutRef}>000</span>%</div>
        <div className="hud-livery"><TeamSelector /></div>
      </header>

      <CinematicPanels activeSectorId={activeSectorId} onNavigateToSector={navigateToSector} />

      <SoundToggle activeSectorId={activeSectorId} covered={canvasCovered} />

      <nav className="race-nav" aria-label="Checkpoints">
        <button
          type="button"
          className="race-nav-btn"
          onClick={() => navigateToSector(checkpoints[checkpointIndex - 1])}
          disabled={checkpointIndex <= 0}
          aria-label="Previous checkpoint"
          title="Previous checkpoint"
        >
          <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 8 L6 4 L10 8" /></svg>
          <span>PREV</span>
        </button>
        <div className="race-progress" aria-hidden="true" ref={progressRef}>
          <span />
        </div>
        <button
          type="button"
          className="race-nav-btn"
          onClick={() => navigateToSector(checkpoints[checkpointIndex + 1])}
          disabled={checkpointIndex >= checkpoints.length - 1}
          aria-label="Next checkpoint"
          title="Next checkpoint"
        >
          <span>NEXT</span>
          <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4 L6 8 L10 4" /></svg>
        </button>
      </nav>

      <main className="lap-scroll" aria-label="Portfolio race lap">
        <section id="hero" aria-label="Start grid" />
        <section id="sector-1" aria-label="About" />
        {projects.map((project, index) => <section key={project.id} id={`sector-${index + 2}`} aria-label={project.title} />)}
        <section id="sector-pit" aria-label="Skills" />
        <section id="sector-finish" aria-label="Contact" />
        <section id="sector-resume" className="resume-page" aria-label="Resume">
          <div className="resume-shell">
            <header className="resume-head">
              <div>
                <span>RESUME BAY / DRIVER FILE</span>
                <h2>Resume</h2>
              </div>
              {contactInfo.resumeLink && (
                <div className="resume-actions">
                  <a href={contactInfo.resumeLink} target="_blank" rel="noreferrer">OPEN</a>
                  <a href={contactInfo.resumeLink} download>DOWNLOAD PDF</a>
                </div>
              )}
            </header>
            {contactInfo.resumeLink && (
              <iframe
                className="resume-frame"
                src={`${contactInfo.resumeLink}#view=FitH&toolbar=0`}
                title="Resume (PDF)"
                loading="lazy"
              />
            )}
            <p className="resume-fallback">
              PDF preview is hidden on small screens — use the buttons above to open or download it.
            </p>
            <p className="resume-credit">
              3D cars: 2026 Redbull RB22, 2026 Ferrari SF-26 and 2026 Mercedes W17 by{" "}
              <a href="https://sketchfab.com/Tyler_Dave" target="_blank" rel="noreferrer">Dave Love</a>, licensed under{" "}
              <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC-BY-4.0</a>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
