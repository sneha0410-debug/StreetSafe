import { useState } from "react";
import { useRouter } from "next/router";
import { useSignUp } from "@clerk/nextjs";

export default function SignupPage() {
  const router = useRouter();
  const { isLoaded, signUp } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

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

    try {
      // 1️⃣ Create account
      await signUp.create({ emailAddress: email, password });

      // 2️⃣ Send OTP code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setIsVerifying(true);
    } catch (err) {
      const code = err.errors?.[0]?.code;

      if (code === "form_identifier_exists") {
        setError("Account already exists. Please login.");
      } else {
        setError(err.errors?.[0]?.message || "Signup failed.");
      }
    }

    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        // Sign up complete! Redirect to dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Invalid verification code.");
    }

    setLoading(false);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="backdrop-blur-lg bg-white/10 p-10 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">

        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {isVerifying ? "Verify Email" : "Sign Up"}
        </h2>

        {!isVerifying ? (
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
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col space-y-5">
            <p className="text-gray-300 text-sm text-center mb-2">
              We've sent a verification code to <strong>{email}</strong>
            </p>

            <input
              type="text"
              placeholder="Enter 6-digit code"
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
              } text-white font-semibold py-3 rounded-lg transition`}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        )}

        {error && <p className="text-red-400 text-center mt-4">{error}</p>}

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