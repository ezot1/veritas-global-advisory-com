import { Linkedin, Twitter, Facebook, Link2, Mail, Check } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.134 1.585 5.939L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

type Channel = "linkedin" | "x" | "facebook" | "whatsapp" | "email" | "copy";

export function ShareButtons({
  title,
  summary,
  slug,
}: {
  title: string;
  summary: string;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary);

  const track = (channel: Channel) => {
    try {
      void supabase.from("article_share_events").insert({
        article_slug: slug,
        article_title: title.slice(0, 400),
        channel,
        referrer: typeof document !== "undefined" ? document.referrer.slice(0, 500) : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
      });
    } catch {}
  };

  const links: { name: string; channel: Channel; Icon: React.ComponentType<{ size?: number }>; href: string }[] = [
    { name: "LinkedIn", channel: "linkedin", Icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { name: "X", channel: "x", Icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { name: "Facebook", channel: "facebook", Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: "WhatsApp", channel: "whatsapp", Icon: WhatsAppIcon, href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}` },
    { name: "Email", channel: "email", Icon: Mail, href: `mailto:?subject=${encodedTitle}&body=${encodedSummary}%0A%0A${encodedUrl}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("copy");
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)] font-semibold">Share</span>
      {links.map(({ name, channel, Icon, href }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track(channel)}
          aria-label={`Share on ${name}`}
          className="inline-flex h-9 w-9 items-center justify-center border border-border text-[var(--navy-deep)] hover:bg-[var(--navy-deep)] hover:text-white hover:border-[var(--navy-deep)] transition-colors"
        >
          <Icon size={16} />
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label="Copy link"
        className="inline-flex h-9 w-9 items-center justify-center border border-border text-[var(--navy-deep)] hover:bg-[var(--navy-deep)] hover:text-white hover:border-[var(--navy-deep)] transition-colors"
      >
        {copied ? <Check size={16} /> : <Link2 size={16} />}
      </button>
    </div>
  );
}
