"use client";

import Image from "next/image";

import Navbar from "../../components/navbar";

import { useState, useEffect, use } from "react";

import { supabase } from "../../lib/utils";

import { RotatingLines } from "react-loader-spinner";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

import Loader from "../../components/Loader";

import { addCar, getUser } from "../utils";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);

  const [currentPlateNumber, setCurrentPlateNumber] = useState("");

  const [isDisabled, setIsDisabled] = useState(false);

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
          if (carsData.length > 0) {
            setIsDisabled(true);
            setCurrentPlateNumber(carsData[0].plate_number);
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

  if (!user || !cars) return <Loader />;

  return (
    <main className="h-screen w-full flex items-center justify-center flex-col">
      <div className="z-10 w-full my-6 flex items-center justify-center font-mono text-sm lg:flex">
        <p className="text-3xl text-center">Your Profile</p>
      </div>

      <div className="py-10 flex justify-center items-center flex-col border rounded-xl p-4 md:p-10 shadow m-4">
        <div className="z-10 w-full py-6 items-center justify-center font-mono text-sm flex">
          <p className="text-3xl text-center">{`Welcome ${user.user_metadata.full_name}`}</p>
        </div>
        <div className="flex w-full max-w-sm items-center space-x-2 flex-col gap-2">
          <p>
            {cars.plate_number != ""
              ? "Your current plate number:"
              : "Enter your plate number:"}
          </p>
          <div className="flex gap-1">
            <Input
              type="text"
              value={currentPlateNumber}
              onChange={(el) => setCurrentPlateNumber(el.target.value)}
              disabled={isDisabled}
            />
            <Button
              type="submit"
              disabled={isDisabled}
              onClick={() => {
                let isUserSure = confirm(
                  "Are you sure that you entered the correct number"
                );

                if (isUserSure) {
                  addCar({
                    plate_number: currentPlateNumber,
                    user_id: user.id,
                    currently_charging: false,
                    car_id: "",
                    needs_verification: false,
                  });

                  setIsDisabled(true);
                }
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
