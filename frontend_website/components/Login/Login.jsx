"use client";

import React from "react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "../ui/button";
import { LogInUser } from "../../app/utils";

function Login() {
  return (
    <>
      <div className="z-10 h-screen w-full items-center justify-center text-sm flex flex-col gap-20">
        <h1>
          Log in to start charging, see charging information or your charging
          history
        </h1>
        <Button className="flex gap-4" onClick={LogInUser}>
          <span>Log in with Google</span>
          <FcGoogle size={25} />
        </Button>
      </div>
    </>
  );
}

export default Login;
