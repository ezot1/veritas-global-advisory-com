export type ArticleReference = { number: number; title: string; url: string };

export function splitArticleReferences(body: readonly string[]) {
  const heading = body.findIndex((paragraph) => /^(?:sources(?: and references)?|references|bibliography)\s*:?$/i.test(paragraph.trim()));
  const references: ArticleReference[] = [];
  const paragraphs = heading < 0 ? [...body] : body.slice(0, heading);
  if (heading >= 0) {
    for (const paragraph of body.slice(heading + 1)) {
      const match = paragraph.match(/^\s*\[(\d+)\]\s*(?:\[\d+\]\s*)*(.*?)\s*[-–—]\s*(https?:\/\/\S+)\s*$/);
      if (match) references.push({ number: Number(match[1]), title: match[2], url: match[3] });
      else paragraphs.push(paragraph);
    }
  }
  return { paragraphs, references };
}

export function safeArticleUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}