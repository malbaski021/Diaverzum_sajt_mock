"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

interface Props {
  placeholder?: string;
}

export default function SearchBar({ placeholder = "Pretraži..." }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  return (
    <div className="relative">
      <label htmlFor="search-input" className="sr-only">
        Pretraži
      </label>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <input
        id="search-input"
        type="search"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          handleSearch(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 border border-brand-gray-mid rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
        aria-label={placeholder}
      />
    </div>
  );
}
