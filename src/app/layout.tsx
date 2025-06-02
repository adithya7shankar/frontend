import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as a common, clean font
import "./globals.css";
import Layout from "@/components/Layout"; // Import the new Layout component

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans antialiased"> {/* Use a generic font class */}
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
