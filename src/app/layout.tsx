import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "logistics Sahara Bogatama indonesia",
  description: "Pencatatan dan distribusi kebab.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark:bg-white bg-white`}>
        {children}
      </body>
    </html>
  );
}
