// Framework-agnostic Web Audio synth engine for placeholder soundboard sounds.
// Replace `SOUND_KINDS` recipes (or wire real audio files) as you build out.

export type SoundKind =
  | "airhorn"
  | "vineboom"
  | "bruh"
  | "bonk"
  | "oof"
  | "wow"
  | "sadviolin"
  | "applause";

interface ActiveVoice {
  sources: AudioScheduledSourceNode[];
  master: GainNode;
}

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private active: ActiveVoice | null = null;
  private volumeNode: GainNode | null = null;
  private volume = 1;

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new Ctor();
      this.volumeNode = this.ctx.createGain();
      this.volumeNode.gain.value = this.volume;
      this.volumeNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  /** Sets master output volume, 0..1. */
  setVolume(v: number): void {
    this.volume = Math.min(1, Math.max(0, v));
    if (this.volumeNode) this.volumeNode.gain.value = this.volume;
  }

  getVolume(): number {
    return this.volume;
  }

  private noiseBuffer(dur: number): AudioBuffer {
    const ctx = this.ctx!;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  /** Stops any currently-playing voice. Pass `silent` from internal retriggers. */
  stopAll(): void {
    if (this.active && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        const g = this.active.master.gain;
        g.cancelScheduledValues(now);
        g.setValueAtTime(Math.max(g.value, 0.0001), now);
        g.linearRampToValueAtTime(0.0001, now + 0.03);
      } catch {
        /* noop */
      }
      this.active.sources.forEach((s) => {
        try {
          s.stop(now + 0.05);
        } catch {
          /* noop */
        }
      });
      this.active = null;
    }
  }

  /** Play a sound. Cuts any previous sound (one voice at a time). Returns duration in seconds. */
  play(kind: SoundKind): number {
    const ctx = this.ensureCtx();
    this.stopAll();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(this.volumeNode!);
    const sources: AudioScheduledSourceNode[] = [];
    const P = master.gain;
    let dur = 0.5;

    const osc = (type: OscillatorType, freq: number) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      return o;
    };

    if (kind === "airhorn") {
      const o1 = osc("sawtooth", 392);
      const o2 = osc("sawtooth", 392);
      o2.detune.value = 10;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2400;
      o1.connect(lp);
      o2.connect(lp);
      lp.connect(master);
      const lfo = osc("sine", 6);
      const lg = ctx.createGain();
      lg.gain.value = 7;
      lfo.connect(lg);
      lg.connect(o1.frequency);
      lg.connect(o2.frequency);
      sources.push(o1, o2, lfo);
      dur = 0.62;
      P.setValueAtTime(0.0001, now);
      P.linearRampToValueAtTime(0.5, now + 0.02);
      P.setValueAtTime(0.5, now + 0.5);
      P.linearRampToValueAtTime(0.0001, now + dur);
    } else if (kind === "vineboom") {
      const o = osc("sine", 190);
      o.frequency.setValueAtTime(190, now);
      o.frequency.exponentialRampToValueAtTime(42, now + 0.55);
      o.connect(master);
      sources.push(o);
      dur = 0.85;
      P.setValueAtTime(0.0001, now);
      P.linearRampToValueAtTime(0.95, now + 0.02);
      P.exponentialRampToValueAtTime(0.0001, now + dur);
    } else if (kind === "bruh") {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer(0.3);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 850;
      bp.Q.value = 1.1;
      src.connect(bp);
      bp.connect(master);
      const body = osc("sine", 130);
      body.connect(master);
      sources.push(src, body);
      dur = 0.3;
      P.setValueAtTime(0.0001, now);
      P.linearRampToValueAtTime(0.6, now + 0.01);
      P.linearRampToValueAtTime(0.0001, now + dur);
    } else if (kind === "bonk") {
      const o = osc("sine", 900);
      o.frequency.setValueAtTime(900, now);
      o.frequency.exponentialRampToValueAtTime(170, now + 0.1);
      o.connect(master);
      sources.push(o);
      dur = 0.16;
      P.setValueAtTime(0.0001, now);
      P.linearRampToValueAtTime(0.8, now + 0.005);
      P.exponentialRampToValueAtTime(0.0001, now + dur);
    } else if (kind === "oof") {
      const o = osc("square", 320);
      o.frequency.setValueAtTime(320, now);
      o.frequency.exponentialRampToValueAtTime(135, now + 0.25);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1600;
      o.connect(lp);
      lp.connect(master);
      sources.push(o);
      dur = 0.3;
      P.setValueAtTime(0.0001, now);
      P.linearRampToValueAtTime(0.42, now + 0.01);
      P.linearRampToValueAtTime(0.0001, now + dur);
    } else if (kind === "wow") {
      const o = osc("triangle", 380);
      o.frequency.setValueAtTime(380, now);
      o.frequency.linearRampToValueAtTime(820, now + 0.16);
      o.frequency.linearRampToValueAtTime(470, now + 0.36);
      o.connect(master);
      sources.push(o);
      dur = 0.46;
      P.setValueAtTime(0.0001, now);
      P.linearRampToValueAtTime(0.5, now + 0.03);
      P.setValueAtTime(0.5, now + 0.34);
      P.linearRampToValueAtTime(0.0001, now + dur);
    } else if (kind === "sadviolin") {
      const o1 = osc("sawtooth", 293.66);
      const o2 = osc("sawtooth", 294.5);
      o1.frequency.setValueAtTime(293.66, now);
      o1.frequency.linearRampToValueAtTime(277, now + 0.9);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2600;
      o1.connect(lp);
      o2.connect(lp);
      lp.connect(master);
      const lfo = osc("sine", 5.2);
      const lg = ctx.createGain();
      lg.gain.value = 4;
      lfo.connect(lg);
      lg.connect(o1.frequency);
      lg.connect(o2.frequency);
      sources.push(o1, o2, lfo);
      dur = 1.1;
      P.setValueAtTime(0.0001, now);
      P.linearRampToValueAtTime(0.35, now + 0.09);
      P.setValueAtTime(0.35, now + 0.85);
      P.linearRampToValueAtTime(0.0001, now + dur);
    } else {
      // applause
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer(0.9);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 2400;
      bp.Q.value = 0.6;
      src.connect(bp);
      bp.connect(master);
      sources.push(src);
      dur = 0.9;
      P.setValueAtTime(0.0001, now);
      P.linearRampToValueAtTime(0.5, now + 0.05);
      P.setValueAtTime(0.45, now + 0.6);
      P.linearRampToValueAtTime(0.0001, now + dur);
    }

    sources.forEach((s) => {
      try {
        s.start(now);
      } catch {
        /* noop */
      }
    });
    sources.forEach((s) => {
      try {
        s.stop(now + dur + 0.12);
      } catch {
        /* noop */
      }
    });
    this.active = { sources, master };
    return dur;
  }
}
