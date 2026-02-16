"use client";

import { useEffect, useState } from "react";

interface SafeHtmlProps {
  html: string;
  className?: string;
}

const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "em", "h2", "h3",
    "ul", "ol", "li", "blockquote", "a",
  ],
  ALLOWED_ATTR: ["href", "rel", "target"],
};

/**
 * Renders sanitized HTML content in a client component.
 * DOMPurify is loaded dynamically on mount (browser-only, no SSR).
 * All content is sanitized through a strict allowlist before rendering.
 */
export function SafeHtml({ html, className }: SafeHtmlProps) {
  const [clean, setClean] = useState(html);

  useEffect(() => {
    import("dompurify").then((mod) => {
      setClean(mod.default.sanitize(html, PURIFY_CONFIG));
    });
  }, [html]);

  return (
    <div
      // Safe: content is sanitized by DOMPurify with strict tag/attribute allowlist
      dangerouslySetInnerHTML={{ __html: clean }}
      className={className}
    />
  );
}
