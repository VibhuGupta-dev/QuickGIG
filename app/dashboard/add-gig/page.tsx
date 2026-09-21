"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Sparkles, MapPin, Search } from "lucide-react";

const CATEGORIES = [
  "Errand",
  "Cleaning",
  "Tutoring",
  "Moving Help",
  "Pet Care",
  "Handyman",
  "Other"
];

export default function AddGig() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    payment: "",
    expiresIn: "7",
    isNegotiable: false
  });
  
  const [location, setLocation] = useState<{lng: number, lat: number} | null>(null);
  const [address, setAddress] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  
  const [locating, setLocating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [priceLocked, setPriceLocked] = useState(false);

  const handleEstimatePrice = async () => {
    if (!formData.title || !formData.description) {
      alert("Please enter a title and description first for the AI to estimate.");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: formData.title, 
          description: formData.description, 
          category: formData.category 
        })
      });
      const data = await res.json();
      if (data.price) {
        setFormData({ ...formData, payment: data.price.toString() });
        setPriceLocked(true);
      } else {
        alert(data.error || "Failed to estimate price.");
      }
    } catch {
      alert("Error connecting to AI.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      // @ts-expect-error isVerified is custom
      if (!session?.user?.isVerified) {
        router.push("/dashboard/verify");
      }
    }
  }, [status, session, router]);

  const handleGetLocation = () => {
    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lng, lat });
          
          // Reverse geocode
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            if (data && data.display_name) {
              setAddress(data.display_name);
              setLocationQuery(data.display_name);
            }
          } catch (e) {
            console.error("Failed to reverse geocode");
          }
          setLocating(false);
        },
        () => {
          alert("Failed to get location. Please allow location access or type your address manually.");
          setLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setLocating(false);
    }
  };

  const handleSearchLocation = async () => {
    if (!locationQuery.trim()) return;
    setLocating(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setLocation({ lat: Number(lat), lng: Number(lon) });
        setAddress(display_name);
        setLocationQuery(display_name); // update with full formatted name
        alert(`Location found: ${display_name}`);
      } else {
        alert("Location not found. Try a different search.");
      }
    } catch (e) {
      alert("Error finding location.");
    }
    setLocating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      alert("Please set a location first so workers nearby can find this gig.");
      return;
    }
    if (!priceLocked) {
      alert("Please calculate the Fair Market Price using AI before posting.");
      return;
    }
    setLoading(true);
    
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(formData.expiresIn));

      const res = await fetch("/api/gigs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          payment: Number(formData.payment),
          isNegotiable: formData.isNegotiable,
          address: address, // sending the address string
          longitude: location.lng,
          latitude: location.lat,
          expiresAt: expiresAt.toISOString(),
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to post gig");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Prevent render if not verified yet to avoid flash of form
  // @ts-expect-error isVerified custom
  if (status === "loading" || !session?.user?.isVerified) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Checking permissions...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-medium pb-20">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 sticky top-0 z-50 flex items-center shadow-sm">
        <Link href="/dashboard" className="text-gray-500 hover:text-black mr-4 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-black">Post a New Gig</h1>
      </header>

      <main className="p-4 max-w-2xl mx-auto pt-6">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Gig Title</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
              placeholder="e.g., Help moving a sofa"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
            <select
              className="w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 focus:ring-2 focus:ring-black focus:border-black sm:text-sm bg-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
            <textarea
              required
              rows={4}
              className="w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
              placeholder="Describe what needs to be done..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Payment Offered (INR)</label>
            <div className="flex gap-2">
              <input
                type="number"
                required
                min="0"
                readOnly={priceLocked}
                className="w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 focus:ring-2 focus:ring-black focus:border-black sm:text-sm bg-gray-50"
                placeholder="Calculated by AI..."
                value={formData.payment}
                onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
              />
              <button
                type="button"
                onClick={handleEstimatePrice}
                disabled={aiLoading || priceLocked}
                className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:bg-gray-300 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                {aiLoading ? "Calculating..." : priceLocked ? "Locked" : "AI Fair Price"}
              </button>
            </div>
            {!priceLocked && <p className="text-xs text-gray-500 mt-1">AI ensures market-standard pricing to protect both parties.</p>}
            
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="isNegotiable"
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                checked={formData.isNegotiable}
                onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
              />
              <label htmlFor="isNegotiable" className="text-sm text-gray-700">Price is Negotiable</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Gig Duration (Max 1 Week)</label>
            <select
              className="w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 focus:ring-2 focus:ring-black focus:border-black sm:text-sm bg-white"
              value={formData.expiresIn}
              onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })}
            >
              <option value="1">1 Day</option>
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
              <option value="7">1 Week</option>
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Gig Location
            </label>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Type location (e.g. Lucknow Keshav Nagar)"
                className="flex-1 rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-black"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSearchLocation}
                disabled={locating || !locationQuery.trim()}
                className="bg-gray-200 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-300 disabled:bg-gray-100 flex items-center gap-1"
              >
                <Search className="w-4 h-4" /> Search
              </button>
            </div>

            <div className="flex items-center gap-3 my-2 text-sm text-gray-500">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span>OR</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
            >
              {locating ? "Fetching..." : "📍 Use Current GPS Location"}
            </button>
            
            {location && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                <strong>Location Set:</strong> {address || "Coordinates pinned"}
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Posting..." : "Post Gig"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
