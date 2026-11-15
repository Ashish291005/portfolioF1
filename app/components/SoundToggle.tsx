"use client";

import { useEffect, useRef, useState } from "react";
import { driverProfile, projects } from "@/app/data/portfolio";
import { RaceAudio } from "@/app/lib/raceAudio";

interface SoundToggleProps {
  activeSectorId: string;
  /** True while the resume page covers the circuit. */
  covered: boolean;
}

const driver = driverProfile.name.charAt(0) + driverProfile.name.slice(1).toLowerCase();

/** What the commentator says as each sector comes up. */
function commentaryFor(sectorId: string): string | null {
  if (sectorId === "hero") {
    return `Good evening, and welcome to the Portfolio Grand Prix, live under the lights here in Great Britain. On pole position, car number one, ${driver}.`;
  }
  if (sectorId === "sector-1") {
    return `It's lights out and away we go! A clean getaway for ${driver}. Let's take a closer look at the driver.`;
  }
  if (sectorId === "sector-pit") {
    return `And ${driver} dives into the pit lane. Let's see what the crew are working with.`;
  }
  if (sectorId === "sector-finish") {
    return `Chequered flag! ${driver} takes the win. What a lap that was. Get in touch before the next race.`;
  }
  const project = projects[Number(sectorId.replace("sector-", "")) - 2];
  if (!project) return null;
  const stack = project.tech.slice(0, 3).join(", ");
  return `Through ${project.sector.toLowerCase()} now, and this is ${project.title}. Built with ${stack}.`;
}

export default function SoundToggle({ activeSectorId, covered }: SoundToggleProps) {
  // Sound is on by default. Browsers refuse to play audio until the visitor
  // interacts with the page, so it actually starts on their first click, tap
  // or key press (see the effect below).
  const [enabled, setEnabled] = useState(true);
  const audioRef = useRef<RaceAudio | null>(null);
  const sectorRef = useRef(activeSectorId);
  const coveredRef = useRef(covered);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const start = () => {
    if (audioRef.current) return;
    const audio = new RaceAudio();
    audioRef.current = audio;
    audio.setCovered(coveredRef.current);
    const line = commentaryFor(sectorRef.current);
    if (line) audio.say(line, 250);
  };

  const toggle = () => {
    if (enabled) {
      audioRef.current?.dispose();
      audioRef.current = null;
      setEnabled(false);
    } else {
      start(); // inside the click, so the browser allows it
      setEnabled(true);
    }
  };

  // While sound is wanted but not yet running, start it on the first gesture
  // anywhere on the page (the toggle button handles its own clicks).
  useEffect(() => {
    if (!enabled || audioRef.current) return;
    const onGesture = (event: Event) => {
      if (buttonRef.current?.contains(event.target as Node)) return;
      start();
      remove();
    };
    const remove = () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("touchend", onGesture);
    };
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    window.addEventListener("touchend", onGesture);
    return remove;
  }, [enabled]);

  // new sector → crowd reacts and the commentator picks it up
  useEffect(() => {
    if (sectorRef.current === activeSectorId) return;
    sectorRef.current = activeSectorId;
    const audio = audioRef.current;
    if (!audio) return;
    audio.cheer(activeSectorId === "sector-finish" ? 1.6 : 1);
    const line = commentaryFor(activeSectorId);
    if (line) audio.say(line);
  }, [activeSectorId]);

  useEffect(() => {
    coveredRef.current = covered;
    audioRef.current?.setCovered(covered);
  }, [covered]);

  useEffect(
    () => () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    },
    []
  );

  return (
    <button
      ref={buttonRef}
      type="button"
      className="sound-toggle"
      data-on={enabled}
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn trackside sound off" : "Turn trackside sound on"}
    >
      <span className="sound-bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>{enabled ? "SOUND ON" : "SOUND OFF"}</span>
    </button>
  );
}
