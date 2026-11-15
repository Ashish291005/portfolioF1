"use client";

import { useTeam } from "@/app/context/TeamContext";
import TeamSelector from "./TeamSelector";
import { driverProfile } from "@/app/data/portfolio";
import F1Car from "./F1Car";

interface HeroSectionProps {
  onStartLap: () => void;
}

export default function HeroSection({ onStartLap }: HeroSectionProps) {
  const { team } = useTeam();

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center items-start pt-20 pb-12 px-4 sm:px-8 max-w-4xl"
    >
      {/* Race Control Status */}
      <div className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-sm bg-[var(--surface)] border border-[var(--border-subtle)]">
        <span className="w-2 h-2 rounded-full bg-[var(--telemetry-green)] animate-pulse" />
        <span className="telemetry-label text-[11px] text-[var(--text-primary)]">
          SESSION STATUS: GREEN FLAG // FORMULA 1 PORTFOLIO
        </span>
      </div>

      {/* Driver Title & Number */}
      <div className="flex items-baseline gap-4 mb-2">
        <span
          className="text-4xl sm:text-6xl font-black tracking-tighter text-transparent bg-clip-text"
          style={{
            backgroundImage: `linear-gradient(135deg, var(--text-primary) 30%, ${team.accent} 100%)`,
            fontFamily: "var(--font-orbitron), sans-serif",
          }}
        >
          {driverProfile.name}
        </span>
        <span
          className="text-2xl sm:text-4xl font-mono font-bold"
          style={{ color: team.accent }}
        >
          #{driverProfile.number}
        </span>
      </div>

      {/* Role Subtitle */}
      <h2
        className="text-xl sm:text-2xl font-semibold mb-6 tracking-wide"
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
          color: "var(--text-secondary)",
        }}
      >
        {driverProfile.title.toUpperCase()}
      </h2>

      <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed mb-8">
        Welcome to the race telemetry control center. Choose your constructor team theme below and navigate through track sectors to explore projects, technical specs, and career achievements.
      </p>

      {/* Inline Team Selector Card */}
      <div className="w-full p-6 rounded-lg bg-[var(--surface)] border border-[var(--border-subtle)] glow-border mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="telemetry-label text-xs">CONSTRUCTOR LIVERY SELECTION</span>
          </div>
          <span className="text-xs font-mono text-[var(--accent)] font-semibold uppercase">
            ACTIVE: {team.name}
          </span>
        </div>

        <TeamSelector />

        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-mono">
          <span>PRIMARY ACCENT: {team.accent}</span>
          <div className="flex items-center gap-2">
            <span>MODEL:</span>
            <F1Car size={36} />
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={onStartLap}
          className="flex items-center gap-3 px-6 py-3.5 rounded font-mono text-sm font-bold uppercase tracking-wider text-[var(--background)] transition-all duration-300 transform hover:scale-105"
          style={{
            backgroundColor: team.accent,
            boxShadow: `0 0 20px rgba(${team.accentRgb}, 0.4)`,
          }}
        >
          <span>START HOT LAP</span>
          <svg
            className="w-4 h-4 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>

        <a
          href="#contact"
          className="px-6 py-3.5 rounded font-mono text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)] bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all duration-300"
        >
          PITS / RESUME
        </a>
      </div>
    </section>
  );
}
