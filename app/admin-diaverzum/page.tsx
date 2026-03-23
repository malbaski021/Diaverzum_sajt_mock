"use client";

import { useState } from "react";

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

            {/* Upload dugme */}
            <button className="w-full bg-brand-blue text-white font-semibold py-3 rounded-lg hover:bg-brand-blue-dark transition-colors">
              Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
