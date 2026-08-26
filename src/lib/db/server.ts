import "server-only";

import type { Database } from "@/types/database.types";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  throw new Error("Missing SUPABASE_URL.");
}

if (!secretKey) {
  throw new Error("Missing SUPABASE_SECRET_KEY.");
}

export const db = createClient<Database>(url, secretKey, {
  db: {
    schema: "public",
  },

  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
