"use client";

import Image from "next/image";

import Navbar from "../../components/navbar";

import { useState, useEffect } from "react";

import { supabase } from "../../lib/utils";

import { RotatingLines } from "react-loader-spinner";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

import { getUser } from "../utils";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState(null);

  useEffect(() => {
    const GetUser = async () => {
      try {
        let user = await getUser();

        if (user) {
          setUser(user);

          const { data: carsData, error } = await supabase
            .from("cars")
            .select()
            .eq("user_id", user.id);

          if (carsData) {
            setCars(carsData);
          }
        } else {
          toast("You need to log in with Google to access the dashboard");
          navigate("/");
        }
      } catch (error) {
        console.error(error);
      }
    };

    GetUser();
  }, []);

  return (
    <main className="w-screen h-screen">
      <div className="z-10 w-full py-4 items-center pl-10 font-mono text-sm lg:flex">
        <p className="text-3xl">Profile</p>
      </div>

      <div className="w-full py-10 bg-slate-200 flex justify-center items-center flex-col">
        {user && cars ? (
          <>
            <div className="z-10 w-full py-4 items-center justify-center font-mono text-sm lg:flex">
              <p className="text-3xl ">{`Welcome ${user.user_metadata.full_name}`}</p>
            </div>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <p>Plate number</p>
              <Input
                type="text"
                value={cars[0].plate_number}
                disabled={cars[0].plate_number ? true : false}
              />
              <Button
                type="submit"
                disabled={cars[0].plate_number ? true : false}
              >
                Save
              </Button>
            </div>
          </>
        ) : (
          <RotatingLines
            strokeColor="grey"
            strokeWidth="5"
            animationDuration="0.75"
            width="96"
          />
        )}
      </div>
    </main>
  );
}
