import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google"; // Import Lora
import "./globals.css";
import Layout from "@/components/Layout"; // Import the new Layout component

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", weight: ["400", "700"] }); // Add Lora

export const metadata: Metadata = {
  title: "NewsReflect - Thoughtful News Discussion",
  description: "A platform for reflective commentaries on news articles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="font-sans antialiased bg-warm-bg text-warm-text-primary">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
