"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbar";
import { Suspense } from "react";
import Loader from "../components/Loader";

import { usePathname, useRouter } from "next/navigation";

import { useEffect } from "react";
import { getUser } from "./utils";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathName = usePathname();

  const router = useRouter();

  console.log(pathName);

  useEffect(() => {
    const handleRouteChange = async () => {
      const user = await getUser();

      if (pathName != "/" && !user) {
        router.back();
      }
    };

    handleRouteChange();
  }, [pathName]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<Loader />}>
          <Navbar />
          {children}
        </Suspense>
      </body>
    </html>
  );
}
