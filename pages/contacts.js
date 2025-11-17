export default function Contacts() {
  const contacts = `NATIONAL EMERGENCY NUMBER: 112
POLICE EMERGENCY NUMBER: 100
AMBULANCE EMERGENCY NUMBER: 108/102
WOMEN HELPLINE NUMBER: 1091
SENIOR CITIZEN HELPLINE NUMBER: 14567`;

  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={{ backgroundImage: "url('/backimg2.png')", backgroundSize: "cover" }}
    >
      <div className="bg-green-600 p-6 rounded-lg text-white max-w-md">
        <h2 className="text-2xl font-bold mb-4">EMERGENCY CONTACTS</h2>
        <pre className="font-mono">{contacts}</pre>
      </div>
    </div>
  );
}
