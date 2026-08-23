import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

/* Montserrat é a tipografia oficial do manual de marca. */
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap"
});

/* Domínio próprio > URL da preview da Vercel > localhost. */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: site.title,
  description: site.description,
  keywords: [
    "marketplace",
    "entretenimento",
    "audiovisual",
    "freelancer",
    "produção",
    "talentos",
    "Sollo Business"
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: site.title,
    description:
      "Conecte-se com mentes brilhantes. Vagas por proximidade, chat integrado e avaliação em duas vias em um só app.",
    siteName: site.name,
    images: [{ url: "/og.png", width: 1172, height: 311, alt: "Sollo Business" }]
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ["/og.png"]
  },
  icons: { icon: "/icon.png", apple: "/icon.png" }
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
