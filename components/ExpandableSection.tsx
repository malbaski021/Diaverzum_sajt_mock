"use client";

import ReactMarkdown from "react-markdown";

interface ExpandableSectionProps {
  id: string;
  title: string;
  intro: string;
  content: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-gray-700 leading-relaxed mb-4 last:mb-0">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic">{children}</em>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc list-inside space-y-1 mb-4 text-gray-700">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal list-inside space-y-1 mb-4 text-gray-700">{children}</ol>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      className="text-brand-blue hover:underline"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">{children}</h3>
  ),
};

export default function ExpandableSection({ id, title, intro, content, isExpanded, onToggle }: ExpandableSectionProps) {
  const hasContent = content.trim().length > 0;

  return (
    <section
      id={id}
      aria-labelledby={`heading-${id}`}
      className="scroll-mt-24"
    >
      <h2
        id={`heading-${id}`}
        className="text-xl font-bold text-brand-blue mb-4 pb-2 border-b border-brand-gray-mid"
      >
        {title}
      </h2>

      <div>
        <ReactMarkdown components={markdownComponents}>{intro}</ReactMarkdown>
      </div>

      {hasContent && (
        <>
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
            }`}
            aria-hidden={!isExpanded}
          >
            <div className="overflow-hidden">
              <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-controls={`content-${id}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded-md px-3 py-2 -ml-3 transition-colors"
          >
            {isExpanded ? "Učitaj manje" : "Učitaj više"}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}
