import { useRouter } from "next/router";

export default function Landing() {
  const router = useRouter();

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

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Foreground */}
      <div className="relative z-10 flex flex-col items-center space-y-8">

        <h1 className="text-white text-4xl font-bold drop-shadow-lg">
          Welcome to StreetSafe
        </h1>

        <div className="flex gap-6">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl text-lg shadow-lg"
            onClick={() => router.push("/login")}
          >
            Login
          </button>

          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-xl text-lg shadow-lg"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
