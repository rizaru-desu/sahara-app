import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

        <ToastContainer
          position="top-right"
          autoClose={false}
          limit={1}
          newestOnTop
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          theme="light"
        />
      </body>
    </html>
  );
}
