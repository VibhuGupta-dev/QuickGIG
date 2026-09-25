"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, MapPin, ArrowRight } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<{lng: number, lat: number} | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#faf9f5] text-[#1f1e1d] font-sans selection:bg-[#cc785c] selection:text-white">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-3xl border border-[#e8e6df] shadow-sm">
        
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-8 h-8 rounded-lg bg-[#cc785c] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-[#1f1e1d]">QuickGig</span>
          </Link>
          <h2 className="text-2xl font-serif text-[#1f1e1d]">Create your account</h2>
          <p className="mt-1 text-xs text-[#65635e]">Join QuickGig to find or post local gigs</p>
        </div>
        
        <form className="mt-6 space-y-3.5" onSubmit={handleSubmit}>
          {error && (
            <div className="text-rose-600 text-xs text-center bg-rose-50 border border-rose-200 rounded-xl py-2 px-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#65635e] mb-1">Full Name</label>
            <input
              type="text"
              required
              className="block w-full rounded-xl border border-[#e8e6df] bg-white py-2 px-3 text-[#1f1e1d] placeholder-[#8f8d86] focus:outline-none focus:border-[#cc785c] sm:text-sm"
              placeholder="e.g. Vibhu Gupta"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#65635e] mb-1">Email address</label>
            <input
              type="email"
              required
              className="block w-full rounded-xl border border-[#e8e6df] bg-white py-2 px-3 text-[#1f1e1d] placeholder-[#8f8d86] focus:outline-none focus:border-[#cc785c] sm:text-sm"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#65635e] mb-1">Password</label>
            <input
              type="password"
              required
              className="block w-full rounded-xl border border-[#e8e6df] bg-white py-2 px-3 text-[#1f1e1d] placeholder-[#8f8d86] focus:outline-none focus:border-[#cc785c] sm:text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#65635e] mb-1">Phone Number (optional)</label>
            <input
              type="tel"
              className="block w-full rounded-xl border border-[#e8e6df] bg-white py-2 px-3 text-[#1f1e1d] placeholder-[#8f8d86] focus:outline-none focus:border-[#cc785c] sm:text-sm"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div className="pt-1">
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-[#e8e6df] rounded-xl text-xs font-medium text-[#65635e] bg-[#faf9f5] hover:bg-[#f0eee6] hover:text-[#1f1e1d] disabled:opacity-50 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#cc785c]" />
              {locating ? "Locating..." : location ? "Location Saved ✓" : "Detect Current GPS"}
            </button>
            {!location && (
              <p className="text-[10px] text-[#8f8d86] mt-1 text-center">
                Enables instant proximity matching within your radius.
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f1e1d] hover:bg-[#383734] px-4 py-2.5 text-sm font-medium text-white transition-all shadow-sm"
            >
              {loading ? "Creating account..." : "Sign up"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-[#65635e] pt-2 border-t border-[#e8e6df]">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[#cc785c] hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
