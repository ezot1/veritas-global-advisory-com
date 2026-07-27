import type { ReactNode, CSSProperties } from "react";
import { useReveal } from "./useReveal";

/**
 * Wrap content with a scroll-triggered fade-up. Optional `delay` in seconds
 * cascades siblings.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "article" | "li" | "figure";
  className?: string;
  style?: CSSProperties;
}) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${inView ? "is-in" : ""} ${className}`}
      style={{ ["--reveal-delay" as string]: `${delay}s`, ...style }}
    >
      {children}
    </Tag>
  );
}
