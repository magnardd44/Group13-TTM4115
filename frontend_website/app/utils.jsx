import { supabase } from "../lib/utils";

export const LogInUser = async () => {
  try {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/current_session",
        queryParams: {
          prompt: "consent",
        },
      },
    });
  } catch (error) {
    throw new Error("Failed to sign in user");
  }
};

//"https://group13-ttm411530-magnardd44s-projects.vercel.app/current_session",

export const getUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

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

export const mqttPublish = async ({ client, user_id }) => {
  try {
    if (client) {
      client.publish(
        "/group-13/charger_server",
        JSON.stringify({ message_to: "charger", trigger: "app_start" }),
        (error) => {
          if (error) {
            console.log("Publish error: ", error);
            return;
          }
        }
      );
      await supabase
        .from("cars")
        .update({ currently_charging: true })
        .eq("user_id", user_id);
    }
  } catch (error) {
    throw new Error(error);
  }
};
