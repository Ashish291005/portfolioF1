"use client";

import { useTeam } from "@/app/context/TeamContext";
import { driverProfile } from "@/app/data/portfolio";

export default function DriverSpecs() {
  const { team } = useTeam();

  return (
    <section id="sector-1" className="section-content max-w-4xl">
      {/* Sector Badge */}
      <div className="sector-header">
        SECTOR 1 // TURN 1 — DRIVER SPECS & OVERVIEW
      </div>

      <h2
        className="text-3xl sm:text-4xl font-extrabold mb-8 tracking-tight"
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
          color: "var(--text-primary)",
        }}
      >
        ABOUT THE DRIVER
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch mb-10">
        {/* Avatar Graphic / Telemetry Frame */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-lg bg-[var(--surface)] border border-[var(--border-subtle)] glow-border relative group">
          <div className="w-36 h-36 rounded-full border-2 border-[var(--border-subtle)] flex items-center justify-center relative overflow-hidden bg-[#111] mb-4">
            {/* Holographic grid placeholder */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--accent)] via-transparent to-transparent" />
            <svg
              className="w-20 h-20 text-[var(--text-secondary)] opacity-60 group-hover:scale-110 transition-transform duration-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <div
              className="absolute bottom-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold"
              style={{ backgroundColor: team.accent, color: "var(--background)" }}
            >
              DRIVER #{driverProfile.number}
            </div>
          </div>

          <div className="text-center font-mono">
            <div
              className="text-sm font-bold tracking-wider"
              style={{
                fontFamily: "var(--font-orbitron), sans-serif",
                color: "var(--text-primary)",
              }}
            >
              {driverProfile.name}
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              {driverProfile.title}
            </div>
          </div>
        </div>

        {/* Bio Text */}
        <div className="md:col-span-8 flex flex-col justify-between p-6 rounded-lg bg-[var(--surface)] border border-[var(--border-subtle)]">
          <div>
            <div className="telemetry-label mb-3">BIOGRAPHY & MISSION</div>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-4">
              {driverProfile.bio}
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Specializing in high-throughput frontend architectures, real-time reactive interfaces, and scalable full-stack applications. Like an F1 engineer tuning every aerodynamics winglet, I obsess over every millisecond of performance and every pixel of craft.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--text-secondary)]">STATUS: RACE READY</span>
            <span style={{ color: team.accent }}>100% TELEMETRY OK</span>
          </div>
        </div>
      </div>

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {driverProfile.stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-lg bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all duration-300 group"
          >
            <div className="telemetry-label mb-2 group-hover:text-[var(--accent)] transition-colors">
              {stat.label}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="telemetry-value text-2xl sm:text-3xl">
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-xs font-mono text-[var(--accent)]">
                  {stat.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
