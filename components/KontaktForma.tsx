"use client";

import { useState } from "react";

export default function KontaktForma() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Placeholder — ovde se može dodati pravo slanje (Resend, EmailJS, itd.)
    setSent(true);
  }

  return (
    <section aria-labelledby="forma-heading" className="mt-16 pt-12 border-t border-brand-gray-mid">
      <div className="max-w-2xl">
        <h2 id="forma-heading" className="text-2xl font-bold text-gray-900 mb-2">
          Imate pitanje za nas?
        </h2>
        <p className="text-gray-500 mb-8">Slobodno pitajte — odgovorićemo vam što pre.</p>

        {sent ? (
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
                placeholder="Napišite vaše pitanje ovde..."
                className="w-full px-4 py-3 border border-brand-gray-mid rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                aria-required="true"
              />
            </div>

            <button type="submit" className="btn-primary">
              Pošalji pitanje
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
