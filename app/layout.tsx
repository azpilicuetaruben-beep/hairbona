import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hairbona | Barbería Premium en Junín de los Andes",
  description:
    "Barbería premium en Junín de los Andes, Neuquén. Cortes de pelo, barba, perfilado de cejas, shaving tradicional y color. Reservá tu turno online.",
  keywords: [
    "barbería",
    "junín de los andes",
    "corte de pelo",
    "barba",
    "hairbona",
    "neuquén",
    "turnos",
  ],
  openGraph: {
    title: "Hairbona | Barbería Premium",
    description: "Reservá tu turno online en Hairbona, Junín de los Andes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-dark-950 text-dark-100 font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
