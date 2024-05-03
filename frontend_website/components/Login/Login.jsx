"use client";

import React from "react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "../ui/button";
import { LogInUser } from "../../app/utils";
import Image from "next/image";

import backgroundImage from "../../public/background_image.avif";

function Login() {
  return (
    <>
      <div className="z-10 h-screen w-full items-center justify-center text-sm flex flex-col">
        <h1 className="font-semibold text-xl text-center">
          Welcome to <span className="underline">Charge & Go</span>
        </h1>
        <div className="flex justify-center items-center flex-col md:flex-row gap-4 border rounded-xl p-4 md:p-10 shadow-xl m-4 bg-white">
          <h2 className="text-center md:text-left text-wrap w-10/12 md:w-7/12">
            Log in to start charging, see charging information or your charging
            history
          </h2>
          <Button className="flex gap-4" onClick={LogInUser}>
            <span>Log in with Google</span>
            <FcGoogle size={25} />
          </Button>
        </div>
      </div>
    </>
  );
}

export default Login;
