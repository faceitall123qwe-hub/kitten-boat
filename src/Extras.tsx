import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";

const FISH_COLORS = [
  ["#ff7a59", "#ffd166"],
  ["#4cc9f0", "#b8f2ff"],
  ["#f72585", "#ffb3d9"],
  ["#ffd60a", "#fff3a3"],
  ["#80ed99", "#d8ffe0"],
  ["#b388ff", "#e6d9ff"],
];

const Fish: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const dir = i % 2 === 0 ? 1 : -1;
  const speed = 4 + random(`fs${i}`) * 4;
  const size = 170 + random(`fz${i}`) * 110;
  const y = 700 + random(`fy${i}`) * 1000;
  const startX = random(`fx${i}`) * width;
  const x = ((startX + dir * frame * speed) % (width + 300) + width + 300) % (width + 300) - 150;
  const [body, fin] = FISH_COLORS[i % FISH_COLORS.length];
  const wag = Math.sin(frame / 2.5 + i) * 14;
  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="-60 -40 120 80"
      style={{
        position: "absolute",
        left: x,
        top: y + Math.sin(frame / 8 + i) * 18,
        transform: dir === 1 ? undefined : "scaleX(-1)",
        filter: "drop-shadow(0 6px 10px #00324d66)",
      }}
    >
      <path d={`M -30 0 L -58 ${-22 + wag} L -58 ${22 + wag} Z`} fill={fin} />
      <ellipse cx="0" cy="0" rx="40" ry="28" fill={body} />
      <path d="M -6 -26 Q 6 -44 20 -24 Z" fill={fin} />
      <path d="M -10 4 Q 0 14 10 4" stroke={fin} strokeWidth="6" fill="none" opacity="0.7" />
      <circle cx="20" cy="-6" r="10" fill="white" />
      <circle cx="23" cy="-6" r="6" fill="#1b1b2f" />
      <circle cx="25" cy="-9" r="2.2" fill="white" />
      <path d="M 30 8 Q 34 12 38 8" stroke="#1b1b2f" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
};

export const Underwater: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #7fe0f0 0%, #23a6c9 35%, #0b5f8f 75%, #073b63 100%)" }}>
      {new Array(7).fill(0).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: -100,
            left: 80 + i * 150 + Math.sin(frame / 20 + i) * 40,
            width: 70 + (i % 3) * 30,
            height: 2000,
            background: "linear-gradient(180deg, #ffffffaa 0%, #ffffff22 50%, transparent 85%)",
            rotate: `${12 + Math.sin(i) * 6}deg`,
            transformOrigin: "top center",
            opacity: 0.35 + 0.25 * Math.sin(frame / 10 + i * 1.7),
            filter: "blur(6px)",
          }}
        />
      ))}
      <svg width={width} height={260} style={{ position: "absolute", top: 0, left: 0 }}>
        <path
          d={`M 0 ${150 + Math.sin(frame / 8) * 8} ${new Array(13)
            .fill(0)
            .map((_, k) => `Q ${k * 90 + 45} ${130 + Math.sin(frame / 6 + k) * 14} ${(k + 1) * 90} ${150 + Math.sin(frame / 8 + k) * 8}`)
            .join(" ")} L ${width} 0 L 0 0 Z`}
          fill="#d9fbff"
          opacity="0.55"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 70 + Math.sin(frame / 10) * 6,
          left: interpolate(frame, [0, 75], [180, 330]),
          width: 520,
          height: 150,
          borderRadius: "0 0 260px 260px / 0 0 150px 150px",
          background: "radial-gradient(ellipse at 50% 20%, #8a5a33 0%, #5b3a20 60%, #3d2614 100%)",
          boxShadow: "0 20px 50px #04283f88",
          rotate: `${Math.sin(frame / 13) * 2}deg`,
        }}
      />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Fish key={i} i={i} />
      ))}
      <svg width={width} height={300} style={{ position: "absolute", bottom: 0, left: 0 }}>
        {new Array(9).fill(0).map((_, k) => (
          <path
            key={k}
            d={`M ${60 + k * 120} 300 Q ${40 + k * 120 + Math.sin(frame / 10 + k) * 25} 200 ${60 + k * 120 + Math.sin(frame / 12 + k) * 30} ${120 + (k % 3) * 30}`}
            stroke={k % 2 ? "#3ddc97" : "#2bb673"}
            strokeWidth="18"
            strokeLinecap="round"
            fill="none"
          />
        ))}
        <ellipse cx={width / 2} cy={310} rx={width * 0.7} ry={70} fill="#f2d49b" />
      </svg>
    </AbsoluteFill>
  );
};

export const Bridge: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = interpolate(frame, [0, dur], [0, 1], { extrapolateRight: "clamp" });
  const W = width;
  const H = height;
  const bricks: React.ReactNode[] = [];
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 10; c++) {
      const shade = 150 + Math.round(random(`br${r}-${c}`) * 45);
      bricks.push(
        <rect
          key={`${r}-${c}`}
          x={c * 130 - (r % 2) * 65}
          y={r * 120}
          width={124}
          height={112}
          rx={14}
          fill={`rgb(${shade},${shade - 12},${shade - 34})`}
        />,
      );
    }
  }
  const archTop = 760;
  return (
    <AbsoluteFill
      style={{
        scale: interpolate(p, [0, 1], [1, 4.2], { easing: (t) => t * t }),
        transformOrigin: "50% 62%",
      }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <clipPath id="stone">
            <path
              d={`M 0 0 H ${W} V ${H} H ${W - 90} V ${archTop + 380} A ${W / 2 - 90} 380 0 0 0 90 ${archTop + 380} V ${H} H 0 Z`}
            />
          </clipPath>
        </defs>
        <g clipPath="url(#stone)">
          <rect width={W} height={H} fill="#7d7468" />
          {bricks}
          <rect width={W} height={H} fill="#2b2418" opacity="0.18" />
        </g>
        <path
          d={`M 90 ${H} V ${archTop + 380} A ${W / 2 - 90} 380 0 0 1 ${W - 90} ${archTop + 380} V ${H}`}
          fill="none"
          stroke="#5c5348"
          strokeWidth="34"
        />
        <rect x="0" y="0" width={W} height="240" fill="#4e9a3f" />
        <rect x="0" y="230" width={W} height="40" fill="#3c7a31" />
        {new Array(16).fill(0).map((_, k) => (
          <path
            key={k}
            d={`M ${k * 70 + 20} 260 q ${12 + Math.sin(frame / 9 + k) * 8} 90 0 ${120 + (k % 4) * 60}`}
            stroke={k % 2 ? "#5cb04a" : "#3f8a34"}
            strokeWidth="16"
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
