import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Club Events Hub | Discover Student Life",
  description: "A centralized platform for student clubs to manage events and for students to discover, register, and track their participation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-50 border-t py-12">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            <p>© 2026 Club Events Hub. Built for student communities.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
