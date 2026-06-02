import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MatchOps",
  description: "Plataforma inteligente de matching de oportunidades"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
