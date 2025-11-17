import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  const { email, password } = req.body;

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return res.json({ error: error.message });

  res.json({ success: true });
}
