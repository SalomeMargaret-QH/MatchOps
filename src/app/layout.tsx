import type { Metadata, Viewport } from "next";
import "./globals.css";
import SwRegister from "./sw-register";

export const metadata: Metadata = {
  title: {
    default: "MatchOps — Encuentra el trabajo que sí encaja contigo",
    template: "%s · MatchOps"
  },
  description:
    "Plataforma de matching de empleo: candidatos y empresas se conectan según intereses reales, con postulación en un clic.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" }
    ],
    apple: "/icons/icon-192.png"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MatchOps"
  },
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

export const viewport: Viewport = {
  themeColor: "#0f1b2d",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
