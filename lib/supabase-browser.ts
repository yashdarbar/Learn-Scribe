// lib/supabase-browser.ts  (Client Components)
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const supabaseBrowser = () => createClientComponentClient();


// import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";

// // export const supabase = createClient(
// //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
// //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// // );
// export const createClient = () => createClientComponentClient()

// export const createServerClient = () => createServerComponentClient({ cookies })