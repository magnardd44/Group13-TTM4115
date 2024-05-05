import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { createBrowserClient } from "@supabase/ssr";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const supabase = createClient();
