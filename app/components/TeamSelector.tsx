"use client";

import { useTeam } from "@/app/context/TeamContext";
import { teams, type TeamId } from "@/app/data/portfolio";

export default function TeamSelector() {
  const { teamId, setTeam } = useTeam();

  const teamList: TeamId[] = ["mercedes", "ferrari", "redbull"];

  return (
    <div className="flex gap-3">
      {teamList.map((id) => {
        const t = teams[id];
        const isActive = teamId === id;

        return (
          <button
            key={id}
            onClick={() => setTeam(id)}
            data-active={isActive}
            className="team-btn group"
            style={
              {
                "--btn-accent": t.accent,
                "--btn-accent-rgb": t.accentRgb,
              } as React.CSSProperties
            }
            aria-label={`Select ${t.name} team theme`}
            aria-pressed={isActive}
          >
            {/* Team color indicator */}
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-sm transition-shadow duration-300"
                style={{
                  background: t.accent,
                  boxShadow: isActive
                    ? `0 0 12px ${t.accent}80`
                    : "none",
                }}
              />
              <span
                className="text-xs font-bold tracking-widest uppercase transition-colors duration-300"
                style={{
                  fontFamily: "var(--font-orbitron), sans-serif",
                  color: isActive ? t.accent : "var(--text-secondary)",
                }}
              >
                {t.name}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
