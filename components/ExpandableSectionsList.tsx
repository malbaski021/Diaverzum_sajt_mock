"use client";

import { useState } from "react";
import ExpandableSection from "@/components/ExpandableSection";
import type { DijabetesSection } from "@/lib/oDijabetesu";

interface ExpandableSectionsListProps {
  sections: DijabetesSection[];
}

export default function ExpandableSectionsList({ sections }: ExpandableSectionsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <div className="space-y-12">
      {sections.map((section) => (
        <ExpandableSection
          key={section.id}
          id={section.id}
          title={section.title}
          intro={section.intro}
          content={section.content}
          isExpanded={expandedId === section.id}
          onToggle={() => handleToggle(section.id)}
        />
      ))}
    </div>
  );
}
