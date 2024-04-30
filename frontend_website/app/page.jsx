'use client'

import { supabase } from "../lib/utils"
import { useEffect } from "react";
import Image from "next/image";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { redirect } from "next/navigation";
import { navigate } from "./actions";
import { toast } from "sonner"
import { Button } from '../components/ui/button';
import Loader from "../components/Loader";

export default function Home() {


  const [user, setUser] = useState(null);

  const GetUser = async () => {
    try {
      const {data, error } = await supabase.auth.getUser();
      
      console.log(data);

      if (data.user) {
        //navigate('dashboard')
        toast('Yippi')
        setUser(data.user)
        
      } else {
        toast('You need to log in with Google to access the dashboard')
      }
      
    } catch (error) {
      console.error(error)
    }
  }

  const LogIn = async() => {

    try {


      const {data, error } = await supabase.auth.getUser();
      
      console.log(data);

      if (!data.user) {
    
        const {data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: "http://localhost:3000/dashboard",
            queryParams: {
              prompt: "consent"
            }
          }
        });
      } 

      toast('Yippi')
      setUser(data.user)
            
    
      }
    catch (error) {
      console.error(error);
    }
  }


 


  const addNewUser = async () => {

    try {
      
      const {error} = await supabase.from('users').insert({"first_name": "testtest", "user_id": user.id})

      console.log(error)
    } catch (error) {
      console.error(error)
    }
  }


  const getCars = async () => {
    try {
      
      const {data, error} = await supabase.from('cars').select("*")

      console.log(data)
    } catch (error) {
      console.error(error)
    }
  }



  return (
    <main className="">
      <div className="h-14 w-full border flex justify-center items-center">
        <h1 className="font-semibold">Charger App</h1>  
      </div>
      
      <div className="z-10 h-screen w-full items-center justify-center text-sm flex flex-col gap-20">
        
        <h1>Log in to start charging, see charging information or your charging history</h1>
        {/* <ul>
          <li>start charging</li>
          <li>see your charging information</li>
          <li>See all</li>
        </ul> */}
        <Button onClick={() => console.log(user)}>log user</Button>
        <Button className="flex gap-4" onClick={LogIn}><span>Log in with Google</span><FcGoogle size={25}/></Button>

{/* 
        <button className="bg-white border-black border-2 flex flex-row justify-center items-center gap-2 px-4 py-2 text-2xl" onClick={GetUser}>Get user</button>


        <button className="bg-white border-black border-2 flex flex-row justify-center items-center gap-2 px-4 py-2 text-2xl" onClick={addNew}>Insert car</button>


        <button className="bg-white border-black border-2 flex flex-row justify-center items-center gap-2 px-4 py-2 text-2xl" onClick={getCars}>Fetch cars</button> */}
      </div>
    </main>
  );
}
