import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const [time, setTime] = useState("");

  // Clock effect
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours() % 12 || 12;
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      const ampm = now.getHours() >= 12 ? "PM" : "AM";
      setTime(`${hours}:${minutes}:${seconds} ${ampm}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-2xl">
        Loading...
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="relative h-screen w-screen flex items-center justify-center overflow-hidden">
      
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/backvid1.mp4"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Logout Button - Top Right */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 z-20 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition shadow-lg"
      >
        Logout
      </button>

      {/* User Info - Top Left */}
      <div className="absolute top-6 left-6 z-20 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-lg border border-white/20">
        <p className="text-white text-sm">Welcome back!</p>
        <p className="text-purple-300 font-semibold">{user?.primaryEmailAddress?.emailAddress}</p>
      </div>

      {/* UI */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-10">

        <div className="bg-purple-700 text-white text-3xl font-bold p-6 rounded-lg shadow-lg">
          {time}
        </div>

        <div className="flex flex-col items-center gap-5">
          <button
            className="bg-indigo-900 text-white px-10 py-6 rounded-lg text-lg hover:bg-indigo-800 transition"
            onClick={() => router.push("/map")}
          >
            SHOW <br /> EMERGENCY <br /> SERVICES
          </button>

          <button
            className="bg-indigo-900 text-white px-10 py-6 rounded-lg text-lg hover:bg-indigo-800 transition"
            onClick={() => router.push("/survival")}
          >
            ITEM LIST <br /> FOR SURVIVAL
          </button>

          <button
            className="bg-indigo-900 text-white px-10 py-6 rounded-lg text-lg hover:bg-indigo-800 transition"
            onClick={() => router.push("/contacts")}
          >
            CONTACT
          </button>
        </div>

        <button
          className="bg-red-600 text-white px-14 py-6 rounded-lg text-lg font-semibold hover:bg-red-500 transition mt-6"
          onClick={() => router.push("/donate")}
        >
          DONATE
        </button>

      </div>
    </div>
  );
}