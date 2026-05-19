import React from "react";

/** Renders text and converts @handles to clickable Instagram links. */
export default function InstaText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(@[\w.]+)/);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <a
            key={i}
            href={`https://www.instagram.com/${part.slice(1)}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-blue hover:underline"
          >
            {part}
          </a>
        ) : (
          part
        )
      )}
    </span>
  );
}
