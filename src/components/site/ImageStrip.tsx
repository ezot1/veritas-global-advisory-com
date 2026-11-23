import boardroom from "@/assets/scene-boardroom.jpg";
import intelligence from "@/assets/scene-intelligence.jpg";
import assembly from "@/assets/scene-assembly.jpg";
import miami from "@/assets/scene-miami.jpg";
import globeImg from "@/assets/globe.jpg";
import animation from "@/assets/hero-animation.jpg";
import { Reveal } from "./Reveal";

const pool = [
  { img: boardroom, cap: "Executive Briefings" },
  { img: intelligence, cap: "Intelligence Operations" },
  { img: assembly, cap: "Multilateral Forums" },
  { img: miami, cap: "Miami Headquarters" },
  { img: globeImg, cap: "Global Coverage" },
  { img: animation, cap: "Live Data Network" },
];

export function ImageStrip({ start = 0, eyebrow = "Imagery", title }: { start?: number; eyebrow?: string; title?: string }) {
  const items = [pool[start % pool.length], pool[(start + 1) % pool.length], pool[(start + 2) % pool.length]];
  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="container-x">
        {(eyebrow || title) && (
          <Reveal className="mb-10 max-w-3xl">
            <span className="eyebrow">{eyebrow}</span>
            {title && <h2 className="display-3 mt-4">{title}</h2>}
          </Reveal>
        )}
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((s, i) => (
            <Reveal key={s.cap} delay={i * 0.12} as="figure" className="relative group overflow-hidden">
              <img
                src={s.img}
                alt={s.cap}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-deep)] via-transparent to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-700" />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[2px] bg-[var(--gold)] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"
              />
              <figcaption className="absolute inset-x-0 bottom-0 text-white p-5 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--gold)] animate-pulse" />
                {s.cap}
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
