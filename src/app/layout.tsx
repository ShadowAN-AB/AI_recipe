import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RecipeAI — AI Recipe Personalizer",
  description:
    "Transform any recipe with AI-powered parsing, smart serving adjustments, nutrition tracking, and personalized recommendations. Your intelligent kitchen assistant.",
  keywords: [
    "recipe",
    "AI",
    "nutrition",
    "cooking",
    "meal planning",
    "grocery list",
    "calorie counter",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
