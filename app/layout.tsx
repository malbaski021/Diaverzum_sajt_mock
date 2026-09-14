import type { Metadata } from "next";
import "./globals.css";
import SiteShell from "@/components/SiteShell";

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
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
