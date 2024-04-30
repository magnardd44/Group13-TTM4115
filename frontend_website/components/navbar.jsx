import React from "react";


import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover"


import { Button } from '../components/ui/button';

import { RxHamburgerMenu } from "react-icons/rx";

import { LuLayoutDashboard } from "react-icons/lu";

import { CgProfile } from "react-icons/cg";

import { IoHomeSharp } from "react-icons/io5";

import { MdLogout } from "react-icons/md";

import Link from "next/link";

import { IoLogInOutline } from "react-icons/io5";
import { supabase } from "../lib/utils";
import { navigate } from "../app/actions";

function Navbar() {

  const logout = async () => {

    try {
      const {error} = await supabase.auth.signOut();

      if (!error) {
        navigate('/')
      }
    } catch (error) {
      console.error(error)
    }
  }



  return (
    <div className="h-14 w-full border flex justify-between items-center pr-5 pl-5  lg:pr-10 lg:pl-10 ">
      <h1 className="font-semibold lg:text-xl">Charger App</h1>  

      <Popover>
          <PopoverTrigger>
           <RxHamburgerMenu size={35}/>
          </PopoverTrigger>
          <PopoverContent className="w-[200px]">
            <Button asChild variant="ghost" className="w-[90%] flex items-center justify-start">
              <Link href="/dashboard"><IoHomeSharp size={25} className="mr-2"/>Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" className="w-[90%] flex items-center justify-start">
              <Link href="/profile"><CgProfile size={25} className="mr-2"/>Profile</Link>
            </Button>
            <Button asChild variant="ghost" onClick={logout} className="w-[90%] flex items-center justify-start"><p className="cursor-pointer"><MdLogout size={25} className="mr-2"/>Log out</p></Button>
          </PopoverContent>
      </Popover>
    </div>
  );
}

export default Navbar;
