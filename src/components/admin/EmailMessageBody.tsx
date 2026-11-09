/** Plain-text mail remains escaped; only paragraph spacing is presented here. */
export function EmailMessageBody({ text }: { text: string }) {
  const paragraphs = text.replace(/\r\n?/g, "\n").split(/\n[\t ]*\n+/).filter((part) => part.trim());
  return (
    <div className="min-w-0 space-y-4 text-sm leading-7 text-foreground [overflow-wrap:anywhere]">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-wrap">{paragraph}</p>
      ))}
    </div>
  );
}