/** Count publicly listed briefings once per public article URL. */
export function countPublishedBriefings(...sources: ReadonlyArray<ReadonlyArray<{ slug: string }>>): number {
  return new Set(sources.flatMap((source) => source.map((article) => article.slug))).size;
}