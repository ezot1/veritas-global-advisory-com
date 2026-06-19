import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { ImageStrip } from "@/components/site/ImageStrip";
import { ApplyDialog, type ApplyJob } from "@/components/site/ApplyDialog";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers | Veritas Global Advisory" },
      { name: "description", content: "Join Veritas Global Advisory. Open roles in research, political risk, governance, communications, and more." },
    ],
  }),
  component: CareersPage,
});

const jobs: ApplyJob[] = [
  { title: "Research Associate", dept: "Research", region: "Europe" },
  { title: "Country Analyst", dept: "Research", region: "Africa" },
  { title: "Political Risk Analyst", dept: "Risk Advisory", region: "Asia-Pacific" },
  { title: "Governance Consultant", dept: "Public Policy", region: "Middle East" },
  { title: "International Business Consultant", dept: "Consulting", region: "Americas" },
  { title: "Communications Officer", dept: "Communications", region: "Europe" },
  { title: "Project Coordinator", dept: "Operations", region: "Europe" },
  { title: "Data Analyst", dept: "Research", region: "Asia-Pacific" },
  { title: "Human Rights Researcher", dept: "Human Rights", region: "Africa" },
];
const departments = ["All Departments", ...Array.from(new Set(jobs.map(j => j.dept)))];
const regions = ["All Regions", ...Array.from(new Set(jobs.map(j => j.region)))];

function CareersPage() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All Departments");
  const [reg, setReg] = useState("All Regions");
  const [active, setActive] = useState<ApplyJob | null>(null);

  const filtered = useMemo(() => jobs.filter(j =>
    (dept === "All Departments" || j.dept === dept) &&
    (reg === "All Regions" || j.region === reg) &&
    (q === "" || j.title.toLowerCase().includes(q.toLowerCase()))
  ), [q, dept, reg]);

  return (
    <>
      <PageHeader eyebrow="Careers" title="Work on questions that shape the world."
        intro="Join our research, advisory, and operations teams across five regional divisions." />
      <Section>
        <div className="card-elevated p-6 mb-12 grid lg:grid-cols-[1.4fr_1fr_1fr] gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search positions..." className="w-full h-12 pl-11 pr-4 border border-border bg-background text-sm focus:outline-none focus:border-[var(--navy-deep)]" />
          </div>
          <select value={dept} onChange={(e) => setDept(e.target.value)} className="h-12 px-4 border border-border bg-background text-sm">
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={reg} onChange={(e) => setReg(e.target.value)} className="h-12 px-4 border border-border bg-background text-sm">
            {regions.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div className="space-y-px bg-border">
          {filtered.map((j) => (
            <div key={j.title} className="bg-background p-7 grid sm:grid-cols-[1fr_auto] gap-6 items-center hover:bg-[var(--secondary)] transition-colors">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">{j.dept} · {j.region}</div>
                <h3 className="mt-2 text-xl font-semibold text-[var(--navy-deep)]">{j.title}</h3>
              </div>
              <button onClick={() => setActive(j)} className="btn-primary !text-xs !py-2.5 !px-5">Apply</button>
            </div>
          ))}
          {filtered.length === 0 && <div className="bg-background py-20 text-center text-muted-foreground">No open positions match your filters.</div>}
        </div>
      </Section>
      <ImageStrip start={3} eyebrow="Life at Veritas" title="A global team across five divisions." />
      <ApplyDialog job={active} onClose={() => setActive(null)} />
    </>
  );
}
