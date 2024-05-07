/* 
Make the page a client component 
Could have split up the code more, to utilize more of the server side
benefits, but we thought that this was outside the scope of the delivery.
*/

"use client";

// Imports
import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/utils";
import { getCarById, getUser } from "../utils";
import Loader from "../../components/Loader";
import { CurrentlyCharging } from "../../components/CurrentlyCharging";
import { Button } from "../../components/ui/button";
import mqtt from "mqtt";
import { mqttPublish } from "../utils";
import { FaChargingStation } from "react-icons/fa";

export default function Cars() {
  // States
  const [user, setUser] = useState(null);
  const [car, setCar] = useState(null);
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [connectStatus, setConnectStatus] = useState(null);
  const [currentCharge, setCurrentCharge] = useState(0);
  const [needsVerification, setNeedsVerification] = useState(false);

  // Constants for the MQTT connection
  const protocol = "wss";
  const host = "test.mosquitto.org";
  const port = "8081";
  const connectUrl = `${protocol}://${host}:${port}/`;
  const topic = "/group-13/server_client";

  // Listens to changes to the database for when the car starts charging.
  // This could also have been done with MQTT, but we decided to use the DB.
  useEffect(() => {
    const fetchUser = async () => {
      const res = await getUser();
      if (res) {
        setUser(res);

        console.log(res);

        const localChannel = supabase
          .channel("realtime-cars")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "cars",
              filter: `user_id=eq.${res.id}`,
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

        setChannel(localChannel);

        const carResponse = await getCarById(res.id);
        setCar(carResponse[0]);
      }
    };
    fetchUser();

    const client = mqtt.connect(connectUrl);

    if (client) {
      client.on("connect", () => {
        setClient(client);

        setConnectStatus(true);

        console.log("Connected");

        client.subscribe(topic);
      });

      client.on("message", (topic, message) => {
        const payload = { topic, message: JSON.parse(message.toString()) };
        console.log(payload);

        if (payload.message.current_charge != "") {
          setCurrentCharge(payload.message.current_charge);
        }

        if (payload.message.trigger == "app_request") {
          setNeedsVerification(true);
        } else {
          setNeedsVerification(false);
        }
      });
    }

    return () => {
      if (channel) supabase.removeChannel(channel);

      client.end();
    };
  }, []);

  if (!user || !car || !connectStatus) return <Loader />;

  return (
    <div className="h-screen flex justify-center items-center flex-col">
      <div className="w-full pb-10 flex justify-center items-center gap-4 flex-col">
        <h1 className="text-3xl">Current status:</h1>
        {car.currently_charging ? (
          <>
            <div>
              <CurrentlyCharging presentage={currentCharge} />
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-2xl bg-red-100 rounded-xl p-2 px-6">
                Not Charging
              </h2>
            </div>
          </>
        )}
      </div>
      {needsVerification ? (
        <>
          <div className=" py-5 px-10 flex justify-center items-center flex-col gap-4 border rounded-xl p-4 md:p-10 shadow-xl m-4 ">
            <h2 className="text-xl text-center">
              Press the button to activate the charging:
            </h2>
            <Button
              className="flex gap-2"
              onClick={() => {
                let isConfirmed = confirm(
                  "Are you sure that you want to start charging?"
                );
                if (isConfirmed) {
                  mqttPublish({ client: client, user_id: user.id });
                  setNeedsVerification(false);
                }
              }}
            >
              <span>Activate Charging</span> <FaChargingStation size={22} />
            </Button>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
