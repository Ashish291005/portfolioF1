"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { projects } from "@/app/data/portfolio";
import { useTeam } from "@/app/context/TeamContext";
import TeamSelector from "./components/TeamSelector";
import CinematicPanels from "./components/CinematicPanels";
import F1Canvas3D from "./components/F1Canvas3D";

export default function Home() {
  const { team } = useTeam();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSectorId, setActiveSectorId] = useState("hero");
  const tickingRef = useRef(false);

  // Handle scroll calculation and active sector detection
  const updateScrollState = useCallback(() => {
    const totalHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (totalHeight > 0) {
      const currentScroll = window.scrollY;
      const progress = Math.max(0, Math.min(1, currentScroll / totalHeight));

      setScrollProgress((prev) =>
        Math.abs(prev - progress) > 0.0005 ? progress : prev
      );
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
    const initialFrame = requestAnimationFrame(updateScrollState);
    return () => {
      cancelAnimationFrame(initialFrame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [onScroll, updateScrollState]);

  // Smooth navigate to sector
  const navigateToSector = (sectorId: string) => {
    const el = document.getElementById(sectorId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="race-shell">
      <div className="cinematic-canvas">
        <F1Canvas3D scrollProgress={scrollProgress} />
      </div>
      <div className="race-vignette" />

      <header className="aero-hud">
        <button className="driver-mark" onClick={() => navigateToSector("hero")} aria-label="Return to the start grid">
          <span style={{ color: team.accent }}>01</span>
          <span>ADITYA / PORTFOLIO</span>
        </button>
        <div className="hud-readout"><i style={{ backgroundColor: team.accent }} /> LIVE CIRCUIT / {Math.round(scrollProgress * 100).toString().padStart(3, "0")}%</div>
        <div className="hud-livery"><TeamSelector /></div>
      </header>

      <CinematicPanels activeSectorId={activeSectorId} onNavigateToSector={navigateToSector} />

      <div className="race-progress" aria-hidden="true">
        <span style={{ height: `${scrollProgress * 100}%`, backgroundColor: team.accent }} />
      </div>

      <main className="lap-scroll" aria-label="Portfolio race lap">
        <section id="hero" aria-label="Start grid" />
        <section id="sector-1" aria-label="About" />
        {projects.map((project, index) => <section key={project.id} id={`sector-${index + 2}`} aria-label={project.title} />)}
        <section id="sector-pit" aria-label="Skills" />
        <section id="sector-finish" aria-label="Contact" />
        <section id="sector-resume" className="resume-page" aria-label="Resume">
          <div className="resume-empty-shell">
            <span>RESUME BAY</span>
            <h2>Resume section reserved.</h2>
          </div>
        </section>
      </main>
    </div>
  );
}
