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
