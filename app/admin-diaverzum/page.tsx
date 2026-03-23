"use client";

import { useState, useRef } from "react";

const EXISTING_TAGS = [
  "iskustvo", "tip 1", "lični stav", "izlet", "sport", "kopaonik",
  "ishrana", "radionica", "zdravlje", "vesti", "akcija", "svetski dan dijabetesa",
  "recept", "video", "škola", "kamp", "mladi", "prijave", "saveti",
  "glikemijski indeks", "edukacija", "mitovi", "dijabetes", "CGM", "RFZO",
  "prava pacijenata", "dijabetes tip 1", "terapija", "lekovi", "GLP-1",
  "svakodnevni život", "tip1", "trčanje", "joga", "zdrav život",
];

const today = new Date().toISOString().split("T")[0];

export default function AdminPage() {
  const [section, setSection] = useState("");
  const [izvor, setIzvor] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (section !== "clanovi") return;

    const name = nameRef.current?.value.trim() ?? "";
    const bio = bioRef.current?.value.trim() ?? "";
    const image = imageRef.current?.files?.[0] ?? null;

    if (!name) {
      setStatus({ ok: false, msg: "Ime i prezime su obavezni." });
      return;
    }

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("/api/admin/clanovi", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setStatus({ ok: true, msg: "Član uspešno dodat! Sajt će se ažurirati za koji minut." });
        if (nameRef.current) nameRef.current.value = "";
        if (bioRef.current) bioRef.current.value = "";
        if (imageRef.current) imageRef.current.value = "";
      } else {
        setStatus({ ok: false, msg: data.error ?? "Greška pri uploadu." });
      }
    } catch {
      setStatus({ ok: false, msg: "Greška pri uploadu." });
    } finally {
      setLoading(false);
    }
  }

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addNewTag = () => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setNewTag("");
  };

  const hasTitle = section === "blog" || section === "vesti" || section === "juniori";
  const hasOrientation = section === "blog" || section === "vesti" || section === "juniori";
  const hasDate = section === "blog" || section === "vesti" || section === "juniori";
  const hasTags = section === "blog" || section === "vesti" || section === "juniori";

  return (
    <div className="min-h-screen flex items-center justify-center py-12" style={{ backgroundColor: "#00adef" }}>
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Dodaj sadržaj</h1>

        {/* Sekcija */}
        <label className="block text-sm font-medium text-gray-700 mb-2">Sekcija</label>
        <select
          value={section}
          onChange={(e) => { setSection(e.target.value); setTags([]); setIzvor(""); }}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue mb-6"
        >
          <option value="" disabled>Izaberi sekciju...</option>
          <option value="clanovi">Članovi</option>
          <option value="blog">Blog</option>
          <option value="vesti">Vesti</option>
          <option value="juniori">Juniori</option>
        </select>

        {section && (
          <div className="space-y-6">

            {/* Ime i prezime — samo Članovi */}
            {section === "clanovi" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ime i prezime</label>
                <input
                  ref={nameRef}
                  type="text"
                  placeholder="Ime i prezime..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            )}

            {/* Naslov */}
            {hasTitle && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Naslov</label>
                <input
                  type="text"
                  placeholder="Naslov..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            )}

            {/* Slika */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slika</label>
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-brand-blue-light file:text-brand-blue cursor-pointer"
              />
            </div>

            {/* Orijentacija slike */}
            {hasOrientation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Orijentacija slike</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue">
                  <option value="" disabled>Izaberi orijentaciju...</option>
                  <option value="portrait">Portret</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            )}

            {/* Tekst */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tekst</label>
              <textarea
                ref={bioRef}
                rows={6}
                placeholder="Unesi tekst..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
              />
            </div>

            {/* Izvor — samo Vesti */}
            {section === "vesti" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Izvor vesti</label>
                  <select
                    value={izvor}
                    onChange={(e) => setIzvor(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="" disabled>Izaberi izvor...</option>
                    <option value="redakcija">Redakcija Diaverzuma</option>
                    <option value="drugi">Drugi izvor...</option>
                  </select>
                </div>
                {izvor === "drugi" && (
                  <input
                    type="text"
                    placeholder="Upiši izvor..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                )}
              </div>
            )}

            {/* Autor — Blog i Juniori */}
            {(section === "blog" || section === "juniori") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Autor</label>
                <input
                  type="text"
                  placeholder="Ime i prezime autora..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            )}

            {/* Datum */}
            {hasDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Datum objave</label>
                <input
                  type="date"
                  defaultValue={today}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            )}

            {/* Tagovi */}
            {hasTags && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tagovi</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {EXISTING_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        tags.includes(tag)
                          ? "bg-brand-blue text-white border-brand-blue"
                          : "bg-white text-gray-600 border-gray-300 hover:border-brand-blue"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {tags.filter((t) => !EXISTING_TAGS.includes(t)).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.filter((t) => !EXISTING_TAGS.includes(t)).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-brand-blue text-white">
                        {tag}
                        <button type="button" onClick={() => toggleTag(tag)} className="hover:opacity-70">✕</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNewTag())}
                    placeholder="Novi tag..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                  <button
                    type="button"
                    onClick={addNewTag}
                    className="px-4 py-2 bg-brand-blue-light text-brand-blue text-sm font-medium rounded-lg hover:bg-brand-blue hover:text-white transition-colors"
                  >
                    Dodaj
                  </button>
                </div>
              </div>
            )}

            {/* Status poruka */}
            {status && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${status.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {status.ok ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12" y2="16" />
                  </svg>
                )}
                {status.msg}
              </div>
            )}

            {/* Upload dugme */}
            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full bg-brand-blue text-white font-semibold py-3 rounded-lg hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
