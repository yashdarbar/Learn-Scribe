// lib/supabase-server.ts   (Server Components / Route Handlers)
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const supabaseServer = () =>
  createServerComponentClient({ cookies });
