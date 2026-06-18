import boardroom from "@/assets/scene-boardroom.jpg";
import intelligence from "@/assets/scene-intelligence.jpg";
import assembly from "@/assets/scene-assembly.jpg";
import miami from "@/assets/scene-miami.jpg";
import globeImg from "@/assets/globe.jpg";
import animation from "@/assets/hero-animation.jpg";

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
          <div className="mb-10 max-w-3xl">
            <span className="eyebrow">{eyebrow}</span>
            {title && <h2 className="display-3 mt-4">{title}</h2>}
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((s) => (
            <figure key={s.cap} className="relative group overflow-hidden">
              <img src={s.img} alt={s.cap} loading="lazy" className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--navy-deep)]/95 to-transparent text-white p-5 text-xs uppercase tracking-[0.2em]">
                <span className="text-[var(--gold)]">·</span> {s.cap}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
