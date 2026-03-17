import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diaverzum Novi Sad",
  description: "Udruženje obolelih od dijabetesa Diaverzum Novi Sad — podrška, informacije i zajednica za osobe sa dijabetesom.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
