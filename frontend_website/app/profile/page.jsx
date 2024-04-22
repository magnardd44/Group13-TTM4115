'use client'


import Image from "next/image";

import Navbar from '../../components/navbar';
import { navigate } from "../actions";

import { useState, useEffect } from "react";

import { supabase } from "../../lib/utils";

import { RotatingLines } from "react-loader-spinner";


export default function Profile() {

  const [user, setUser] = useState(null);
  const [cars, setCars] = useState(null);


  useEffect(() => {

    const GetUser = async () => {
      try {
        const {data: userData, error } = await supabase.auth.getUser();
        
  
        if (userData.user) {
          setUser(userData.user)
          console.log(userData.user.id)

          const { data: carsData, error } = await supabase.from('cars').select().eq('user_id', userData.user.id);

          console.log(carsData)

          if (carsData) {
            setCars(carsData)
          }

        } else {
          toast('You need to log in with Google to access the dashboard')
          navigate('/')
        }
        
      } catch (error) {
        console.error(error)
      }
    }

  
    GetUser();
  }, [])



  return (
    <main className="w-screen h-screen">
      <div className="h-14 w-full border flex justify-center items-center">
      <Navbar/>

      </div>

      
      <div className="z-10 w-full py-4 items-center justify-center font-mono text-sm lg:flex">
        <p className="text-3xl ">Profile</p>
      </div>

      {user && cars ? <><div className="z-10 w-full py-4 items-center justify-center font-mono text-sm lg:flex">
        <p className="text-3xl ">{`Welcome ${user.user_metadata.full_name}`}</p>

      </div> <div className="w-full py-10 bg-slate-500 flex justify-center items-center">{cars.map((el) => {
        return <p className="text-3xl">{el.plate_number}</p>
      })}
        </div></>: <RotatingLines strokeColor="grey"
        strokeWidth="5"
        animationDuration="0.75"
        width="96"/>
      }
      
    </main>
  );
}
