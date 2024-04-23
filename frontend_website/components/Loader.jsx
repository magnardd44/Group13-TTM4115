'use client'

import React from "react";

import { RotatingLines } from "react-loader-spinner";

function Loader() {
  return (
    <div className="w-screen h-screen m-0 bg-slate-200 flex justify-center items-center flex-col">
        <RotatingLines strokeColor="grey"
        strokeWidth="5"
        animationDuration="0.75"
        width="96"/>
        <div className="pt-10">
            <p className="text-3xl font-semibold">Loading...</p>
        </div>
    </div>);
}

export default Loader;
