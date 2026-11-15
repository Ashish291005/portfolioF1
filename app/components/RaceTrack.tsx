"use client";

import { useEffect, useRef, useState } from "react";
import { useTeam } from "@/app/context/TeamContext";
import F1Car from "./F1Car";

interface SectorPoint {
  id: string;
  name: string;
  turnNumber: number;
  progress: number;
}

interface RaceTrackProps {
  activeSectorId: string;
  onNavigateToSector: (sectorId: string) => void;
  projectsCount: number;
  scrollProgress: number;
}

export default function RaceTrack({
  activeSectorId,
  onNavigateToSector,
  projectsCount,
  scrollProgress,
}: RaceTrackProps) {
  const { team } = useTeam();
  const pathRef = useRef<SVGPathElement>(null);
  const [carTransform, setCarTransform] = useState({
    x: 100,
    y: 80,
    angle: 0,
  });
  const [sectorCoords, setSectorCoords] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const trackPathD =
    "M 100,80 C 180,50 300,60 340,120 C 370,170 320,240 280,260 C 230,280 180,220 150,280 C 120,340 180,420 280,440 C 350,450 380,380 340,320 C 300,270 260,330 220,360 C 180,390 90,340 80,240 C 70,140 60,110 100,80 Z";

  const sectors: SectorPoint[] = [
    { id: "hero", name: "GRID", turnNumber: 0, progress: 0.05 },
    { id: "sector-1", name: "TURN 1", turnNumber: 1, progress: 0.2 },
    ...Array.from({ length: projectsCount }, (_, i) => ({
      id: `sector-${i + 2}`,
      name: `TURN ${i + 2}`,
      turnNumber: i + 2,
      progress: 0.35 + (i * 0.35) / Math.max(1, projectsCount),
    })),
    { id: "sector-pit", name: "PIT", turnNumber: projectsCount + 2, progress: 0.82 },
    { id: "sector-finish", name: "FINISH", turnNumber: projectsCount + 3, progress: 0.95 },
  ];

  // Calculate sector marker coordinates after mount
  useEffect(() => {
    if (!pathRef.current) return;
    try {
      const path = pathRef.current;
      const length = path.getTotalLength();
      const coords: Record<string, { x: number; y: number }> = {};

      sectors.forEach((sec) => {
        const pt = path.getPointAtLength(sec.progress * length);
        coords[sec.id] = { x: pt.x, y: pt.y };
      });

      setSectorCoords(coords);
    } catch {
      // Ignore fallback
    }
  }, [projectsCount]);

  // Update car position along SVG path based on scrollProgress
  useEffect(() => {
    if (!pathRef.current) return;

    try {
      const path = pathRef.current;
      const pathLength = path.getTotalLength();
      const clamped = Math.max(0, Math.min(1, scrollProgress));
      const targetLength = clamped * pathLength;

      const point = path.getPointAtLength(targetLength);
      const delta = 2;
      const nextPoint = path.getPointAtLength(
        Math.min(pathLength, targetLength + delta)
      );

      const dx = nextPoint.x - point.x;
      const dy = nextPoint.y - point.y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      setCarTransform({
        x: point.x,
        y: point.y,
        angle: angle,
      });
    } catch {
      // Fallback
    }
  }, [scrollProgress]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative">
      {/* Telemetry Circuit Header */}
      <div className="absolute top-6 left-6 flex items-center gap-2 font-mono text-[10px] text-[var(--text-secondary)]">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: team.accent }}
        />
        <span>CIRCUIT TELEMETRY MAP // GRAND PRIX</span>
      </div>

      {/* SVG Race Track */}
      <svg
        viewBox="0 0 450 500"
        className="w-full max-h-[70vh] overflow-visible select-none"
      >
        <defs>
          <filter id="track-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Track Outline Background */}
        <path
          d={trackPathD}
          className="track-path"
          strokeWidth="12"
          stroke="#1E1E1E"
        />

        {/* Track Main Line */}
        <path
          d={trackPathD}
          className="track-path"
          strokeWidth="4"
          stroke="#2A2A2A"
        />

        {/* Active Animated Track Path Fill */}
        <path
          ref={pathRef}
          d={trackPathD}
          className="track-path-active"
          stroke={team.accent}
          strokeWidth="4"
        />

        {/* Sector Markers on SVG Track */}
        {sectors.map((sec) => {
          const pt = sectorCoords[sec.id];
          if (!pt) return null;
          const isActive = activeSectorId === sec.id;

          return (
            <g
              key={sec.id}
              className="cursor-pointer"
              onClick={() => onNavigateToSector(sec.id)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isActive ? 8 : 5}
                className="track-sector-marker"
                data-active={isActive}
                style={{
                  fill: isActive ? team.accent : "#333",
                  stroke: isActive ? "#FFF" : "none",
                  strokeWidth: 1.5,
                }}
              />
              <text
                x={pt.x + 12}
                y={pt.y + 4}
                fill={isActive ? team.accent : "#777"}
                fontSize="10"
                fontFamily="var(--font-orbitron), sans-serif"
                fontWeight="700"
                className="select-none pointer-events-none"
              >
                {sec.name}
              </text>
            </g>
          );
        })}

        {/* F1 Car Positioned on Track Path */}
        <g
          transform={`translate(${carTransform.x}, ${carTransform.y}) rotate(${carTransform.angle})`}
          style={{ transition: "transform 0.1s linear" }}
        >
          <g transform="translate(-20, -8)">
            <F1Car size={40} />
          </g>
        </g>
      </svg>

      {/* Sector Navigation Quick Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {sectors.map((sec) => {
          const isActive = activeSectorId === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => onNavigateToSector(sec.id)}
              className="px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all duration-300"
              style={{
                backgroundColor: isActive ? team.accent : "var(--surface)",
                color: isActive ? "var(--background)" : "var(--text-secondary)",
                border: `1px solid ${
                  isActive ? team.accent : "var(--border-subtle)"
                }`,
              }}
            >
              {sec.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
