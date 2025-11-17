import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  const { data } = await supabase.auth.getUser();
  res.json({ user: data.user });
}
