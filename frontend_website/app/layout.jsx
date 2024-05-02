"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbar";
import { Suspense } from "react";
import Loader from "../components/Loader";

import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathName = usePathname();

  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<Loader />}>
          {pathName != "/" ? <Navbar /> : <></>}
          {children}
        </Suspense>
      </body>
    </html>
  );
}
