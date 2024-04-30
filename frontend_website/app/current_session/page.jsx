"use client";

import React, { useState, useEffect } from "react";

import { supabase } from "../../lib/utils";

import { getCarById, getUser } from "../utils";

import Loader from "../../components/Loader";

import { CurrentlyCharging } from "../../components/CurrentlyCharging";

export default function Cars() {
  const [user, setUser] = useState(null);
  const [car, setCar] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await getUser();
      if (res) setUser(res);

      const carResponse = await getCarById(res.id);

      console.log(carResponse[0]);

      setCar(carResponse[0]);
    };
    fetchUser();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const channel = supabase
    .channel("realtime-cars")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "cars",
      },
      (payload) => {
        console.log(payload);

        setCar((prevState) => ({
          ...prevState,
          currently_charging: payload.new.currently_charging,
        }));
      }
    )
    .subscribe();

  if (!user || !car) return <Loader />;

  return (
    <div className="w-screen h-screen m-0 bg-gray-200 flex justify-center items-center flex-col">
      <div className="w-full py-10 flex justify-center items-center gap-4 flex-col">
        <h1 className="text-2xl">Current status:</h1>
        {car.currently_charging ? (
          <>
            <div className="flex flex-row">
              <h2 className="text-2xl">Charging</h2>
            </div>
            <div>
              <CurrentlyCharging presentage={10} />
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-2xl">Not Charging</h2>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
