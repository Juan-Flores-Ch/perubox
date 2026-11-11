import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["600", "700", "900"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["600", "700"] });

export const metadata: Metadata = {
  title: "PerúBox · Productos peruanos, sabores que unen",
  description:
    "Arma tu box con productos 100% peruanos y envíala a todo el Perú y el mundo. Inca Kola, chocolates, snacks andinos, café y más.",
  icons: { icon: "/img/logo.webp" },
};

export const viewport: Viewport = { themeColor: "#7c1620" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${jakarta.variable} ${fraunces.variable} ${caveat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
