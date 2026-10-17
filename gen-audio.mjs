import { mkdirSync, writeFileSync } from "node:fs";

const SR = 44100;
const E8 = 1 / 6; // eighth note at 6/8, dotted quarter = 120 bpm -> one bar per second

const writeWav = (path, L, R = L) => {
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = peak > 0 ? 0.89 / peak : 1;
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(L[i] * g * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(R[i] * g * 32767), 46 + i * 4);
  }
  writeFileSync(path, buf);
};

const midi = (m) => 440 * 2 ** ((m - 69) / 12);
let seed = 1;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

const add = (L, R, t, sig, pan = 0) => {
  const start = Math.round(t * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < sig.length && start + i < L.length; i++) {
    L[start + i] += sig[i] * gl;
    R[start + i] += sig[i] * gr;
  }
};

const musicBox = (f, dur, vel = 1) => {
  const n = Math.round((dur + 0.8) * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.004) * Math.exp(-t * 3.2);
    out[i] =
      vel *
      env *
      (Math.sin(2 * Math.PI * f * t) +
        0.35 * Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 6) +
        0.18 * Math.sin(2 * Math.PI * f * 3.01 * t) * Math.exp(-t * 9) +
        0.08 * Math.sin(2 * Math.PI * f * 4.2 * t) * Math.exp(-t * 14));
  }
  return out;
};

const pluck = (f, dur, vel = 1) => {
  const n = Math.round((dur + 0.4) * SR);
  const period = Math.round(SR / f);
  const ring = new Float32Array(period).map(() => rand() * 0.5);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const idx = i % period;
    const next = (i + 1) % period;
    const v = 0.5 * (ring[idx] + ring[next]) * 0.996;
    ring[idx] = v;
    out[i] = v * vel * Math.min(1, (n - i) / (0.05 * SR));
  }
  return out;
};

const bass = (f, dur) => {
  const n = Math.round(dur * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.01) * Math.exp(-t * 2.5) * Math.min(1, (n - i) / (0.03 * SR));
    out[i] = env * (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t));
  }
  return out;
};

const shaker = (vel) => {
  const n = Math.round(0.07 * SR);
  const out = new Float32Array(n);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const x = rand();
    const hp = x - prev;
    prev = x;
    out[i] = hp * vel * Math.min(1, t / 0.008) * Math.exp(-t * 60);
  }
  return out;
};

// [midi, eighths]
const VERSE = [
  [72, 3], [72, 3],
  [72, 2], [74, 1], [76, 3],
  [76, 2], [74, 1], [76, 2], [77, 1],
  [79, 6],
  [84, 1], [84, 1], [84, 1], [79, 1], [79, 1], [79, 1],
  [76, 1], [76, 1], [76, 1], [72, 1], [72, 1], [72, 1],
  [79, 2], [77, 1], [76, 2], [74, 1],
  [72, 6],
];
const CHORDS = ["C", "C", "C", "C", "C", "C", "G7", "C"];
const CHORD_NOTES = { C: [60, 64, 67, 72], G7: [55, 59, 65, 67] };
const BASS_NOTES = { C: [36, 43], G7: [43, 38] };

const VERSES = 2;
const MUSIC_END = VERSES * 8;
const TOTAL = MUSIC_END + 2.5;

const mL = new Float32Array(Math.round(TOTAL * SR));
const mR = new Float32Array(mL.length);

for (let v = 0; v < VERSES; v++) {
  let t = v * 8;
  for (const [m, len] of VERSE) {
    add(mL, mR, t, musicBox(midi(m), len * E8, 0.55), 0.15);
    t += len * E8;
  }
  CHORDS.forEach((ch, bar) => {
    const t0 = v * 8 + bar;
    for (const beat of [0, 0.5]) {
      CHORD_NOTES[ch].forEach((m, k) => add(mL, mR, t0 + beat + k * 0.012, pluck(midi(m), 0.5, 0.22), -0.3));
      add(mL, mR, t0 + beat, bass(midi(BASS_NOTES[ch][beat === 0 ? 0 : 1]), 0.48), 0);
    }
    for (let e = 0; e < 6; e++) add(mL, mR, t0 + e * E8, shaker(e % 3 === 0 ? 0.09 : 0.05), 0.4);
  });
}
// ending: final C chord strum + high sparkle
[60, 64, 67, 72, 76].forEach((m, k) => add(mL, mR, MUSIC_END + k * 0.03, pluck(midi(m), 1.8, 0.25), -0.2));
add(mL, mR, MUSIC_END, bass(midi(36), 1.8), 0);
[84, 88, 91, 96].forEach((m, k) => add(mL, mR, MUSIC_END + 0.1 + k * 0.12, musicBox(midi(m), 0.4, 0.3), 0.3));

mkdirSync("public/audio", { recursive: true });
writeWav("public/audio/music.wav", mL, mR);

// --- water ambience
const aL = new Float32Array(Math.round(TOTAL * SR));
const aR = new Float32Array(aL.length);
let b1 = 0, b2 = 0;
for (let i = 0; i < aL.length; i++) {
  const t = i / SR;
  b1 = 0.995 * b1 + 0.03 * rand();
  b2 = 0.993 * b2 + 0.03 * rand();
  const mod = 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.23 * t) * Math.sin(2 * Math.PI * 0.11 * t + 1);
  aL[i] = b1 * mod;
  aR[i] = b2 * mod;
}
for (let k = 0; k < 140; k++) {
  const t = Math.abs(rand()) * TOTAL;
  const f = 900 + Math.abs(rand()) * 1800;
  const n = Math.round(0.04 * SR);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    s[i] = 0.05 * Math.sin(2 * Math.PI * (f + 9000 * tt) * tt) * Math.exp(-tt * 90);
  }
  add(aL, aR, t, s, rand());
}
writeWav("public/audio/water.wav", aL, aR);

// --- one-shots
const oneShot = (name, dur, fn) => {
  const n = Math.round(dur * SR);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = fn(i / SR, i);
  writeWav(`public/audio/${name}.wav`, s);
};

let lp = 0;
oneShot("splash", 0.45, (t) => {
  lp = lp + 0.35 * (rand() - lp);
  const env = Math.min(1, t / 0.01) * Math.exp(-t * 9);
  const gurgle = Math.sin(2 * Math.PI * (300 + 500 * Math.exp(-t * 12)) * t) * Math.exp(-t * 14) * 0.4;
  return (lp * 1.4 + gurgle) * env;
});

const quack = (pitch) => {
  let ph = 0;
  let y1 = 0, y2 = 0;
  const fc = 1400, q = 4;
  const w = (2 * Math.PI * fc) / SR;
  const a = Math.sin(w) / (2 * q);
  const b0 = a, a0 = 1 + a, a1 = -2 * Math.cos(w), a2 = 1 - a;
  let x1 = 0, x2 = 0;
  return (t) => {
    const f = pitch * (1.15 - 0.35 * Math.min(1, t / 0.14));
    ph += f / SR;
    const saw = 2 * (ph % 1) - 1;
    const x = saw;
    const y = (b0 * x - b0 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    const env = Math.min(1, t / 0.008) * (t < 0.1 ? 1 : Math.exp(-(t - 0.1) * 30));
    return (y * 3 + saw * 0.15) * env;
  };
};
oneShot("quack", 0.22, quack(520));
oneShot("quack-high", 0.22, quack(680));

oneShot("bubbles", 1.6, (t) => {
  let v = 0;
  for (let k = 0; k < 9; k++) {
    const t0 = k * 0.16 + (k % 3) * 0.03;
    const tt = t - t0;
    if (tt > 0 && tt < 0.08) v += Math.sin(2 * Math.PI * (500 + k * 60 + 4000 * tt) * tt) * Math.exp(-tt * 50);
  }
  return v * 0.6;
});

oneShot("chime", 1.4, (t) => {
  let v = 0;
  [88, 91, 95, 100].forEach((m, k) => {
    const tt = t - k * 0.07;
    if (tt > 0) v += Math.sin(2 * Math.PI * midi(m) * tt) * Math.exp(-tt * 4) * Math.min(1, tt / 0.003);
  });
  return v;
});

oneShot("whoosh", 0.7, (t) => {
  lp = lp + (0.05 + 0.4 * Math.sin((Math.PI * t) / 0.7)) * (rand() - lp);
  return lp * Math.sin((Math.PI * t) / 0.7) ** 2;
});

console.log("audio ok, total", TOTAL, "s");
