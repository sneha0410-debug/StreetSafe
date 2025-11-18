import { useState } from "react";
import { useRouter } from "next/router";
import { useSignUp, useAuth } from "@clerk/nextjs";
import { supabase } from "../../lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Handle initial signup
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setLoading(true);

    try {
      // Email validation
      const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
      if (!validateEmail(email)) {
        setError("Please enter a valid email.");
        setLoading(false);
        return;
      }

      // Password validation
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }

      // Create signup with Clerk
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // Move to verification step
      setVerifying(true);
      setError("");
    } catch (err) {
      const errorCode = err.errors?.[0]?.code;
      const errorMessage = err.errors?.[0]?.message;

      if (errorCode === "session_exists") {
        setError("You are already logged in. Redirecting to dashboard...");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else if (errorCode === "form_identifier_exists" || errorMessage?.includes("already exists")) {
        setError("User already exists. Please login instead.");
      } else {
        setError(errorMessage || "Signup failed. Please try again.");
      }
    }

    setLoading(false);
  };

  // Handle verification code
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setLoading(true);

    try {
      // Verify the email with the code
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        // Set the active session
        await setActive({ session: completeSignUp.createdSessionId });

        // Sync user to Supabase
        const clerkUser = completeSignUp.createdUserId;
        const userEmail = signUp.emailAddress;

        try {
          const { error: supabaseError } = await supabase
            .from("users")
            .insert({
              clerk_user_id: clerkUser,
              email: userEmail,
              created_at: new Date().toISOString(),
            });

          if (supabaseError) {
            console.error("Supabase sync error:", supabaseError);
            // Don't block login if Supabase fails
          }
        } catch (dbErr) {
          console.error("Database error:", dbErr);
        }

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Invalid verification code.");
    }

    setLoading(false);
  };

  // UI for verification code
  if (verifying) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="backdrop-blur-lg bg-white/10 p-10 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-4 text-center">
            Verify Email
          </h2>
          
          <p className="text-gray-300 text-center mb-6">
            We sent a verification code to <br />
            <span className="text-purple-400 font-semibold">{email}</span>
          </p>

          <form onSubmit={handleVerify} className="flex flex-col space-y-5">
            <input
              type="text"
              placeholder="Enter 6-digit code"
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              required
            />

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className={`w-full ${
                loading || code.length !== 6
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white font-semibold py-3 rounded-lg transition`}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>

          {error && (
            <p className="text-red-400 text-center mt-4">{error}</p>
          )}

          <button
            onClick={() => setVerifying(false)}
            className="w-full mt-4 text-gray-400 hover:text-gray-300 underline text-sm"
          >
            ← Back to signup
          </button>
        </div>
      </div>
    );
  }

  // UI for entering signup details
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="backdrop-blur-lg bg-white/10 p-10 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Sign Up
        </h2>

        <form onSubmit={handleSignup} className="flex flex-col space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
            } text-white font-semibold py-3 rounded-lg transition`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {error && (
          <div className="mt-4">
            <p className="text-red-400 text-center">{error}</p>
            {error.includes("already exists") && (
              <button
                onClick={() => router.push("/login")}
                className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition text-sm"
              >
                Go to Login
              </button>
            )}
            {error.includes("already logged in") && (
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition text-sm"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        )}

        <p className="text-gray-400 text-sm text-center mt-6">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}