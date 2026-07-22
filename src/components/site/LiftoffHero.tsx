import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import heroWorld from "@/assets/hero-world.jpg";

/**
 * Homepage hero with an "antigravity"-style liftoff animation:
 * a colored trail streaks upward from the bottom of the viewport,
 * a small mark rises with it and settles above the headline,
 * then the headline reveals line-by-line.
 */
export function LiftoffHero() {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setPlay(true);
      return;
    }
    const t = requestAnimationFrame(() => setPlay(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <section className="relative bg-[var(--navy-deep)] text-white overflow-hidden">
      <img
        src={heroWorld}
        alt=""
        width={1920}
        height={1280}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy-deep)]/80 via-[var(--navy-deep)]/70 to-[var(--navy-deep)]" />

      {/* Liftoff trail - a thin vertical gradient that streaks up the left rail of the headline */}
      <div
        aria-hidden
        className={`pointer-events-none absolute left-[max(1.5rem,calc((100vw-80rem)/2+2.5rem))] bottom-0 w-[3px] origin-bottom ${
          play ? "lo-trail-play" : "lo-trail-idle"
        }`}
        style={{
          height: "100%",
          background:
            "linear-gradient(to top, transparent 0%, #4285F4 18%, #9B72CB 38%, #D96570 58%, #D4AF37 82%, transparent 100%)",
          filter: "blur(1px)",
        }}
      />
      {/* Soft glow that rides the trail */}
      <div
        aria-hidden
        className={`pointer-events-none absolute left-[max(1.5rem,calc((100vw-80rem)/2+2.5rem))] -translate-x-1/2 h-40 w-40 rounded-full ${
          play ? "lo-spark-play" : "lo-spark-idle"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.55) 0%, rgba(217,101,112,0.25) 40%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      <div className="container-x relative pt-32 pb-28 md:pt-44 md:pb-36">
        <div className="max-w-5xl">
          <span className={`eyebrow !text-[var(--gold)] lo-reveal ${play ? "lo-reveal-play" : ""}`} style={{ ["--d" as string]: "1.4s" }}>
            Global Advisory · Research · Intelligence
          </span>
          <h1 className="display-1 mt-7 text-balance">
            <span className={`lo-line ${play ? "lo-line-play" : ""}`} style={{ ["--d" as string]: "1.55s" }}>
              Navigating Complexity.
            </span>
            <br />
            <span className={`lo-line ${play ? "lo-line-play" : ""}`} style={{ ["--d" as string]: "1.75s" }}>
              Connecting Opportunities.
            </span>
            <br />
            <span
              className={`lo-line text-[var(--gold)] ${play ? "lo-line-play" : ""}`}
              style={{ ["--d" as string]: "1.95s" }}
            >
              Shaping Global Solutions.
            </span>
          </h1>
          <p
            className={`mt-9 max-w-2xl text-lg md:text-xl text-white/80 leading-relaxed text-pretty lo-reveal ${
              play ? "lo-reveal-play" : ""
            }`}
            style={{ ["--d" as string]: "2.15s" }}
          >
            Veritas Global Advisory is an international consulting and advisory firm providing
            strategic intelligence, business consulting, governance analysis, political risk
            assessment, market-entry support, and global talent solutions across regions and sectors.
          </p>
          <div
            className={`mt-12 flex flex-wrap gap-4 lo-reveal ${play ? "lo-reveal-play" : ""}`}
            style={{ ["--d" as string]: "2.35s" }}
          >
            <Link
              to="/services"
              className="btn-primary !bg-[var(--gold)] !border-[var(--gold)] !text-[var(--navy-deep)] hover:!bg-white hover:!border-white"
            >
              Explore Our Services
            </Link>
            <Link to="/talent" className="btn-ghost !text-white">
              Join Our Global Network
            </Link>
          </div>
        </div>

        <div
          className={`mt-24 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/15 border border-white/15 lo-reveal ${
            play ? "lo-reveal-play" : ""
          }`}
          style={{ ["--d" as string]: "2.55s" }}
        >
          {[
            { v: "12", l: "Countries Covered" },
            { v: "40", l: "Experts Worldwide" },
            { v: "100", l: "Research Publications" },
            { v: "5", l: "Regional Divisions" },
          ].map((s) => (
            <div key={s.l} className="bg-[var(--navy-deep)] p-8">
              <div className="text-4xl md:text-5xl font-semibold text-[var(--gold)] tracking-tight">
                {s.v}
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.18em] text-white/70">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes lo-trail-rise {
          0%   { transform: scaleY(0);   opacity: 0; }
          15%  { opacity: 1; }
          70%  { transform: scaleY(1);   opacity: 1; }
          100% { transform: scaleY(1);   opacity: 0.35; }
        }
        @keyframes lo-spark-rise {
          0%   { bottom: -6rem; opacity: 0; transform: translateX(-50%) scale(0.6); }
          10%  { opacity: 1; }
          70%  { bottom: calc(100% - 6rem); opacity: 0.9; transform: translateX(-50%) scale(1); }
          100% { bottom: 110%; opacity: 0; transform: translateX(-50%) scale(0.4); }
        }
        @keyframes lo-line-up {
          from { transform: translateY(110%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes lo-reveal-in {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        .lo-trail-idle { transform: scaleY(0); opacity: 0; }
        .lo-trail-play { animation: lo-trail-rise 2.2s cubic-bezier(.22,.61,.36,1) forwards; }

        .lo-spark-idle { opacity: 0; bottom: -6rem; }
        .lo-spark-play { animation: lo-spark-rise 2.2s cubic-bezier(.22,.61,.36,1) forwards; }

        .lo-line {
          display: inline-block;
          transform: translateY(110%);
          opacity: 0;
          will-change: transform, opacity;
        }
        .lo-line-play {
          animation: lo-line-up 0.9s cubic-bezier(.22,.61,.36,1) forwards;
          animation-delay: var(--d, 0s);
        }

        .lo-reveal { opacity: 0; transform: translateY(20px); }
        .lo-reveal-play {
          animation: lo-reveal-in 0.8s ease-out forwards;
          animation-delay: var(--d, 0s);
        }

        /* Ensure the line masks clip children so the upward slide feels like a liftoff */
        h1 > br + span, h1 > span { overflow: hidden; }

        @media (prefers-reduced-motion: reduce) {
          .lo-trail-play, .lo-spark-play, .lo-line-play, .lo-reveal-play {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
