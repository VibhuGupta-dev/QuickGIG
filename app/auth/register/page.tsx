"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<{lng: number, lat: number} | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGetLocation = () => {
    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lng: position.coords.longitude,
            lat: position.coords.latitude,
          });
          setLocating(false);
        },
        () => {
          setError("Failed to get location. Please allow location access.");
          setLocating(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
      setLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { name, email, password, phone };
      if (location) {
        payload.longitude = location.lng;
        payload.latitude = location.lat;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/auth/login");
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("An error occurred");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-black">
      <div className="w-full max-w-sm space-y-8 bg-gray-950 p-8 rounded-2xl border border-gray-800 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Register</h2>
          <p className="mt-2 text-sm text-gray-500">Join QuickGig today</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-400 text-sm text-center bg-red-950 border border-red-800 rounded-lg py-2">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="sr-only">Full Name</label>
              <input
                type="text"
                required
                className="relative block w-full rounded-lg border border-gray-700 bg-gray-900 py-2.5 px-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-white focus:border-white sm:text-sm sm:leading-6 outline-none"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="sr-only">Email address</label>
              <input
                type="email"
                required
                className="relative block w-full rounded-lg border border-gray-700 bg-gray-900 py-2.5 px-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-white focus:border-white sm:text-sm sm:leading-6 outline-none"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="sr-only">Password</label>
              <input
                type="password"
                required
                className="relative block w-full rounded-lg border border-gray-700 bg-gray-900 py-2.5 px-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-white focus:border-white sm:text-sm sm:leading-6 outline-none"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="sr-only">Phone Number (optional)</label>
              <input
                type="tel"
                className="relative block w-full rounded-lg border border-gray-700 bg-gray-900 py-2.5 px-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-white focus:border-white sm:text-sm sm:leading-6 outline-none"
                placeholder="Phone Number (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 bg-gray-900 hover:bg-gray-800 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 transition-colors"
              >
                {locating ? "Locating..." : location ? "📍 Location Captured" : "📍 Fetch My Location"}
              </button>
              {!location && <p className="text-xs text-gray-600 mt-2 text-center">Location helps us find gigs near you.</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-black hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
            >
              Sign up
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
