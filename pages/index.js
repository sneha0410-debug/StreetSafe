import { useRouter } from "next/router";
import { useState } from "react";

export default function Landing() {
  const router = useRouter();
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="relative h-screen w-screen flex items-center justify-center overflow-hidden">
      
      {/* Fallback gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800"></div>

      {/* Background Video */}
      {!videoError && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
          src="/backvid1.mp4"
          onError={() => setVideoError(true)}
        />
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Foreground */}
      <div className="relative z-10 flex flex-col items-center space-y-8">

        <h1 className="text-white text-4xl font-bold drop-shadow-lg">
          Welcome to StreetSafe
        </h1>

        <div className="flex gap-6">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl text-lg shadow-lg transition"
            onClick={() => router.push("/login")}
          >
            Login
          </button>

          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-xl text-lg shadow-lg transition"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}