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
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

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
        setLocationQuery(display_name);
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
          address: address,
          longitude: location.lng,
          latitude: location.lat,
          expiresAt: expiresAt.toISOString(),
          image: imageBase64 || null,
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

  // @ts-expect-error isVerified custom
  if (status === "loading" || !session?.user?.isVerified) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">Checking permissions...</div>;
  }

  return (
    <div className="min-h-screen bg-black font-medium pb-20">
      <header className="bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 sticky top-0 z-50 flex items-center">
        <Link href="/dashboard" className="text-gray-500 hover:text-white mr-4 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-white">Post a New Gig</h1>
      </header>

      <main className="p-4 max-w-2xl mx-auto pt-6">
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-950 p-6 rounded-2xl border border-gray-800">
          
          {/* ── Photo Upload ── */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Gig Photo <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <label className="block cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {imagePreview ? (
                /* Preview */
                <div className="relative rounded-xl overflow-hidden border border-gray-700 h-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-bold">Click to change</span>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.preventDefault(); setImageBase64(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                /* Upload box */
                <div className="border-2 border-dashed border-gray-700 rounded-xl h-40 flex flex-col items-center justify-center gap-2 group-hover:border-gray-500 transition-colors bg-gray-900/50">
                  {/* Placeholder SVG illustration */}
                  <svg className="w-12 h-12 text-gray-700" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="64" height="64" rx="12" fill="#1f2937"/>
                    <path d="M12 44 L24 30 L32 38 L42 24 L52 44 Z" fill="#374151" stroke="#4b5563" strokeWidth="1"/>
                    <circle cx="20" cy="22" r="5" fill="#374151" stroke="#4b5563" strokeWidth="1"/>
                    <path d="M28 20 L28 14 M25 17 L31 17" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <p className="text-xs text-gray-500 font-semibold">Click to upload photo</p>
                  <p className="text-[10px] text-gray-700">JPG, PNG, WEBP — Max 2MB</p>
                </div>
              )}
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Gig Title</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-900 py-3 px-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-white focus:border-white sm:text-sm outline-none"
              placeholder="e.g., Help moving a sofa"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Category</label>
            <select
              className="w-full rounded-lg border border-gray-700 bg-gray-900 py-3 px-4 text-white focus:ring-2 focus:ring-white focus:border-white sm:text-sm outline-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Description</label>
            <textarea
              required
              rows={4}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 py-3 px-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-white focus:border-white sm:text-sm outline-none"
              placeholder="Describe what needs to be done..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Payment Offered (INR)</label>
            <div className="flex gap-2">
              <input
                type="number"
                required
                min="0"
                readOnly={priceLocked}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 py-3 px-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-white focus:border-white sm:text-sm outline-none"
                placeholder="Calculated by AI..."
                value={formData.payment}
                onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
              />
              <button
                type="button"
                onClick={handleEstimatePrice}
                disabled={aiLoading || priceLocked}
                className="flex items-center gap-1 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 whitespace-nowrap transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {aiLoading ? "Calculating..." : priceLocked ? "Locked" : "AI Fair Price"}
              </button>
            </div>
            {!priceLocked && <p className="text-xs text-gray-600 mt-1">AI ensures market-standard pricing to protect both parties.</p>}
            
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="isNegotiable"
                className="w-4 h-4 rounded"
                checked={formData.isNegotiable}
                onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
              />
              <label htmlFor="isNegotiable" className="text-sm text-gray-400">Price is Negotiable</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Gig Duration (Max 1 Week)</label>
            <select
              className="w-full rounded-lg border border-gray-700 bg-gray-900 py-3 px-4 text-white focus:ring-2 focus:ring-white focus:border-white sm:text-sm outline-none"
              value={formData.expiresIn}
              onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })}
            >
              <option value="1">1 Day</option>
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
              <option value="7">1 Week</option>
            </select>
          </div>

          <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
            <label className="block text-sm font-bold text-white mb-3 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Gig Location
            </label>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Type location (e.g. Lucknow Keshav Nagar)"
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 py-2 px-3 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-white outline-none"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSearchLocation}
                disabled={locating || !locationQuery.trim()}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 flex items-center gap-1 transition-colors"
              >
                <Search className="w-4 h-4" /> Search
              </button>
            </div>

            <div className="flex items-center gap-3 my-2 text-sm text-gray-600">
              <div className="h-px bg-gray-700 flex-1"></div>
              <span>OR</span>
              <div className="h-px bg-gray-700 flex-1"></div>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-700 rounded-lg text-sm font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {locating ? "Fetching..." : "📍 Use Current GPS Location"}
            </button>
            
            {location && (
              <div className="mt-3 p-3 bg-green-950 border border-green-800 rounded-lg text-sm text-green-400">
                <strong>Location Set:</strong> {address || "Coordinates pinned"}
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 rounded-lg text-base font-semibold text-black bg-white hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Posting..." : "Post Gig"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
