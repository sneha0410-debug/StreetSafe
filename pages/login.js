import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Email Validation
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // ================================
  // LOGIN HANDLER
  // ================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Incorrect email or password.");
      return;
    }

    router.push("/dashboard");
  };

  // ================================
  // FORGOT PASSWORD HANDLER
  // ================================
  const handleForgotPassword = async () => {
    if (!validateEmail(email)) {
      setError("Enter your email above and click Forgot Password again.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Reset link sent! Check your email.");
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="backdrop-blur-lg bg-white/10 p-10 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">

        <h2 className="text-3xl font-bold text-white mb-6 text-center">Login</h2>

        <form onSubmit={handleLogin} className="flex flex-col space-y-5">
          
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
            } text-white font-semibold py-3 rounded-lg transition`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Forgot Password */}
        <button
          onClick={handleForgotPassword}
          className="mt-4 text-sm text-blue-300 underline hover:text-blue-400 w-full text-center"
        >
          Forgot Password?
        </button>

        {/* Error Message */}
        {error && <p className="text-red-400 text-center mt-4">{error}</p>}

        {/* Success Message */}
        {success && <p className="text-green-300 text-center mt-4">{success}</p>}

        {/* Signup Link */}
        <p className="text-center text-gray-300 mt-6">
          Don’t have an account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="text-blue-400 underline hover:text-blue-500"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
