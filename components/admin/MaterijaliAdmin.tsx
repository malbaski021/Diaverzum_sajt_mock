"use client";

import { useCallback, useEffect, useState } from "react";

interface Materijal {
  file: string;
  archived: boolean;
}

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx";
const MAX_SIZE = 10 * 1024 * 1024;

function titleFromFile(file: string): string {
  return file.replace(/\.(pdf|doc|docx|xls|xlsx)$/i, "");
}

function fileIcon(file: string) {
  const ext = file.toLowerCase().split(".").pop() ?? "";
  const color =
    ext === "pdf" ? "text-red-500" :
    ext === "doc" || ext === "docx" ? "text-blue-500" :
    ext === "xls" || ext === "xlsx" ? "text-green-600" :
    "text-gray-500";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={color} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export default function MaterijaliAdmin() {
  const [items, setItems] = useState<Materijal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/materijali");
      if (!res.ok) throw new Error("Učitavanje nije uspelo.");
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Greška pri učitavanju.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const validate = (file: File): string | null => {
    if (!/\.(pdf|doc|docx|xls|xlsx)$/i.test(file.name)) {
      return `${file.name}: nepodržan tip (samo PDF, DOC, DOCX, XLS, XLSX).`;
    }
    if (file.size > MAX_SIZE) {
      return `${file.name}: veći od 10 MB.`;
    }
    if (items.some((m) => m.file === file.name)) {
      return `${file.name}: već postoji u listi. Preimenuj pre upload-a.`;
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus(null);
    const files = Array.from(e.target.files ?? []);
    const errors: string[] = [];
    const valid: File[] = [];
    for (const f of files) {
      const err = validate(f);
      if (err) errors.push(err);
      else if (pending.some((p) => p.name === f.name)) {
        errors.push(`${f.name}: već u pending listi.`);
      } else {
        valid.push(f);
      }
    }
    if (errors.length) {
      setStatus({ ok: false, msg: errors.join(" ") });
    }
    if (valid.length) {
      setPending((prev) => [...prev, ...valid]);
    }
    e.target.value = "";
  };

  const removePending = (name: string) => {
    setPending((prev) => prev.filter((f) => f.name !== name));
  };

  const handleUpload = async () => {
    if (!pending.length) return;
    setUploading(true);
    setStatus(null);
    setUploadProgress({ current: 0, total: pending.length });
    const failed: string[] = [];
    let latestItems: Materijal[] = items;

    for (let i = 0; i < pending.length; i++) {
      const file = pending[i];
      setUploadProgress({ current: i + 1, total: pending.length });
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/materijali", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          failed.push(`${file.name}: ${data.error ?? "greška"}`);
        } else {
          latestItems = data.items ?? latestItems;
        }
      } catch (err) {
        failed.push(`${file.name}: ${err instanceof Error ? err.message : "greška"}`);
      }
    }

    setItems(latestItems);
    setPending([]);
    setUploadProgress(null);
    setUploading(false);
    if (failed.length) {
      setStatus({ ok: false, msg: `Neki fajlovi nisu uploadovani: ${failed.join("; ")}` });
    } else {
      setStatus({ ok: true, msg: "Svi fajlovi uploadovani." });
    }
  };

  const toggleSelect = (file: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(file)) next.delete(file);
      else next.add(file);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === items.length && items.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((m) => m.file)));
    }
  };

  const handleBulkArchive = async (action: "archive" | "unarchive") => {
    if (!selected.size) return;
    const files = Array.from(selected);
    setBulkBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/materijali", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ ok: false, msg: data.error ?? "Akcija nije uspela." });
      } else {
        setItems(data.items ?? []);
        setSelected(new Set());
        setStatus({
          ok: true,
          msg: action === "archive" ? "Arhivirano." : "Vraćeno iz arhive.",
        });
      }
    } catch (err) {
      setStatus({ ok: false, msg: err instanceof Error ? err.message : "Greška." });
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.size) return;
    const files = Array.from(selected);
    if (!window.confirm(`Trajno obrisati ${files.length} fajl${files.length > 1 ? "ova" : ""}? Ova akcija se ne može poništiti.`)) {
      return;
    }
    setBulkBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/materijali", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ ok: false, msg: data.error ?? "Brisanje nije uspelo." });
      } else {
        setItems(data.items ?? []);
        setSelected(new Set());
        setStatus({ ok: true, msg: "Obrisano." });
      }
    } catch (err) {
      setStatus({ ok: false, msg: err instanceof Error ? err.message : "Greška." });
    } finally {
      setBulkBusy(false);
    }
  };

  const anySelectedArchived = items.some((m) => selected.has(m.file) && m.archived);
  const anySelectedActive = items.some((m) => selected.has(m.file) && !m.archived);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Materijali</h2>
        <p className="text-sm text-gray-500 mt-1">
          PDF, DOC, DOCX, XLS, XLSX za skidanje. Maks. 10 MB po fajlu.
        </p>
      </div>

      {/* Upload */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Upload novi
        </p>
        <input
          type="file"
          multiple
          accept={ACCEPT}
          onChange={handleFileSelect}
          disabled={uploading}
          className="w-full text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#e8f0fb] file:text-[#0056b3] hover:file:bg-[#d4e4f7] file:cursor-pointer cursor-pointer"
        />

        {pending.length > 0 && (
          <ul className="space-y-1.5 border-t border-gray-100 pt-3">
            {pending.map((f) => (
              <li
                key={f.name}
                className="flex items-center justify-between gap-2 text-xs text-gray-700 bg-gray-50 rounded-md px-2 py-1.5"
              >
                <span className="flex items-center gap-2 min-w-0">
                  {fileIcon(f.name)}
                  <span className="truncate">{f.name}</span>
                  <span className="text-gray-400 flex-shrink-0">
                    ({(f.size / 1024).toFixed(0)} KB)
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removePending(f.name)}
                  disabled={uploading}
                  aria-label="Ukloni iz liste"
                  className="text-gray-400 hover:text-red-600 transition flex-shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={!pending.length || uploading}
          className="w-full px-4 py-2 text-sm font-semibold text-white bg-[#0056b3] rounded-lg hover:bg-[#003d80] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {uploading
            ? uploadProgress
              ? `Upload ${uploadProgress.current} / ${uploadProgress.total}…`
              : "Upload…"
            : pending.length
              ? `Upload ${pending.length} fajl${pending.length > 1 ? "ova" : ""}`
              : "Upload"}
        </button>
      </div>

      {/* Status */}
      {status && (
        <div
          role="status"
          className={`px-3 py-2 rounded-lg text-xs ${
            status.ok
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {status.msg}
        </div>
      )}

      {/* Lista */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Postojeći ({items.length})
          </p>
          {items.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs text-[#0056b3] hover:underline"
            >
              {selected.size === items.length ? "Poništi izbor" : "Izaberi sve"}
            </button>
          )}
        </div>

        {loading && (
          <p className="px-4 py-6 text-sm text-gray-500">Učitavanje…</p>
        )}

        {loadError && (
          <p className="px-4 py-6 text-sm text-red-600">{loadError}</p>
        )}

        {!loading && !loadError && items.length === 0 && (
          <p className="px-4 py-6 text-sm text-gray-500">Nema materijala.</p>
        )}

        {!loading && !loadError && items.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {items.map((m) => (
              <li
                key={m.file}
                className={`flex items-center gap-3 px-4 py-2.5 ${
                  m.archived ? "opacity-60" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(m.file)}
                  onChange={() => toggleSelect(m.file)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0056b3] focus:ring-[#0056b3] flex-shrink-0"
                  aria-label={`Izaberi ${m.file}`}
                />
                {fileIcon(m.file)}
                <a
                  href={`/content/materijal/${encodeURIComponent(m.file)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 text-sm text-gray-900 hover:text-[#0056b3] truncate"
                  title={m.file}
                >
                  {titleFromFile(m.file)}
                </a>
                {m.archived && (
                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    arhivirano
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bulk akcije */}
      {selected.size > 0 && (
        <div className="sticky bottom-0 bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-700 flex-1">
            Izabrano: <strong>{selected.size}</strong>
          </span>
          {anySelectedActive && (
            <button
              type="button"
              onClick={() => handleBulkArchive("archive")}
              disabled={bulkBusy}
              className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 disabled:opacity-50 transition"
            >
              Arhiviraj
            </button>
          )}
          {anySelectedArchived && (
            <button
              type="button"
              onClick={() => handleBulkArchive("unarchive")}
              disabled={bulkBusy}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Vrati iz arhive
            </button>
          )}
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={bulkBusy}
            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 transition"
          >
            Obriši
          </button>
        </div>
      )}
    </div>
  );
}
