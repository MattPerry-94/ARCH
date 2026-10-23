import { Archivo, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata = {
  title: "ARCH · Pensée pour vos pieds. Réglée par vous.",
  description:
    "ARCH, la première semelle intelligente qui se transforme sous votre pied. Capteurs, IA embarquée et micro-chambres d'air pilotées depuis votre téléphone.",
  openGraph: {
    title: "ARCH",
    description: "Pensée pour vos pieds. Réglée par vous.",
    locale: "fr_FR",
    type: "website",
  },
};

export const viewport = { themeColor: "#050709", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${archivo.variable} ${geist.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
