import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    // 🔥 Detect if user already exists
    if (signupError?.message === "User already registered") {
      setError("Your account already exists. Please login.");
      return;
    }

    if (signupError) {
      setError(signupError.message);
      return;
    }

    // 🔥 Prevent direct auto-login — user must verify email manually
    router.push("/login");
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="backdrop-blur-lg bg-white/10 p-10 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">

        <h2 className="text-3xl font-bold text-white mb-6 text-center">Signup</h2>

        <form onSubmit={handleSignup} className="flex flex-col space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
            } text-white font-semibold py-3 rounded-lg transition`}
          >
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>

        {error && (
          <div className="text-red-400 text-center mt-4">
            {error}
            <button
              onClick={() => router.push("/login")}
              className="block mt-2 text-blue-300 underline hover:text-blue-400"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
