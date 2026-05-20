"use client";

import { useCallback, useEffect, useState } from "react";

interface DijabetesSection {
  id: string;
  title: string;
  intro: string;
  content: string;
  archived: boolean;
}

interface EditableSection extends DijabetesSection {
  _key: string;
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition";
const textareaCls = inputCls + " resize-y min-h-[100px]";

function makeKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function withKeys(sections: DijabetesSection[]): EditableSection[] {
  return sections.map((s) => ({ ...s, _key: s.id || makeKey() }));
}

function stripKeys(sections: EditableSection[]): DijabetesSection[] {
  return sections.map(({ _key, ...rest }) => rest);
}

function sectionsEqual(a: EditableSection[], b: EditableSection[]): boolean {
  return JSON.stringify(stripKeys(a)) === JSON.stringify(stripKeys(b));
}

export default function ODijabetesuAdmin() {
  const [sections, setSections] = useState<EditableSection[]>([]);
  const [initialSections, setInitialSections] = useState<EditableSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const isDirty = !sectionsEqual(sections, initialSections);

  const loadSections = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/o-dijabetesu");
      if (!res.ok) throw new Error("Učitavanje nije uspelo.");
      const data = await res.json();
      const withK = withKeys(data.sections ?? []);
      setSections(withK);
      setInitialSections(withK);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Greška pri učitavanju.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const updateSection = (key: string, patch: Partial<DijabetesSection>) => {
    setSections((prev) => prev.map((s) => (s._key === key ? { ...s, ...patch } : s)));
    setStatus(null);
  };

  const moveSection = (key: string, direction: -1 | 1) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s._key === key);
      const target = idx + direction;
      if (idx === -1 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
    setStatus(null);
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { _key: makeKey(), id: "", title: "", intro: "", content: "", archived: false },
    ]);
    setStatus(null);
  };

  const deleteSection = (key: string, title: string) => {
    const label = title.trim() || "novu kategoriju";
    if (!window.confirm(`Da li sigurno želiš da obrišeš "${label}"?`)) return;
    setSections((prev) => prev.filter((s) => s._key !== key));
    setStatus(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/o-dijabetesu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: stripKeys(sections) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ ok: false, msg: data.error ?? "Čuvanje nije uspelo." });
        return;
      }
      const withK = withKeys(data.sections ?? []);
      setSections(withK);
      setInitialSections(withK);
      setStatus({ ok: true, msg: "Izmene sačuvane." });
    } catch (err) {
      setStatus({ ok: false, msg: err instanceof Error ? err.message : "Greška pri čuvanju." });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (!window.confirm("Odbaciti sve nesačuvane izmene?")) return;
    setSections(initialSections);
    setStatus(null);
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500 p-6">Učitavanje…</div>
    );
  }

  if (loadError) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">O dijabetesu</h2>
          <p className="text-sm text-gray-500 mt-1">
            Kategorije se prikazuju na stranici redom koji vidiš ispod. Arhivirane kategorije se ne prikazuju.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              type="button"
              onClick={handleDiscard}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Odbaci izmene
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#0056b3] rounded-lg hover:bg-[#003d80] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? "Čuva…" : "Sačuvaj sve izmene"}
          </button>
        </div>
      </div>

      {status && (
        <div
          role="status"
          className={`px-4 py-3 rounded-lg text-sm ${
            status.ok
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {status.msg}
        </div>
      )}

      {isDirty && (
        <div className="px-4 py-2 rounded-lg text-xs bg-amber-50 border border-amber-200 text-amber-800">
          Imaš nesačuvane izmene.
        </div>
      )}

      <ul className="space-y-4">
        {sections.map((s, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === sections.length - 1;
          const titleEmpty = !s.title.trim();
          const introEmpty = !s.intro.trim();
          return (
            <li
              key={s._key}
              className={`bg-white border rounded-xl p-5 space-y-3 ${
                s.archived ? "border-gray-200 opacity-60" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => moveSection(s._key, -1)}
                    disabled={isFirst}
                    aria-label="Pomeri nagore"
                    title="Pomeri nagore"
                    className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(s._key, 1)}
                    disabled={isLast}
                    aria-label="Pomeri nadole"
                    title="Pomeri nadole"
                    className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Naslov
                  </label>
                  <input
                    type="text"
                    value={s.title}
                    onChange={(e) => updateSection(s._key, { title: e.target.value })}
                    placeholder="npr. Šta je dijabetes?"
                    className={inputCls}
                  />
                  {s.id && (
                    <p className="text-xs text-gray-400 mt-1 font-mono">ID: {s.id}</p>
                  )}
                  {!s.id && s.title.trim() && (
                    <p className="text-xs text-gray-400 mt-1 italic">
                      ID će se generisati pri čuvanju.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={s.archived}
                      onChange={(e) => updateSection(s._key, { archived: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[#0056b3] focus:ring-[#0056b3]"
                    />
                    Arhivirano
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteSection(s._key, s.title)}
                    aria-label="Obriši kategoriju"
                    title="Obriši kategoriju"
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Intro <span className="text-gray-400 normal-case font-normal">(uvek vidljiv)</span>
                </label>
                <textarea
                  value={s.intro}
                  onChange={(e) => updateSection(s._key, { intro: e.target.value })}
                  rows={4}
                  placeholder="Kratak uvodni tekst koji se prikazuje uvek…"
                  className={textareaCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Pun sadržaj <span className="text-gray-400 normal-case font-normal">(prikazuje se na "Učitaj više"; opciono)</span>
                </label>
                <textarea
                  value={s.content}
                  onChange={(e) => updateSection(s._key, { content: e.target.value })}
                  rows={8}
                  placeholder="Pun tekst, podržava markdown (bold, liste, linkovi)…"
                  className={textareaCls}
                />
              </div>

              {(titleEmpty || introEmpty) && (
                <p className="text-xs text-amber-700">
                  {titleEmpty ? "Naslov je obavezan. " : ""}
                  {introEmpty ? "Intro je obavezan." : ""}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div>
        <button
          type="button"
          onClick={addSection}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0056b3] bg-[#e8f0fb] hover:bg-[#d4e4f7] rounded-lg transition"
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Dodaj novu kategoriju
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-gray-200">
        {isDirty && (
          <button
            type="button"
            onClick={handleDiscard}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Odbaci izmene
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="px-4 py-2 text-sm font-semibold text-white bg-[#0056b3] rounded-lg hover:bg-[#003d80] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {saving ? "Čuva…" : "Sačuvaj sve izmene"}
        </button>
      </div>
    </div>
  );
}
