import React from "react";


import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover"


import { Button, buttonVariants } from '../components/ui/button';

import { RxHamburgerMenu } from "react-icons/rx";

import { LuLayoutDashboard } from "react-icons/lu";

import { CgProfile } from "react-icons/cg";

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
    <div className="h-14 w-full border flex justify-between items-center pr-5 pl-5">
      <h1 className="font-semibold">Charger App</h1>  

      <Popover>
          <PopoverTrigger>
           <RxHamburgerMenu size={25}/>
          </PopoverTrigger>
          <PopoverContent className="w-[200px]">
            <Button asChild variant="ghost">
              <Link href="/dashboard" >Dashboard</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/profile"><CgProfile size={25}/>Profile</Link>
            </Button>
            <Button asChild variant="ghost">
              <span onClick={logout}><IoLogInOutline size={25}/>Log out</span>
            </Button>
          </PopoverContent>
      </Popover>
    </div>
  );
}

export default Navbar;
