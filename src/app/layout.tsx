import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MatchOps — Encuentra el trabajo que sí encaja contigo",
    template: "%s · MatchOps"
  },
  description:
    "Plataforma de matching de empleo: candidatos y empresas se conectan según intereses reales, con postulación en un clic.",
  icons: {
    icon: "/favicon.svg"
  },
  themeColor: "#0f1b2d",
  openGraph: {
    title: "MatchOps — Encuentra el trabajo que sí encaja contigo",
    description:
      "Matching inteligente de empleo. Postula en un clic, con reputación transparente para candidatos y empresas.",
    siteName: "MatchOps",
    locale: "es_PE",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "MatchOps",
    description: "Encuentra el trabajo que sí encaja contigo."
  }
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
