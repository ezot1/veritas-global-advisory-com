import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sendAdminReply, listSubmissionMessages } from "@/lib/admin/reply.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Submissions | Veritas Admin" }] }),
  component: AdminPage,
});

type Submission = {
  id: string;
  form_type: string;
  department: string | null;
  recipient_email: string;
  subject: string;
  sender_name: string | null;
  sender_email: string | null;
  sender_organization: string | null;
  sender_country: string | null;
  message: string | null;
  fields: { label: string; value: string }[];
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = ["new", "read", "replied", "archived"] as const;

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  // Check admin role
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        navigate({ to: "/auth" });
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) setError(error.message);
      setIsAdmin(!!data);
    })();
  }, [navigate]);

  async function loadSubmissions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("form_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) setError(error.message);
    setItems(((data as unknown) as Submission[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (isAdmin) loadSubmissions();
  }, [isAdmin]);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.status === filter)),
    [items, filter],
  );
  const selected = filtered.find((i) => i.id === selectedId) ?? filtered[0] ?? null;

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("form_submissions").update({ status }).eq("id", id);
    if (!error) setItems((arr) => arr.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this submission?")) return;
    const { error } = await supabase.from("form_submissions").delete().eq("id", id);
    if (!error) {
      setItems((arr) => arr.filter((i) => i.id !== id));
      setSelectedId(null);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (isAdmin === null) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="card-elevated p-10 max-w-md text-center">
          <span className="eyebrow">Access denied</span>
          <h1 className="display-3 mt-3">Admin privileges required</h1>
          <p className="text-sm text-muted-foreground mt-3">
            Your account is signed in but is not authorized to view submissions. Ask an existing admin to grant you
            the <code>admin</code> role.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={signOut} className="btn-ghost">Sign out</button>
            <Link to="/" className="btn-primary">Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="container-x flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-semibold tracking-tight">Veritas Admin</Link>
            <span className="text-xs text-muted-foreground">Submissions Inbox</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadSubmissions} className="text-xs underline text-muted-foreground hover:text-foreground">
              Refresh
            </button>
            <button onClick={signOut} className="btn-ghost !py-2 !px-4 !text-xs">Sign out</button>
          </div>
        </div>
      </header>

      <div className="container-x py-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {(["all", ...STATUS_OPTIONS] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider border ${
                filter === s
                  ? "bg-[var(--navy-deep)] text-white border-[var(--navy-deep)]"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s} {s !== "all" && `(${items.filter((i) => i.status === s).length})`}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} of {items.length}</span>
        </div>

        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          <aside className="border border-border bg-white max-h-[75vh] overflow-y-auto">
            {loading && <div className="p-6 text-sm text-muted-foreground">Loading…</div>}
            {!loading && filtered.length === 0 && (
              <div className="p-6 text-sm text-muted-foreground">No submissions yet.</div>
            )}
            <ul>
              {filtered.map((it) => (
                <li key={it.id}>
                  <button
                    onClick={() => setSelectedId(it.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted/40 transition ${
                      selected?.id === it.id ? "bg-muted/60" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs uppercase tracking-wider text-[var(--gold)]">
                        {it.form_type}{it.department ? ` · ${it.department}` : ""}
                      </span>
                      {it.status !== "read" && it.status !== "archived" && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          it.status === "new" ? "bg-blue-100 text-blue-700" :
                          it.status === "replied" ? "bg-green-100 text-green-700" : "bg-gray-100"
                        }`}>{it.status}</span>
                      )}
                    </div>
                    <div className="mt-1 text-sm font-medium line-clamp-1">{it.sender_name || it.sender_email || "Anonymous"}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{it.subject}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{new Date(it.created_at).toLocaleString()}</div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <main className="border border-border bg-white p-6 md:p-8 max-h-[75vh] overflow-y-auto">
            {!selected ? (
              <div className="text-sm text-muted-foreground">Select a submission to view.</div>
            ) : (
              <SubmissionDetail submission={selected} onStatus={updateStatus} onDelete={remove} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function SubmissionDetail({
  submission: s,
  onStatus,
  onDelete,
}: {
  submission: Submission;
  onStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  // Mark as read when opened
  useEffect(() => {
    if (s.status === "new") onStatus(s.id, "read");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.id]);

  const replyTo = s.sender_email ?? "";
  const replySubject = encodeURIComponent("Re: " + s.subject);
  const replyBody = encodeURIComponent(
    `\n\n— Veritas Global Advisory\n\n---\nOriginal message from ${s.sender_name ?? "visitor"}:\n${s.message ?? ""}`,
  );
  const mailto = `mailto:${replyTo}?subject=${replySubject}&body=${replyBody}`;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(replyTo)}&su=${replySubject}&body=${replyBody}`;

  return (
    <article>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--gold)]">
            {s.form_type}{s.department ? ` · ${s.department}` : ""} · routed to {s.recipient_email}
          </div>
          <h2 className="display-3 mt-1">{s.subject}</h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={s.status}
            onChange={(e) => onStatus(s.id, e.target.value)}
            className="h-9 px-3 text-xs border border-border bg-background"
          >
            {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <button onClick={() => onDelete(s.id)} className="text-xs text-red-600 hover:underline">Delete</button>
        </div>
      </div>

      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm border-y border-border py-4 mb-6">
        <Row label="From" value={s.sender_name} />
        <Row label="Email" value={s.sender_email} link={s.sender_email ? `mailto:${s.sender_email}` : null} />
        <Row label="Organization" value={s.sender_organization} />
        <Row label="Country" value={s.sender_country} />
        <Row label="Received" value={new Date(s.created_at).toLocaleString()} />
      </dl>

      {s.message && (
        <section className="mb-6">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Message</div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{s.message}</p>
        </section>
      )}

      <details className="mb-6">
        <summary className="text-xs uppercase tracking-[0.18em] text-muted-foreground cursor-pointer">
          All submitted fields
        </summary>
        <dl className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {s.fields.map((f, i) => (
            <Row key={i} label={f.label} value={f.value} />
          ))}
        </dl>
      </details>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
        {replyTo ? (
          <>
            <a href={mailto} className="btn-primary !py-2.5 !px-5 !text-xs">Reply via email client</a>
            <a href={gmail} target="_blank" rel="noopener noreferrer" className="btn-ghost !py-2.5 !px-5 !text-xs">
              Reply in Gmail
            </a>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">No reply-to email captured.</span>
        )}
      </div>
    </article>
  );
}

function Row({ label, value, link }: { label: string; value: string | null; link?: string | null }) {
  if (!value) return null;
  return (
    <>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-sm">
        {link ? <a href={link} className="text-[var(--navy-deep)] hover:text-[var(--gold)] underline">{value}</a> : value}
      </dd>
    </>
  );
}
