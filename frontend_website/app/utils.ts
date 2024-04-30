import { cache } from "react";
import { supabase } from "../lib/utils";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";

export const LogInUser = cache(async () => {
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
});

export const getUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

    console.log(data);

    if (data.user) {
      return data.user;
    }
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
