"use client";

import { useTeam } from "@/app/context/TeamContext";

interface F1CarProps {
  size?: number;
  className?: string;
}

export default function F1Car({ size = 40, className = "" }: F1CarProps) {
  const { team } = useTeam();

  return (
    <svg
      width={size}
      height={size * 0.4}
      viewBox="0 0 100 40"
      className={`f1-car ${className}`}
      style={{ overflow: "visible" }}
    >
      {/* Car body */}
      <path
        d="M15 22 L5 22 L2 20 L5 18 L15 16 L30 14 L50 12 L70 11 L85 12 L92 14 L95 17 L98 20 L95 23 L92 26 L85 28 L70 29 L50 28 L30 26 L15 24 Z"
        fill={team.accent}
        opacity={0.9}
      />
      {/* Cockpit */}
      <path
        d="M42 14 L55 13 L58 14 L58 18 L42 18 Z"
        fill="#1A1A1A"
        stroke={team.accent}
        strokeWidth={0.5}
      />
      {/* Front wing */}
      <path
        d="M2 18 L8 16 L8 24 L2 22 Z"
        fill={team.accent}
      />
      {/* Rear wing */}
      <rect x="90" y="10" width="3" height="20" rx="1" fill={team.accent} />
      <rect x="88" y="8" width="7" height="3" rx="1" fill={team.accent} opacity={0.8} />
      <rect x="88" y="29" width="7" height="3" rx="1" fill={team.accent} opacity={0.8} />
      {/* Front wheel */}
      <ellipse cx="20" cy="20" rx="6" ry="7" fill="#1A1A1A" stroke="#333" strokeWidth={1} />
      <ellipse cx="20" cy="20" rx="3" ry="3.5" fill="#2A2A2A" />
      {/* Rear wheel */}
      <ellipse cx="78" cy="20" rx="7" ry="8" fill="#1A1A1A" stroke="#333" strokeWidth={1} />
      <ellipse cx="78" cy="20" rx="3.5" ry="4" fill="#2A2A2A" />
      {/* Team stripe */}
      <rect x="30" y="18" width="35" height="4" rx="1" fill={team.secondary} opacity={0.6} />
      {/* Glow effect */}
      <ellipse
        cx="50"
        cy="20"
        rx="45"
        ry="15"
        fill="none"
        stroke={team.accent}
        strokeWidth={0.3}
        opacity={0.2}
      />
    </svg>
  );
}
