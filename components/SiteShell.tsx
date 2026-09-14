"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin-diaverzum");

  return (
    <>
      {!isAdmin && (
        <a href="#main-content" className="skip-to-content">
          Preskoči na sadržaj
        </a>
      )}
      {!isAdmin && <Navbar />}
      <main id="main-content">{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}
