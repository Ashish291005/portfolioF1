"use client";

import { useTeam } from "@/app/context/TeamContext";
import F1Car from "./F1Car";

interface MobileTimelineProps {
  activeSectorId: string;
  onNavigateToSector: (sectorId: string) => void;
  projectsCount: number;
}

export default function MobileTimeline({
  activeSectorId,
  onNavigateToSector,
  projectsCount,
}: MobileTimelineProps) {
  const { team } = useTeam();

  const sectors = [
    { id: "hero", label: "START GRID", turn: "GRID" },
    { id: "sector-1", label: "DRIVER SPECS", turn: "T1" },
    ...Array.from({ length: projectsCount }, (_, i) => ({
      id: `sector-${i + 2}`,
      label: `PROJECT ${i + 1}`,
      turn: `T${i + 2}`,
    })),
    { id: "sector-pit", label: "PIT STOP", turn: "PIT" },
    { id: "sector-finish", label: "FINISH LINE", turn: "FINISH" },
  ];

  return (
    <div className="lg:hidden w-full bg-[var(--surface)] border-b border-[var(--border-subtle)] px-4 py-3 sticky top-14 z-30 flex items-center justify-between overflow-x-auto gap-3 no-scrollbar">
      <div className="flex items-center gap-2 shrink-0">
        <F1Car size={32} />
        <span className="text-[10px] font-mono text-[var(--accent)] font-bold uppercase">
          PIT WALL:
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {sectors.map((sec) => {
          const isActive = activeSectorId === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => onNavigateToSector(sec.id)}
              className="px-2.5 py-1 rounded text-[10px] font-mono font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-1"
              style={{
                backgroundColor: isActive ? team.accent : "var(--surface-elevated)",
                color: isActive ? "var(--background)" : "var(--text-secondary)",
                border: `1px solid ${isActive ? team.accent : "var(--border-subtle)"}`,
              }}
            >
              <span className="opacity-75">{sec.turn}</span>
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
