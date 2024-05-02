"use client";

import React, { useState, useEffect } from "react";

import { supabase } from "../../lib/utils";

import { getCarById, getUser } from "../utils";

import Loader from "../../components/Loader";

import { CurrentlyCharging } from "../../components/CurrentlyCharging";
import { Button } from "../../components/ui/button";

import mqtt from "mqtt";

export default function Cars() {
  const [user, setUser] = useState(null);
  const [car, setCar] = useState(null);

  const [connectStatus, setConnectStatus] = useState(null);

  const [currentCharge, setCurrentCharge] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await getUser();
      if (res) setUser(res);

      const carResponse = await getCarById(res.id);
      setCar(carResponse[0]);
    };
    fetchUser();

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
            needs_verification: payload.new.needs_verification,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const protocol = "wss";
  const host = "test.mosquitto.org";
  const port = "8081";
  const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

  const connectUrl = `${protocol}://${host}:${port}/`;

  const topic = "/group-13/charger_server";

  useEffect(() => {
    const client = mqtt.connect(connectUrl);

    if (client) {
      client.on("connect", () => {
        setConnectStatus("Connected");

        console.log("Connected");

        client.subscribe(topic);
      });

      client.on("message", (topic, message) => {
        const payload = { topic, message: JSON.parse(message.toString()) };
        console.log(payload);

        if (payload.message.current_charge != "") {
          setCurrentCharge(payload.message.current_charge);
        }
      });
    }

    return () => {
      client.end();
    };
  }, []);

  if (!user || !car || !connectStatus == "Connected") return <Loader />;

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
              <CurrentlyCharging presentage={currentCharge} />
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-2xl">Not Charging</h2>
            </div>
          </>
        )}

        {car.needs_verification ? (
          <>
            <div className="bg-red-200 py-5 px-10">
              <h2>Press the button to activate the charging:</h2>
              <Button onClick={() => sendMessage()}>Activate</Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-2xl">Nothin</h2>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
