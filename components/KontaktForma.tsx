"use client";

import { useState } from "react";

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";

export default function KontaktForma() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [email, setEmail] = useState("");
  const [pitanje, setPitanje] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: "Novo pitanje sa sajta Diaverzum",
          from_name: "Diaverzum sajt",
          email,
          message: pitanje,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section aria-labelledby="forma-heading" className="mt-16 pt-12 border-t border-brand-gray-mid">
      <div className="max-w-2xl">
        <h2 id="forma-heading" className="text-2xl font-bold text-gray-900 mb-2">
          Imate pitanje za nas?
        </h2>
        <p className="text-gray-500 mb-8">Slobodno pitajte — odgovorićemo vam što pre.</p>

        {status === "sent" ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-2xl mb-2" aria-hidden="true">✅</p>
            <p className="font-semibold text-green-800">Poruka je poslata!</p>
            <p className="text-green-700 text-sm mt-1">Javićemo se na vašu email adresu.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email adresa <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vasa@email.com"
                className="w-full px-4 py-3 border border-brand-gray-mid rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="pitanje" className="block text-sm font-medium text-gray-700 mb-1.5">
                Pitanje <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <textarea
                id="pitanje"
                name="pitanje"
                required
                rows={5}
                value={pitanje}
                onChange={(e) => setPitanje(e.target.value)}
                placeholder="Napišite vaše pitanje ovde..."
                className="w-full px-4 py-3 border border-brand-gray-mid rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                aria-required="true"
              />
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Slanjem ovog formulara saglasni ste da Vaše ime i email adresu koristimo isključivo u svrhu odgovora na Vaše pitanje. Podatke ne delimo sa trećim stranama niti ih koristimo u marketinške svrhe. U skladu sa GDPR regulativom, imate pravo na uvid, ispravku i brisanje Vaših podataka.
            </p>

            {status === "error" && (
              <p className="text-red-600 text-sm">Došlo je do greške. Pokušajte ponovo ili nas kontaktirajte direktno.</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Slanje..." : "Pošalji pitanje"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
