/**
 * Animated "data + globes" backdrop for dark navy sections.
 * Layers a slow dot-grid, orbiting arcs, drifting particles, and network
 * lines drawn with gold strokes. Pure SVG/CSS - no JS runtime cost.
 */
export function DataBackdrop({
  variant = "network",
  className = "",
}: {
  variant?: "network" | "grid" | "orbit" | "meridian";
  className?: string;
}) {
  return (
    <div aria-hidden className={`db-root pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Dotted world grid */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.22]"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="db-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#2d8a9e" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#0A2342" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="db-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
            <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
          <pattern id="db-dots" x="0" y="0" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="1.6" cy="1.6" r="1.1" fill="#8ecae6" fillOpacity="0.55" />
          </pattern>
        </defs>

        <rect width="1200" height="600" fill="url(#db-dots)" />
        <circle cx="600" cy="300" r="380" fill="url(#db-glow)" />

        {variant === "orbit" && (
          <g className="db-orbit-group">
            <ellipse cx="600" cy="300" rx="360" ry="90" fill="none" stroke="#D4AF37" strokeOpacity="0.35" />
            <ellipse cx="600" cy="300" rx="260" ry="66" fill="none" stroke="#2d8a9e" strokeOpacity="0.35" />
            <ellipse cx="600" cy="300" rx="460" ry="120" fill="none" stroke="#D4AF37" strokeOpacity="0.2" />
          </g>
        )}

        {variant === "meridian" && (
          <g stroke="#D4AF37" strokeOpacity="0.28" fill="none">
            {Array.from({ length: 9 }).map((_, i) => {
              const rx = 380;
              const ry = 90 + i * 12;
              return <ellipse key={i} cx="600" cy="300" rx={rx} ry={ry} />;
            })}
          </g>
        )}

        {variant === "network" && (
          <g>
            {/* Node network - a handful of connective lines animate a dash offset */}
            {NET_LINES.map((l, i) => (
              <line
                key={i}
                x1={l[0]}
                y1={l[1]}
                x2={l[2]}
                y2={l[3]}
                stroke="url(#db-line)"
                strokeWidth="1"
                strokeDasharray="6 10"
                className="db-line"
                style={{ animationDelay: `${(i * 0.6) % 5}s` }}
              />
            ))}
            {NET_NODES.map(([cx, cy], i) => (
              <g key={i} className="db-node" style={{ animationDelay: `${(i * 0.35) % 3}s` }}>
                <circle cx={cx} cy={cy} r="2.5" fill="#D4AF37" />
                <circle cx={cx} cy={cy} r="7" fill="#D4AF37" fillOpacity="0.15" />
              </g>
            ))}
          </g>
        )}
      </svg>

      {/* Floating soft particles */}
      <div className="db-particles absolute inset-0">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="db-particle"
            style={{
              left: `${(i * 71) % 100}%`,
              top: `${(i * 43) % 100}%`,
              animationDelay: `${(i * 0.9) % 12}s`,
              animationDuration: `${14 + (i % 6) * 2.5}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        .db-line {
          animation: db-dash 6s linear infinite;
        }
        .db-node {
          transform-box: fill-box;
          transform-origin: center;
          animation: db-pulse 3.6s ease-in-out infinite;
        }
        .db-orbit-group {
          transform-box: fill-box;
          transform-origin: 600px 300px;
          animation: db-rotate 90s linear infinite;
        }
        .db-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(212,175,55,0.9) 0%, rgba(212,175,55,0) 70%);
          box-shadow: 0 0 12px rgba(212,175,55,0.6);
          animation: db-float linear infinite;
          opacity: 0;
        }
        @keyframes db-dash { to { stroke-dashoffset: -160; } }
        @keyframes db-pulse {
          0%,100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.6); opacity: 0.4; }
        }
        @keyframes db-rotate { to { transform: rotate(360deg); } }
        @keyframes db-float {
          0% { transform: translate3d(0, 30px, 0); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 0.8; }
          100% { transform: translate3d(-40px, -140px, 0); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .db-line, .db-node, .db-orbit-group, .db-particle { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

const NET_NODES: [number, number][] = [
  [140, 210], [310, 130], [470, 260], [610, 170], [760, 300],
  [900, 210], [1060, 300], [220, 400], [430, 460], [640, 420],
  [820, 460], [980, 430], [560, 340], [380, 340],
];

const NET_LINES: [number, number, number, number][] = [
  [140, 210, 310, 130], [310, 130, 470, 260], [470, 260, 610, 170],
  [610, 170, 760, 300], [760, 300, 900, 210], [900, 210, 1060, 300],
  [220, 400, 430, 460], [430, 460, 640, 420], [640, 420, 820, 460],
  [820, 460, 980, 430], [470, 260, 380, 340], [610, 170, 560, 340],
  [560, 340, 640, 420], [380, 340, 220, 400], [760, 300, 820, 460],
  [900, 210, 980, 430], [310, 130, 380, 340], [140, 210, 220, 400],
];
