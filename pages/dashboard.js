import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  
  // -----------------------------
  // STATE (hooks MUST come first)
  // -----------------------------
  const [time, setTime] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // -----------------------------
  // 1️⃣ AUTH CHECK — runs once
  // -----------------------------
  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
      } else {
        setCheckingAuth(false);
      }
    }
    checkUser();
  }, [router]);
  
  // -----------------------------
  // 2️⃣ CLOCK EFFECT
  // -----------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours() % 12 || 12;
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      const ampm = now.getHours() >= 12 ? "PM" : "AM";
      setTime(`${hours}:${minutes}:${seconds} ${ampm}`); // ✅ Fixed: Added parentheses
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // -----------------------------
  // 3️⃣ CONDITIONAL RENDER (after all hooks)
  // -----------------------------
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-2xl">
        Loading...
      </div>
    );
  }
  
  // -----------------------------
  // 4️⃣ UI RENDER
  // -----------------------------
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