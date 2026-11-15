"use client";

import { useTeam } from "@/app/context/TeamContext";

interface SectorNavProps {
  activeSectorId: string;
  onNavigateToSector: (sectorId: string) => void;
  projectsCount: number;
}

export default function SectorNav({
  activeSectorId,
  onNavigateToSector,
  projectsCount,
}: SectorNavProps) {
  const { team } = useTeam();

  const sectors = [
    { id: "hero", label: "GRID // HERO" },
    { id: "sector-1", label: "TURN 1 // SPECS" },
    ...Array.from({ length: projectsCount }, (_, i) => ({
      id: `sector-${i + 2}`,
      label: `TURN ${i + 2} // PROJECT`,
    })),
    { id: "sector-pit", label: "PIT STOP // SKILLS" },
    { id: "sector-finish", label: "FINISH // CONTACT" },
  ];

  return (
    <nav className="sector-nav" aria-label="Track Sectors Navigation">
      {sectors.map((sec) => {
        const isActive = activeSectorId === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => onNavigateToSector(sec.id)}
            className="sector-dot group"
            data-active={isActive}
            data-label={sec.label}
            aria-label={`Navigate to ${sec.label}`}
            style={{
              backgroundColor: isActive ? team.accent : undefined,
              boxShadow: isActive ? `0 0 12px ${team.accent}` : undefined,
            }}
          />
        );
      })}
    </nav>
  );
}
