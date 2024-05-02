import { cache } from "react";
import { supabase } from "../lib/utils";

export const LogInUser = async () => {
  try {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/dashboard",
        queryParams: {
          prompt: "consent",
        },
      },
    });
  } catch (error) {
    throw new Error("Failed to sign in user");
  }
};

export const getUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

    console.log("FRA GETUSER");
    console.log(data);

    if (data.user) {
      return data.user;
    }
  } catch (error) {
    return null;
  }
};

export const getCarById = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("user_id", user_id);
    return data;
  } catch (error) {
    return null;
  }
};

export const logout = async (router) => {
  try {
    const { error } = await supabase.auth.signOut();

    console.log(error);

    if (!error) {
      router.push("/");
    }
  } catch (error) {
    console.error(error);
  }
};

export const addCar = async (inputData) => {
  try {
    const { data, error } = await supabase.from("cars").insert({
      plate_number: inputData.plate_number,
      user_id: inputData.user_id,
      currently_charging: false,
      car_id: inputData.car_id,
      needs_verification: false,
    });
  } catch (error) {
    throw new Error(error);
  }
};

export const mqttPublish = () => {
  if (client) {
    client.publish(topic, JSON.stringify({ text: "TESSSST" }), (error) => {
      if (error) {
        console.log("Publish error: ", error);
      }
    });
  }
};
