import { Fragment } from "react";
import { ArrowUpRight } from "lucide-react";
import { safeArticleUrl, splitArticleReferences } from "@/lib/article-presentation";

export function ArticleBody({ body }: { body: readonly string[] }) {
  const { paragraphs, references } = splitArticleReferences(body);
  const numbers = new Set(references.map((reference) => reference.number));

  function inline(text: string) {
    const pattern = /(\[[^\]\n]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s<>]+|\[\d+\])/g;
    return text.split(pattern).map((part, index) => {
      const citation = part.match(/^\[(\d+)\]$/);
      if (citation && numbers.has(Number(citation[1]))) {
        return <a key={index} href={`#reference-${citation[1]}`} aria-label={`Source ${citation[1]}`} className="font-medium text-primary underline decoration-gold underline-offset-4">{part}</a>;
      }
      const markdown = part.match(/^\[([^\]]+)\]\((https?:\/\/.*)\)$/);
      const raw = part.startsWith("http") ? part.replace(/[.,;:!?]+$/, "") : undefined;
      const url = safeArticleUrl(markdown?.[2] ?? raw ?? "");
      if (url) return <Fragment key={index}><a href={url} target="_blank" rel="noopener noreferrer" className="break-words text-primary underline decoration-gold underline-offset-4 hover:decoration-primary">{markdown?.[1] ?? raw}</a>{raw ? part.slice(raw.length) : ""}</Fragment>;
      return part;
    });
  }

  return (
    <div className="min-w-0">
      <div className="space-y-6 text-[17px] leading-[1.85] text-foreground">
        {paragraphs.map((paragraph, index) => {
          const section = paragraph.match(/^([A-Z][^:\n]{2,70}):\s+([\s\S]+)$/);
          return <div key={index}>{section && <h2 className="mb-3 mt-10 text-xl font-semibold leading-snug">{section[1]}</h2>}<p className="break-words">{inline(section?.[2] ?? paragraph)}</p></div>;
        })}
      </div>
      {references.length > 0 && <section aria-labelledby="article-references" className="mt-12 border-t border-border pt-8">
        <h2 id="article-references" className="mb-6 text-2xl font-semibold">Sources and references</h2>
        <ol className="divide-y divide-border">
          {references.map((reference) => {
            const url = safeArticleUrl(reference.url);
            return <li key={reference.number} id={`reference-${reference.number}`} className="grid scroll-mt-28 grid-cols-[2rem_minmax(0,1fr)] gap-3 py-5 text-sm">
              <span className="pt-1 font-semibold text-muted-foreground">[{reference.number}]</span>
              <div className="min-w-0">{url ? <a href={url} target="_blank" rel="noopener noreferrer" className="group block text-primary"><span className="font-medium leading-relaxed underline decoration-gold underline-offset-4 group-hover:decoration-primary">{reference.title}<ArrowUpRight aria-hidden="true" className="ml-1 inline size-4 shrink-0" /></span><span className="mt-2 block break-all text-xs leading-relaxed text-muted-foreground">{reference.url}</span></a> : <span>{reference.title}</span>}</div>
            </li>;
          })}
        </ol>
      </section>}
    </div>
  );
}