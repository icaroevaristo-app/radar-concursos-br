import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radar Concursos BR",
  description:
    "Radar independente para organizar concursos públicos municipais e estaduais com base em fontes públicas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
