"use client";

import { useEffect, useRef, useState } from "react";

const LIGHT_INTERVAL = 800; // ms between each red coming on
const FIRST_LIGHT = 700;

/**
 * Race-start intro: the five reds come on one at a time, hold for a random
 * beat as they do at a real start, then all go out and the curtain lifts
 * onto the grid.
 *
 * Each light has its beep, and lights-out has the higher start tone. Browsers
 * will not play any sound until the visitor has interacted with the page, so
 * the tones are heard from the first click, tap or key press onward; without
 * one the countdown still runs, silently.
 */
export default function IntroLights() {
  const [lit, setLit] = useState(0);
  const [out, setOut] = useState(false);
  const [lift, setLift] = useState(false);
  const [done, setDone] = useState(false);
  const [soundReady, setSoundReady] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const skip = setTimeout(() => setDone(true), 0);
      return () => clearTimeout(skip);
    }

    const audio = new AudioContext();
    audioRef.current = audio;

    const tone = (frequency: number, duration: number, level: number) => {
      if (audio.state !== "running") return;
      const now = audio.currentTime;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "square";
      osc.frequency.value = frequency;
      // a square wave through a low-pass is close to the trackside start beep
      const filter = audio.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = frequency * 3;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(level, now + 0.008);
      gain.gain.setValueAtTime(level, now + duration - 0.03);
      gain.gain.linearRampToValueAtTime(0, now + duration);
      osc.connect(filter).connect(gain).connect(audio.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    };

    const unlock = () => {
      void audio.resume().then(() => setSoundReady(true));
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    if (audio.state === "running") unlock();

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= 5; i++) {
      timers.push(
        setTimeout(() => {
          setLit(i);
          tone(440, 0.18, 0.11);
        }, FIRST_LIGHT + (i - 1) * LIGHT_INTERVAL)
      );
    }
    // the hold before lights-out is random, so nobody can jump the start
    const lightsOut = FIRST_LIGHT + 4 * LIGHT_INTERVAL + 900 + Math.random() * 1100;
    timers.push(
      setTimeout(() => {
        setOut(true);
        tone(880, 0.55, 0.13);
      }, lightsOut)
    );
    timers.push(setTimeout(() => setLift(true), lightsOut + 380));

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      // let the start tone ring out before closing
      setTimeout(() => void audio.close(), 900);
    };
  }, []);

  if (done) return null;

  return (
    <div
      className="intro-lights"
      data-lift={lift}
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.animationName === "intro-curtain") setDone(true);
      }}
    >
      <div className="intro-gantry" data-out={out}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} data-on={i <= lit} />
        ))}
      </div>
      <p className="intro-title">
        <b>01</b> ADITYA / PORTFOLIO
      </p>
      <p className="intro-hint" data-hidden={soundReady || out}>
        TAP OR PRESS ANY KEY FOR SOUND
      </p>
      <i className="intro-chequer" />
    </div>
  );
}
