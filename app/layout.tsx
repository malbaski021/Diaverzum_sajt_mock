import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Diaverzum Novi Sad",
    template: "%s | Diaverzum Novi Sad",
  },
  description:
    "Udruženje obolelih od dijabetesa Diaverzum Novi Sad — podrška, informacije i zajednica za osobe sa dijabetesom.",
  keywords: ["dijabetes", "udruženje", "Novi Sad", "osobe sa dijabetesom", "zdravlje"],
  openGraph: {
    siteName: "Diaverzum Novi Sad",
    locale: "sr_RS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body>
        <a href="#main-content" className="skip-to-content">
          Preskoči na sadržaj
        </a>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
