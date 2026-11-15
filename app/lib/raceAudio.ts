import { race } from "@/app/components/scene/circuit";

/**
 * Trackside sound, synthesised live with the Web Audio API — no audio files
 * to download or license:
 *   • a grandstand crowd that swells as the car goes by and at each new sector
 *   • an occasional air horn
 *   • a British broadcast-style commentator (browser speech synthesis)
 *
 * Browsers only allow audio to start from a user gesture, so construct this
 * inside a click handler.
 */
export class RaceAudio {
  private ctx: AudioContext;
  private master: GainNode;
  private crowdGain: GainNode;
  private sources: AudioScheduledSourceNode[] = [];
  private timer: ReturnType<typeof setInterval>;
  private speed = 0;
  private hype = 0.3;
  private covered = false;
  private speechTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const ctx = new AudioContext();
    this.ctx = ctx;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.ratio.value = 5;
    compressor.connect(ctx.destination);

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(compressor);
    this.master.gain.setTargetAtTime(0.55, ctx.currentTime, 0.6); // fade in

    const noise = this.makeNoiseBuffer();

    /* ── crowd ──────────────────────────────────────────────── */
    this.crowdGain = ctx.createGain();
    this.crowdGain.gain.value = 0.1;
    this.crowdGain.connect(this.master);
    const crowdSource = this.loop(noise, 0.83);
    // two formant-ish bands turn hiss into a distant "aaah"
    for (const [frequency, q, level] of [
      [620, 0.8, 1],
      [1450, 1.4, 0.45],
      [2600, 2, 0.14],
    ]) {
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = frequency;
      band.Q.value = q;
      const gain = ctx.createGain();
      gain.gain.value = level;
      crowdSource.connect(band).connect(gain).connect(this.crowdGain);
    }

    this.timer = setInterval(() => this.update(), 40);
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  private makeNoiseBuffer() {
    const length = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // pink-ish noise (Paul Kellet's economy filter) sounds far less harsh than white
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.22;
    }
    return buffer;
  }

  private loop(buffer: AudioBuffer, rate = 1) {
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.playbackRate.value = rate;
    source.start();
    this.sources.push(source);
    return source;
  }

  private onVisibility = () => {
    if (document.hidden) void this.ctx.suspend();
    else void this.ctx.resume();
  };

  private update() {
    const now = this.ctx.currentTime;

    // 0 = parked, 1 = flat out — only used to excite the crowd
    const target = Math.min(1, Math.abs(race.speed) * 5.5);
    this.speed += (target - this.speed) * (target > this.speed ? 0.22 : 0.05);
    const v = this.speed;

    // crowd: a restless murmur that rises with the car and after each cheer
    this.hype += (Math.max(0.18, v) - this.hype) * 0.02;
    const murmur = 0.5 + 0.25 * Math.sin(now * 0.7) + 0.18 * Math.sin(now * 1.9 + 1) + 0.07 * Math.sin(now * 4.3);
    this.crowdGain.gain.setTargetAtTime(0.05 + 0.07 * murmur + 0.3 * this.hype, now, 0.25);
  }

  /** Crowd roar (and sometimes an air horn) — call when something happens on track. */
  cheer(strength = 1) {
    this.hype = Math.min(1.2, this.hype + 0.55 * strength);
    if (Math.random() < 0.45) this.airHorn();
  }

  private airHorn() {
    const ctx = this.ctx;
    const start = ctx.currentTime + 0.2 + Math.random() * 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.07, start + 0.04);
    gain.gain.setValueAtTime(0.07, start + 0.5);
    gain.gain.linearRampToValueAtTime(0, start + 0.75);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1700;
    filter.connect(gain).connect(this.master);
    for (const pitch of [349, 440]) {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = pitch;
      osc.connect(filter);
      osc.start(start);
      osc.stop(start + 0.8);
    }
  }

  /** Short two-tone blip, like a broadcast cutting to team radio. */
  private radioBlip() {
    const ctx = this.ctx;
    const start = ctx.currentTime;
    [1175, 1568].forEach((pitch, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = pitch;
      const at = start + i * 0.09;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.09, at + 0.01);
      gain.gain.linearRampToValueAtTime(0, at + 0.08);
      osc.connect(gain).connect(this.master);
      osc.start(at);
      osc.stop(at + 0.1);
    });
  }

  /** Commentary line in a British voice where the device has one. */
  say(text: string, delay = 650) {
    if (typeof speechSynthesis === "undefined") return;
    if (this.speechTimer) clearTimeout(this.speechTimer);
    // wait a beat so scrolling quickly through sectors doesn't stack lines
    this.speechTimer = setTimeout(() => {
      if (this.covered) return;
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      const british =
        voices.find((voice) => /en[-_]GB/i.test(voice.lang) && /male|daniel|george|ryan|arthur/i.test(voice.name)) ??
        voices.find((voice) => /en[-_]GB/i.test(voice.lang));
      if (british) utterance.voice = british;
      utterance.lang = "en-GB";
      utterance.rate = 1.12;
      utterance.pitch = 1.02;
      utterance.volume = 0.95;
      this.radioBlip();
      speechSynthesis.speak(utterance);
    }, delay);
  }

  /** Fade everything out while the resume page covers the circuit. */
  setCovered(covered: boolean) {
    this.covered = covered;
    this.master.gain.setTargetAtTime(covered ? 0 : 0.55, this.ctx.currentTime, 0.35);
    if (covered && typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  }

  dispose() {
    clearInterval(this.timer);
    if (this.speechTimer) clearTimeout(this.speechTimer);
    document.removeEventListener("visibilitychange", this.onVisibility);
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    this.sources.forEach((source) => {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    });
    void this.ctx.close();
  }
}
