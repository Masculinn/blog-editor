type SupabaseServerEnv = {
  url: string;
  secretKey: string;
};

export function getSupabaseServerEnv(): SupabaseServerEnv {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing SUPABASE_URL.");
  }

  if (!secretKey) {
    throw new Error("Missing SUPABASE_SECRET_KEY.");
  }

  return {
    url,
    secretKey,
  };
}
