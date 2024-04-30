"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

import { Button } from "../components/ui/button";
import { supabase } from "../lib/utils";
import { RxHamburgerMenu } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import { IoHomeSharp } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import Link from "next/link";

import { IoBatteryHalfOutline } from "react-icons/io5";
import { getUser, logout } from "../app/utils";

import { usePathname, useRouter } from "next/navigation";

function Navbar() {
  const [user, setUser] = useState(null);

  const pathName = usePathname();

  const router = useRouter();

  useEffect(() => {
    const fetchUserHelper = async () => {
      const res = await getUser();

      setUser(res);
    };

    fetchUserHelper();
  }, [pathName]);

  return (
    <div className="h-14 w-full border flex justify-between items-center pr-5 pl-5  lg:pr-10 lg:pl-10 ">
      <h1 className="font-semibold lg:text-xl">Charger App</h1>

      {user ? (
        <Popover>
          <PopoverTrigger>
            <RxHamburgerMenu size={35} />
          </PopoverTrigger>
          <PopoverContent className="w-[200px]">
            <Button
              asChild
              variant="ghost"
              className={`w-[90%] flex items-center justify-start ${
                pathName.includes("current") ? "bg-gray-200" : ""
              }`}
            >
              <Link href="/current_session">
                <IoBatteryHalfOutline size={25} className="mr-2" />
                Current
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className={`w-[90%] flex items-center justify-start ${
                pathName.includes("dashboard") ? "bg-gray-200" : ""
              }`}
            >
              <Link href="/dashboard">
                <IoHomeSharp size={25} className="mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className={`w-[90%] flex items-center justify-start ${
                pathName.includes("profile") ? "bg-gray-200" : ""
              }`}
            >
              <Link href="/profile">
                <CgProfile size={25} className="mr-2" />
                Profile
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              onClick={() => logout(router)}
              className="w-[90%] flex items-center justify-start"
            >
              <p className="cursor-pointer">
                <MdLogout size={25} className="mr-2" />
                Log out
              </p>
            </Button>
          </PopoverContent>
        </Popover>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Navbar;
