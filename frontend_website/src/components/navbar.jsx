import React from "react";


import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


import { Button } from '@/components/ui/button';

function Navbar() {
  return (
    <div className="h-14 w-full border flex justify-between items-center pr-5 pl-5">
    <h1 className="font-semibold">Charger App</h1>  

    <Popover>
        <PopoverTrigger><Button variant="ghost"><RxHamburgerMenu size={25}/></Button></PopoverTrigger>
        <PopoverContent className="w-[200px]">
        <Button variant="ghost" className="flex gap-3 w-full justify-start"><LuLayoutDashboard  size={25}/> <p>Dashboard</p> </Button>
        <Button variant="ghost" className="flex gap-3 w-full justify-start"><CgProfile  size={25}/> <p>Edit Profile</p> </Button>

        <button className={`${buttonVariants({ variant: "ghost" })} flex gap-3 w-full justify-start`} onClick={LogOut}><IoLogInOutline size={25}/> <p>Log out</p> </button>

        </PopoverContent>
    </Popover>
</div>
  );
}

export default Navbar;
