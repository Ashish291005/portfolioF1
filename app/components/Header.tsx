"use client";

import { useTeam } from "@/app/context/TeamContext";
import TeamSelector from "./TeamSelector";
import { driverProfile } from "@/app/data/portfolio";

export default function Header() {
  const { team } = useTeam();

  return (
    <header className="header-bar border-b border-[var(--border-subtle)]">
      {/* Driver Badge */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-7 h-7 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] font-mono text-xs font-bold"
          style={{ color: team.accent }}
        >
          #{driverProfile.number}
        </div>
        <div className="flex flex-col">
          <span
            className="text-xs font-bold tracking-wider uppercase"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              color: "var(--text-primary)",
            }}
          >
            {driverProfile.name}
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] font-mono">
            {driverProfile.title}
          </span>
        </div>
      </div>

      {/* Live Status Telemetry Indicator */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border-subtle)]">
        <span className="relative flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: team.accent }}
          ></span>
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: team.accent }}
          ></span>
        </span>
        <span className="text-[10px] font-mono text-[var(--telemetry-green)] uppercase tracking-wider">
          PIT WALL: LIVE
        </span>
      </div>

      {/* Team Selection Quick Toggle */}
      <div className="scale-90 origin-right">
        <TeamSelector />
      </div>
    </header>
  );
}
