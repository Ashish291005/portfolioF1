"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { teams, type TeamId, type Team } from "@/app/data/portfolio";

interface TeamContextValue {
  team: Team;
  teamId: TeamId;
  setTeam: (id: TeamId) => void;
}

const TeamContext = createContext<TeamContextValue | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teamId, setTeamId] = useState<TeamId>("redbull");

  // Load saved team from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("f1port-team") as TeamId | null;
    if (saved && teams[saved]) {
      setTeamId(saved);
    }
  }, []);

  // Apply CSS custom properties when team changes
  useEffect(() => {
    const team = teams[teamId];
    const root = document.documentElement;
    root.style.setProperty("--accent", team.accent);
    root.style.setProperty("--accent-rgb", team.accentRgb);
    root.style.setProperty("--accent-secondary", team.secondary);
    root.style.setProperty("--car-color", team.carColor);
    // Text on top of the team colour: dark on light liveries, white on dark ones
    const [r, g, b] = team.accentRgb.split(",").map((part) => {
      const c = Number(part) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    root.style.setProperty("--on-accent", luminance > 0.22 ? "#05080d" : "#ffffff");
  }, [teamId]);

  const setTeam = useCallback((id: TeamId) => {
    setTeamId(id);
    localStorage.setItem("f1port-team", id);
  }, []);

  return (
    <TeamContext.Provider value={{ team: teams[teamId], teamId, setTeam }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used within TeamProvider");
  return ctx;
}
