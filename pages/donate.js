import { useEffect } from "react";

export default function Donate() {
  useEffect(() => {
    const donationUrl = "https://www.habitatindia.org/donate/";

    // Wait 2 seconds before redirect
    const timer = setTimeout(() => {
      window.location.href = donationUrl;
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-red-100 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Redirecting to a verified donation page...
      </h1>
      <p className="text-lg text-gray-700">Thank you! ❤️</p>
    </div>
  );
}
