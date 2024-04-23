import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";

import { Loader } from "../components/Loader"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Car Charger",
  description: "User interface to see current charging and previous invoices",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Suspense fallback={<Loader/>}>
      <body className={inter.className}>{children}</body>
      </Suspense>
    </html>
  );
}
