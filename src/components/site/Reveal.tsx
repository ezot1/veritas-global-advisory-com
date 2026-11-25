import type { ReactNode, CSSProperties } from "react";

export function Reveal({
  children,
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
  return (
    <Tag className={className} style={style}>
      {children}
    </Tag>
  );
}
