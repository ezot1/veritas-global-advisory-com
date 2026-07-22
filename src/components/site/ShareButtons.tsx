import { Linkedin, Twitter, Facebook, Link2, Mail, Check } from "lucide-react";
import { useState } from "react";

export function ShareButtons({ title, summary }: { title: string; summary: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary);

  const links = [
    { name: "LinkedIn", Icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { name: "X", Icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { name: "Facebook", Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: "Email", Icon: Mail, href: `mailto:?subject=${encodedTitle}&body=${encodedSummary}%0A%0A${encodedUrl}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)] font-semibold">Share</span>
      {links.map(({ name, Icon, href }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
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
