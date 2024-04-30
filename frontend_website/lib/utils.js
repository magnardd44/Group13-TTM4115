import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { createBrowserClient } from '@supabase/ssr'


export function cn(...inputs) {
  return twMerge(clsx(inputs))
}


export function createClient() {
  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(
    "https://tyfubykbgdivengjqtpf.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5ZnVieWtiZ2RpdmVuZ2pxdHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMxODAwMTUsImV4cCI6MjAyODc1NjAxNX0.UZd-OHlXQYBqO1xQRPnKzJtopIrDUfghUXqKm9xGhF8"
    
    
    //process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}


export const supabase = createClient();
