import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getReplyLink, submitReplyViaLink } from "@/lib/reply-link.functions";

export const Route = createFileRoute("/reply/$token")({
  head: () => ({
    meta: [
      { title: "Reply | Veritas Global Advisory" },
      { name: "description", content: "Send your reply securely to the Veritas Global Advisory team." },
      { property: "og:title", content: "Reply | Veritas Global Advisory" },
      { property: "og:description", content: "Send your reply securely to the Veritas Global Advisory team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ReplyPage,
  errorComponent: () => (
    <Section>
      <p className="text-muted-foreground">This reply page could not be loaded. Please try again later.</p>
    </Section>
  ),
  notFoundComponent: () => (
    <Section>
      <p className="text-muted-foreground">This reply link was not found.</p>
    </Section>
  ),
});

function ReplyPage() {
  const { token } = Route.useParams();
  const loadLink = useServerFn(getReplyLink);
  const sendReply = useServerFn(submitReplyViaLink);

  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["reply-link", token],
    queryFn: () => loadLink({ data: { token } }),
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await sendReply({ data: { token, body } });
      setSent(true);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your reply.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Secure message"
        title="Reply to Veritas Global Advisory"
        subtitle="Your message goes straight to our team. No account needed."
      />
      <Section>
        <div className="mx-auto max-w-2xl">
          {isLoading ? (
            <p className="text-muted-foreground">Loading your conversation...</p>
          ) : !data?.valid ? (
            <p className="text-muted-foreground">
              This reply link has expired or is not valid. Please write to us at{" "}
              <a className="underline" href="mailto:info@veritasglobaladvisory.org">
                info@veritasglobaladvisory.org
              </a>
              .
            </p>
          ) : sent ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <h2 className="mb-2 text-xl font-semibold">Thank you, your reply has been delivered.</h2>
              <p className="text-muted-foreground">Our team will respond shortly.</p>
              <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="rounded-lg border border-border bg-card p-4 text-sm">
                <p className="font-medium">{data.subject}</p>
                <p className="text-muted-foreground">
                  Replying as {data.name ? `${data.name} (${data.email})` : data.email}
                </p>
              </div>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                minLength={2}
                maxLength={20000}
                rows={10}
                placeholder="Write your reply here"
                aria-label="Your reply"
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={busy || body.trim().length < 2}>
                {busy ? "Sending..." : "Send reply"}
              </Button>
            </form>
          )}
        </div>
      </Section>
    </>
  );
}
