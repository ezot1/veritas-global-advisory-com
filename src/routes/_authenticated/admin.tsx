import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sendAdminReply, listSubmissionMessages } from "@/lib/admin/reply.functions";
import {
  listReplyTemplates,
  createReplyTemplate,
  updateReplyTemplate,
  deleteReplyTemplate,
  listEmailTemplateSettings,
  upsertEmailTemplateSetting,
} from "@/lib/admin/email-settings.functions";


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
  const [tab, setTab] = useState<"inbox" | "snippets" | "settings">("inbox");
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
        <div className="flex items-center gap-1 mb-5 border-b border-border">
          {([
            ["inbox", "Inbox"],
            ["snippets", "Reply snippets"],
            ["settings", "Email branding"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 text-xs uppercase tracking-wider border-b-2 -mb-px ${
                tab === id
                  ? "border-[var(--navy-deep)] text-[var(--navy-deep)] font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

        {tab === "inbox" && (
          <>
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
          </>
        )}

        {tab === "snippets" && <SnippetsPanel />}
        {tab === "settings" && <EmailSettingsPanel />}
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

      <ReplyThread submission={s} onReplied={() => onStatus(s.id, "replied")} />
    </article>
  );
}

type ThreadMessage = {
  id: string;
  direction: "outbound" | "inbound";
  from_email: string;
  from_label: string | null;
  to_email: string;
  subject: string;
  body_text: string;
  status: string;
  error_message: string | null;
  created_at: string;
};

type Snippet = { id: string; name: string; department: string | null; subject: string; body: string };

function applyPlaceholders(text: string, s: Submission): string {
  return text
    .replace(/\{\{\s*name\s*\}\}/gi, s.sender_name ?? "")
    .replace(/\{\{\s*email\s*\}\}/gi, s.sender_email ?? "")
    .replace(/\{\{\s*organization\s*\}\}/gi, s.sender_organization ?? "")
    .replace(/\{\{\s*country\s*\}\}/gi, s.sender_country ?? "")
    .replace(/\{\{\s*subject\s*\}\}/gi, s.subject ?? "");
}

function ReplyThread({ submission: s, onReplied }: { submission: Submission; onReplied: () => void }) {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("Re: " + s.subject);
  const [body, setBody] = useState("");
  const [department, setDepartment] = useState<string>(s.department ?? "general");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [snippetId, setSnippetId] = useState<string>("");


  async function load() {
    setLoading(true);
    try {
      const res = await listSubmissionMessages({ data: { submissionId: s.id } });
      setMessages((res.messages as ThreadMessage[]) ?? []);
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to load thread");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setSubject("Re: " + s.subject);
    setBody("");
    setMsg(null);
    setSnippetId("");
    setDepartment(s.department ?? (s.form_type === "careers" ? "careers" : s.form_type === "talent" ? "research" : "general"));
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.id]);

  useEffect(() => {
    listReplyTemplates()
      .then((r) => setSnippets((r.templates as Snippet[]) ?? []))
      .catch(() => {});
  }, []);

  function insertSnippet(id: string) {
    setSnippetId(id);
    if (!id) return;
    const snip = snippets.find((x) => x.id === id);
    if (!snip) return;
    setSubject(applyPlaceholders(snip.subject, s));
    setBody(applyPlaceholders(snip.body, s));
  }


  async function send() {
    if (!s.sender_email) {
      setMsg("This submission has no reply email.");
      return;
    }
    if (!body.trim()) {
      setMsg("Write a message first.");
      return;
    }
    setSending(true);
    setMsg(null);
    try {
      await sendAdminReply({
        data: { submissionId: s.id, subject: subject.trim(), body: body.trim(), fromDepartment: department as any },
      });
      setBody("");
      setMsg("Reply sent.");
      onReplied();
      await load();
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to send reply");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="pt-6 border-t border-border">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">In-house conversation</div>

      {loading && <div className="text-xs text-muted-foreground mb-3">Loading thread…</div>}

      {messages.length > 0 && (
        <ul className="space-y-3 mb-6">
          {messages.map((m) => (
            <li key={m.id} className="border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="text-xs text-muted-foreground">
                  <span className="uppercase tracking-wider text-[var(--gold)] mr-2">
                    {m.direction === "outbound" ? "Sent" : "Received"}
                  </span>
                  {m.from_label ? `${m.from_label} <${m.from_email}>` : m.from_email} → {m.to_email}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(m.created_at).toLocaleString()} · {m.status}
                </div>
              </div>
              <div className="text-sm font-medium mb-1">{m.subject}</div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.body_text}</p>
              {m.error_message && <div className="mt-2 text-xs text-red-600">{m.error_message}</div>}
            </li>
          ))}
        </ul>
      )}

      {s.sender_email ? (
        <div className="border border-border p-4 bg-white">
          {snippets.length > 0 && (
            <label className="text-xs block mb-3">
              <span className="block text-muted-foreground uppercase tracking-wider mb-1">
                Insert saved snippet
              </span>
              <select
                value={snippetId}
                onChange={(e) => insertSnippet(e.target.value)}
                className="w-full h-9 px-2 border border-border bg-background text-sm"
              >
                <option value="">— Choose a snippet —</option>
                {snippets.map((sn) => (
                  <option key={sn.id} value={sn.id}>
                    {sn.name}{sn.department ? ` · ${sn.department}` : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="grid sm:grid-cols-2 gap-3 mb-3">

            <label className="text-xs">
              <span className="block text-muted-foreground uppercase tracking-wider mb-1">From department</span>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-9 px-2 border border-border bg-background text-sm"
              >
                <option value="general">info@</option>
                <option value="business">business@</option>
                <option value="research">research@</option>
                <option value="careers">careers@</option>
                <option value="media">media@</option>
              </select>
            </label>
            <label className="text-xs">
              <span className="block text-muted-foreground uppercase tracking-wider mb-1">To</span>
              <input
                readOnly
                value={s.sender_email}
                className="w-full h-9 px-2 border border-border bg-muted/40 text-sm"
              />
            </label>
          </div>
          <label className="text-xs block mb-3">
            <span className="block text-muted-foreground uppercase tracking-wider mb-1">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-9 px-2 border border-border bg-background text-sm"
            />
          </label>
          <label className="text-xs block mb-3">
            <span className="block text-muted-foreground uppercase tracking-wider mb-1">Message</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="Write your reply…"
              className="w-full p-3 border border-border bg-background text-sm leading-relaxed"
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {msg && <span>{msg}</span>}
            </div>
            <button
              onClick={send}
              disabled={sending}
              className="btn-primary !py-2.5 !px-5 !text-xs disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send reply"}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">No reply-to email captured for this submission.</div>
      )}
    </div>
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
