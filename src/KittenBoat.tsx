import { loadFont } from "@remotion/google-fonts/Fredoka";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Bridge, Underwater } from "./Extras";

const { fontFamily } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });

const FPS = 30;
const LINE = 2 * FPS;
const FADE = 8;
const ease = Easing.bezier(0.45, 0, 0.55, 1);

type Motion = {
  zoom: [number, number];
  x?: [number, number];
  y?: [number, number];
  rock?: number;
  bob?: number;
  flip?: boolean;
  filter?: string;
};

const Shot: React.FC<{ src: string; motion: Motion; dur: number; children?: React.ReactNode }> = ({
  src,
  motion,
  dur,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const rock = motion.rock ?? 0.8;
  const bob = motion.bob ?? 10;
  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [0, FADE], [0, 1], { extrapolateRight: "clamp" }),
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: interpolate(p, [0, 1], motion.zoom),
          translate: `${interpolate(p, [0, 1], motion.x ?? [0, 0])}px ${interpolate(p, [0, 1], motion.y ?? [0, 0]) + Math.sin(frame / 9) * bob}px`,
          rotate: `${Math.sin(frame / 13) * rock}deg`,
          transform: motion.flip ? "scaleX(-1)" : undefined,
          filter: motion.filter,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

const Glints: React.FC<{ count?: number; top?: number; seed: string }> = ({ count = 26, top = 0.6, seed }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`${seed}x${i}`) * width;
        const y = (top + random(`${seed}y${i}`) * (1 - top)) * height;
        const phase = random(`${seed}p${i}`) * Math.PI * 2;
        const a = Math.max(0, Math.sin(frame / 5 + phase)) ** 6;
        const s = 10 + random(`${seed}s${i}`) * 22;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s * 2.4,
              height: s * 0.5,
              borderRadius: s,
              background: "radial-gradient(ellipse, #fffbe6 0%, #fff3b0aa 40%, transparent 70%)",
              opacity: a,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Splash: React.FC<{ x: number; y: number; every: number; seed: string }> = ({ x, y, every, seed }) => {
  const frame = useCurrentFrame();
  const local = frame % every;
  return (
    <AbsoluteFill>
      {new Array(14).fill(0).map((_, i) => {
        const ang = -Math.PI / 2 + (random(`${seed}a${i}`) - 0.5) * 2.2;
        const v = 9 + random(`${seed}v${i}`) * 9;
        const t = local;
        const px = x + Math.cos(ang) * v * t;
        const py = y + Math.sin(ang) * v * t + 0.55 * t * t;
        const r = 5 + random(`${seed}r${i}`) * 9;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: r,
              height: r,
              borderRadius: r,
              background: "#ffffffdd",
              boxShadow: "0 0 8px #bfeaff",
              opacity: interpolate(t, [0, 3, 18, 24], [0, 1, 0.8, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Bubbles: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      {new Array(30).fill(0).map((_, i) => {
        const r = 8 + random(`b${i}`) * 26;
        const speed = 6 + random(`bs${i}`) * 8;
        const y = height + 60 - ((frame * speed + random(`by${i}`) * height) % (height + 120));
        const x = random(`bx${i}`) * width + Math.sin(frame / 6 + i) * 12;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r,
              height: r,
              borderRadius: r,
              border: "3px solid #ffffffaa",
              background: "radial-gradient(circle at 30% 30%, #ffffffcc 0%, #ffffff22 35%, transparent 60%)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Butterfly: React.FC = () => {
  const frame = useCurrentFrame();
  const flap = Math.abs(Math.sin(frame / 2.2));
  return (
    <div
      style={{
        position: "absolute",
        left: interpolate(frame, [0, 18, 60], [300, 360, 1250], { extrapolateRight: "clamp", easing: Easing.in(Easing.quad) }),
        top: interpolate(frame, [0, 18, 60], [1250, 1220, 300], { extrapolateRight: "clamp", easing: Easing.in(Easing.quad) }) + Math.sin(frame / 4) * 30,
        scale: 1.9,
        rotate: "-20deg",
        opacity: interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      <svg width="170" height="140" viewBox="-85 -70 170 140" style={{ filter: "drop-shadow(0 0 14px #9fe3ff)" }}>
        <g style={{ transform: `scaleX(${0.25 + flap * 0.75})` }}>
          <ellipse cx="-40" cy="-22" rx="42" ry="36" fill="#4fb6ff" stroke="#1b4f9c" strokeWidth="4" />
          <ellipse cx="40" cy="-22" rx="42" ry="36" fill="#4fb6ff" stroke="#1b4f9c" strokeWidth="4" />
          <ellipse cx="-30" cy="26" rx="28" ry="24" fill="#ff8fd0" stroke="#1b4f9c" strokeWidth="4" />
          <ellipse cx="30" cy="26" rx="28" ry="24" fill="#ff8fd0" stroke="#1b4f9c" strokeWidth="4" />
          <circle cx="-42" cy="-26" r="11" fill="#fff6a8" />
          <circle cx="42" cy="-26" r="11" fill="#fff6a8" />
        </g>
        <ellipse cx="0" cy="0" rx="7" ry="40" fill="#3b2a1a" />
      </svg>
    </div>
  );
};

type Word = { w: string; t: number };
const VERSE_LINES = [
  { w: "Row, row, row your boat", t: [0, 0.5, 1, 1.333, 1.5] },
  { w: "Gently down the stream", t: [0, 0.5, 0.833, 1] },
  { w: "Merrily, merrily, merrily, merrily", t: [0, 0.5, 1, 1.5] },
  { w: "Life is but a dream", t: [0, 0.333, 0.5, 0.833, 1] },
];
const LYRICS: { start: number; words: Word[] }[] = [0, 1].flatMap((verse) =>
  VERSE_LINES.map((l, k) => ({
    start: (verse * 4 + k) * 2,
    words: l.w.split(" ").map((w, i) => ({ w, t: l.t[i] })),
  })),
);

const Karaoke: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = frame / FPS;
  const line = LYRICS.find((l) => sec >= l.start && sec < l.start + 2) ?? (sec >= 16 && sec < 17.5 ? LYRICS[7] : null);
  if (!line) return null;
  const local = sec - line.start;
  const lineIn = interpolate(local, [0, 0.15], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: 250,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "4px 36px",
        fontFamily,
        fontWeight: 700,
        fontSize: 84,
        lineHeight: 1.15,
        opacity: lineIn,
        translate: `0px ${interpolate(lineIn, [0, 1], [30, 0])}px`,
      }}
    >
      {line.words.map((wd, i) => {
        const on = local >= wd.t;
        const pop = interpolate(local - wd.t, [0, 0.08, 0.25], [1, 1.22, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{
              color: on ? "#ffd84d" : "#ffffff",
              WebkitTextStroke: "10px #3a2a7a",
              paintOrder: "stroke fill",
              textShadow: "0 8px 0 #2a1d5c",
              scale: on ? pop : 1,
              display: "inline-block",
            }}
          >
            {wd.w}
          </span>
        );
      })}
    </div>
  );
};

const at = (line: number) => line * LINE;

export const KittenBoat: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b2a3a" }}>
      <Audio src={staticFile("audio/music.wav")} />
      <Audio src={staticFile("audio/water.wav")} volume={0.35} />

      <Sequence name="1 Close-up" from={0} durationInFrames={LINE + FADE}>
        <Shot src="stills/s1.webp" dur={LINE} motion={{ zoom: [1.05, 1.2], y: [0, 40] }}>
          <Glints seed="s1" />
        </Shot>
      </Sequence>
      <Sequence name="2 Rowing" from={at(1) - FADE} durationInFrames={LINE + 2 * FADE}>
        <Shot src="stills/s2.webp" dur={LINE + FADE} motion={{ zoom: [1.35, 1.05], y: [-60, 0] }}>
          <Glints seed="s2" top={0.62} />
          <Splash x={330} y={1180} every={30} seed="sp1" />
          <Splash x={780} y={1150} every={30} seed="sp2" />
        </Shot>
      </Sequence>
      <Sequence name="3 Ducklings" from={at(2) - FADE} durationInFrames={LINE + 2 * FADE}>
        <Shot src="stills/s3.webp" dur={LINE + FADE} motion={{ zoom: [1.1, 1.25], x: [40, -60] }}>
          <Glints seed="s3" top={0.7} />
        </Shot>
      </Sequence>
      <Sequence name="4 Underwater" from={at(3) - FADE} durationInFrames={LINE + 2 * FADE}>
        <AbsoluteFill
          style={{
            opacity: interpolate(frame - at(3) + FADE, [0, FADE], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          <Underwater />
          <Bubbles />
        </AbsoluteFill>
      </Sequence>
      <Sequence name="5 Bridge" from={at(4) - FADE} durationInFrames={LINE + 2 * FADE}>
        <Shot src="stills/s2.webp" dur={LINE + FADE} motion={{ zoom: [1.12, 1.28], y: [0, 40] }}>
          <Glints seed="s5" top={0.65} />
          <AbsoluteFill
            style={{
              background: "#0b1620",
              opacity: interpolate(frame - at(4) + FADE, [28, 46, LINE + FADE], [0, 0.4, 0.5], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
          <Bridge dur={LINE + FADE} />
        </Shot>
      </Sequence>
      <Sequence name="6 Butterfly" from={at(5) - FADE} durationInFrames={LINE + 2 * FADE}>
        <Shot src="stills/s2.webp" dur={LINE + FADE} motion={{ zoom: [1.9, 2.05], y: [380, 400], rock: 0.3, bob: 4 }}>
          <Sequence from={FADE + 10}>
            <Butterfly />
          </Sequence>
          <AbsoluteFill
            style={{
              background: "radial-gradient(circle at 50% 30%, #fffbe0 0%, #ffffff 60%)",
              opacity: interpolate(frame - at(5) + FADE, [FADE, FADE + 18], [0.95, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        </Shot>
      </Sequence>
      <Sequence name="7 Happy" from={at(6) - FADE} durationInFrames={LINE + 2 * FADE}>
        <Shot src="stills/s3.webp" dur={LINE + FADE} motion={{ zoom: [1.3, 1.15], x: [30, -30], flip: true }}>
          <Glints seed="s7" top={0.65} />
          <Splash x={820} y={1300} every={30} seed="sp3" />
        </Shot>
      </Sequence>
      <Sequence name="8 Sunset" from={at(7) - FADE} durationInFrames={durationInFrames - at(7) + FADE}>
        <Shot
          src="stills/s1.webp"
          dur={durationInFrames - at(7)}
          motion={{
            zoom: [1.25, 1.0],
            y: [-40, 0],
            rock: 0.5,
            bob: 6,
            filter: "sepia(0.45) saturate(1.5) hue-rotate(-12deg) brightness(1.05) contrast(1.05)",
          }}
        >
          <AbsoluteFill
            style={{
              background: "linear-gradient(180deg, #ff9a3c66 0%, #ffcf7a33 45%, #ff7a3c55 100%)",
              mixBlendMode: "soft-light",
            }}
          />
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 75% ${interpolate(frame - at(7), [0, 135], [12, 20], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%, #fff4c2ee 0%, #ffcf6a88 10%, transparent 38%)`,
              mixBlendMode: "screen",
            }}
          />
          <Glints seed="s8" top={0.55} count={40} />
        </Shot>
      </Sequence>

      <Karaoke />

      <AbsoluteFill
        style={{
          background: "#fff6dd",
          opacity: interpolate(frame, [durationInFrames - 20, durationInFrames], [0, 1], {
            extrapolateLeft: "clamp",
          }),
        }}
      />

      {[0.5, 1.0, 1.5, 2.5, 3.0, 3.5].map((s) => (
        <Audio key={`sp${s}`} src={staticFile("audio/splash.wav")} from={Math.round((2 + s) * FPS)} volume={0.35} />
      ))}
      {[12.5, 13.0, 13.5].map((s) => (
        <Audio key={`sp${s}`} src={staticFile("audio/splash.wav")} from={Math.round(s * FPS)} volume={0.3} />
      ))}
      <Audio src={staticFile("audio/quack.wav")} from={Math.round(4.3 * FPS)} volume={0.5} />
      <Audio src={staticFile("audio/quack-high.wav")} from={Math.round(4.6 * FPS)} volume={0.5} />
      <Audio src={staticFile("audio/quack.wav")} from={Math.round(5.4 * FPS)} volume={0.45} />
      <Audio src={staticFile("audio/whoosh.wav")} from={at(3) - 10} volume={0.5} />
      <Audio src={staticFile("audio/bubbles.wav")} from={at(3) + 4} volume={0.45} />
      <Audio src={staticFile("audio/whoosh.wav")} from={at(4) - 10} volume={0.4} />
      <Audio src={staticFile("audio/quack-high.wav")} from={Math.round(9.2 * FPS)} volume={0.4} />
      <Audio src={staticFile("audio/chime.wav")} from={at(5) + FADE + 10} volume={0.5} />
      <Audio src={staticFile("audio/quack.wav")} from={Math.round(12.6 * FPS)} volume={0.5} />
      <Audio src={staticFile("audio/quack-high.wav")} from={Math.round(13.1 * FPS)} volume={0.5} />
      <Audio src={staticFile("audio/quack.wav")} from={Math.round(15.2 * FPS)} volume={0.4} />
      <Audio src={staticFile("audio/quack-high.wav")} from={Math.round(15.5 * FPS)} volume={0.4} />
      <Audio src={staticFile("audio/chime.wav")} from={16 * FPS} volume={0.35} />
    </AbsoluteFill>
  );
};
