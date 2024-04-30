"use client";
import { redirect, useRouter, usePathname } from "next/navigation";
import Login from "../components/Login/Login";
import { getUser } from "./utils";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  const pathName = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      let user = await getUser();

      if (user && pathName == "/") router.push("/dashboard");
    };

    fetchUser();
  }, []);

  return (
    <main>
      <Login />
    </main>
  );
}
