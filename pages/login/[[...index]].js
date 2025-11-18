import { useState } from "react";
import { useRouter } from "next/router";
import { useSignIn, useAuth } from "@clerk/nextjs";

export default function LoginPage() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { signOut } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err) {
      const errorCode = err.errors?.[0]?.code;
      
      if (errorCode === "session_exists") {
        setError("You are already logged in. Redirecting to dashboard...");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else if (errorCode === "form_identifier_not_found") {
        setError("No account found with this email. Please sign up first.");
      } else if (errorCode === "form_password_incorrect") {
        setError("Incorrect password. Please try again.");
      } else {
        setError(err.errors?.[0]?.message || "Invalid email or password.");
      }
    }

    setLoading(false);
  };

  // Handle forgot password - send reset code
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!isLoaded || !email) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setResetEmailSent(true);
      setError("");
    } catch (err) {
      setError(err.errors?.[0]?.message || "Failed to send reset email. Please try again.");
    }

    setLoading(false);
  };

  // Handle password reset with code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setLoading(true);

    try {
      if (newPassword.length < 8) {
        setError("Password must be at least 8 characters.");
        setLoading(false);
        return;
      }

      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Invalid code or password reset failed.");
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setError("");
  };

  // Forgot Password UI - Enter Email
  if (forgotPassword && !resetEmailSent) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="backdrop-blur-lg bg-white/10 p-10 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-4 text-center">
            Forgot Password
          </h2>

          <p className="text-gray-300 text-center mb-6 text-sm">
            Enter your email and we'll send you a reset code
          </p>

          <form onSubmit={handleForgotPassword} className="flex flex-col space-y-5">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
              } text-white font-semibold py-3 rounded-lg transition`}
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>

          {error && (
            <p className="text-red-400 text-center mt-4">{error}</p>
          )}

          <button
            onClick={() => {
              setForgotPassword(false);
              setError("");
            }}
            className="w-full mt-4 text-gray-400 hover:text-gray-300 underline text-sm"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Forgot Password UI - Enter Code and New Password
  if (forgotPassword && resetEmailSent) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="backdrop-blur-lg bg-white/10 p-10 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-4 text-center">
            Reset Password
          </h2>

          <p className="text-gray-300 text-center mb-6 text-sm">
            We sent a reset code to <br />
            <span className="text-purple-400 font-semibold">{email}</span>
          </p>

          <form onSubmit={handleResetPassword} className="flex flex-col space-y-5">
            <input
              type="text"
              placeholder="Enter 6-digit code"
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              required
            />

            <input
              type="password"
              placeholder="New Password (min 8 characters)"
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading || resetCode.length !== 6}
              className={`w-full ${
                loading || resetCode.length !== 6
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white font-semibold py-3 rounded-lg transition`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          {error && (
            <p className="text-red-400 text-center mt-4">{error}</p>
          )}

          <button
            onClick={() => {
              setResetEmailSent(false);
              setResetCode("");
              setNewPassword("");
              setError("");
            }}
            className="w-full mt-4 text-gray-400 hover:text-gray-300 underline text-sm"
          >
            ← Resend code
          </button>
        </div>
      </div>
    );
  }

  // Normal Login UI
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="backdrop-blur-lg bg-white/10 p-10 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">

        <h2 className="text-3xl font-bold text-white mb-6 text-center">Login</h2>

        <form onSubmit={handleLogin} className="flex flex-col space-y-5">
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
            placeholder="Password"
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && (
          <div className="mt-4">
            <p className="text-red-400 text-center">{error}</p>
            {error.includes("already logged in") && (
              <button
                onClick={handleSignOut}
                className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition text-sm"
              >
                Sign Out First
              </button>
            )}
            {error.includes("Incorrect password") && (
              <button
                onClick={() => {
                  setForgotPassword(true);
                  setError("");
                }}
                className="w-full mt-3 text-purple-400 hover:text-purple-300 underline text-sm"
              >
                Forgot Password?
              </button>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => {
              setForgotPassword(true);
              setError("");
            }}
            className="text-purple-400 hover:text-purple-300 underline text-sm"
          >
            Forgot Password?
          </button>

          <button
            onClick={() => router.push("/signup")}
            className="text-purple-400 hover:text-purple-300 underline text-sm"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}