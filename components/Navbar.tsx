"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const navLinks = [
  { label: "O nama", href: "/o-nama" },
  { label: "Vesti", href: "/vesti" },
  { label: "O dijabetesu", href: "/o-dijabetesu" },
  { label: "Blog", href: "/blog" },
  { label: "Članovi", href: "/clanovi" },
  { label: "Kontakt", href: "/kontakt" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      role="banner"
      className={`sticky top-0 z-40 w-full bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-md" : "border-b border-brand-gray-mid"
      }`}
    >
      <nav
        className="container-max flex items-center justify-between h-16 px-4"
        aria-label="Glavna navigacija"
      >
        {/* Logos */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg"
            aria-label="Diaverzum Novi Sad — početna"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE}/diaverzum-logo.png`}
              alt="Diaverzum Novi Sad"
              style={{ height: "90px", width: "auto", objectFit: "contain" }}
            />
          </Link>
          <Link
            href="/juniori"
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg"
            aria-label="Diaverzum Juniori"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE}/diaverzum-logo-juniors.png`}
              alt="Diaverzum Juniori"
              style={{ height: "90px", width: "auto", objectFit: "contain" }}
            />
          </Link>
        </div>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "bg-brand-blue-light text-brand-blue font-semibold"
                    : "text-gray-700 hover:bg-gray-100 hover:text-brand-blue"
                }`}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/donacije"
              className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold bg-brand-blue text-white hover:bg-brand-blue-dark transition-colors duration-150"
            >
              Donacije
            </Link>
          </li>
        </ul>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Zatvori meni" : "Otvori meni"}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="7" x2="21" y2="7" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden border-t border-brand-gray-mid bg-white overflow-hidden transition-all duration-200 ${
          menuOpen ? "max-h-96 py-2" : "max-h-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <ul className="px-4 pb-2 space-y-1" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-brand-blue-light text-brand-blue font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-current={pathname === link.href ? "page" : undefined}
                tabIndex={menuOpen ? 0 : -1}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/donacije"
              className="block px-4 py-3 rounded-lg text-sm font-semibold bg-brand-blue text-white hover:bg-brand-blue-dark transition-colors"
              tabIndex={menuOpen ? 0 : -1}
            >
              Donacije
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}

