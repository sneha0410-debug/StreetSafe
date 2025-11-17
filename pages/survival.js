export default function Survival() {
  const survivalItems = `Clean Clothes
Warm Blanket / Sleeping Bag
Water Bottle
First Aid Kit
Basic Toiletries
Mobile Phone & Charger
Flashlight / Torch`;

  const goals = `StreetSafe helps you stay safe and take care of your basic needs:

Key Goals:
- Stay safe and visible at night
- Maintain personal hygiene
- Access food and clean water
- Stay healthy and rested

Steps to Achieve These Goals:
- Find nearby shelters for safe sleeping
- Locate hospitals or clinics for medical care
- Keep identification and important documents secure
- Connect with NGOs or legal aid for support
- Plan your day to manage work, food, and rest

Remember:
- Always carry a small survival kit with essentials
- Reach out to trusted organizations for help
- Stay aware of your surroundings and travel safely`;

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center"
      style={{
        backgroundImage: "url('/backimg.png')",
        backgroundSize: "cover",
      }}
    >
      <div className="bg-teal-300 p-6 rounded-lg mb-6 text-black">
        <h2 className="text-2xl font-bold mb-2">Essential Items:</h2>
        <pre className="font-mono">{survivalItems}</pre>
      </div>

      <div className="bg-cyan-200 p-6 rounded-lg text-black max-w-2xl">
        <h2 className="text-2xl font-bold mb-2">Goals & Safety Tips:</h2>
        <pre className="font-mono">{goals}</pre>
      </div>
    </div>
  );
}
