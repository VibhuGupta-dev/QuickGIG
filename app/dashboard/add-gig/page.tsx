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
    return <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center text-[#65635e]">Checking permissions...</div>;
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#1f1e1d] font-sans pb-20 selection:bg-[#cc785c] selection:text-white">
      <header className="bg-[#faf9f5]/90 backdrop-blur-md border-b border-[#e8e6df] p-4 sticky top-0 z-50 flex items-center">
        <Link href="/dashboard" className="text-[#8f8d86] hover:text-[#1f1e1d] mr-4 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-serif text-[#1f1e1d]">Post a New Task</h1>
      </header>

      <main className="p-4 max-w-2xl mx-auto pt-6">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#e8e6df] shadow-sm">
          
          {/* ── Photo Upload ── */}
          <div>
            <label className="block text-xs font-medium text-[#65635e] mb-1.5">
              Task Photo <span className="text-[#8f8d86] font-normal">(optional)</span>
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
                <div className="relative rounded-2xl overflow-hidden border border-[#e8e6df] h-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Click to change</span>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.preventDefault(); setImageBase64(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-rose-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                /* Upload box */
                <div className="border-2 border-dashed border-[#e8e6df] rounded-2xl h-36 flex flex-col items-center justify-center gap-1.5 hover:border-[#cc785c] transition-colors bg-[#faf9f5]">
                  <p className="text-xs text-[#65635e] font-medium">Click to upload photo</p>
                  <p className="text-[10px] text-[#8f8d86]">JPG, PNG, WEBP — Max 2MB</p>
                </div>
              )}
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#65635e] mb-1.5">Gig Title</label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-[#e8e6df] bg-white py-2.5 px-3.5 text-[#1f1e1d] placeholder-[#8f8d86] focus:border-[#cc785c] text-sm outline-none"
              placeholder="e.g., Help moving a study table"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#65635e] mb-1.5">Category</label>
            <select
              className="w-full rounded-xl border border-[#e8e6df] bg-white py-2.5 px-3.5 text-[#1f1e1d] focus:border-[#cc785c] text-sm outline-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#65635e] mb-1.5">Description</label>
            <textarea
              required
              rows={4}
              className="w-full rounded-xl border border-[#e8e6df] bg-white py-2.5 px-3.5 text-[#1f1e1d] placeholder-[#8f8d86] focus:border-[#cc785c] text-sm outline-none resize-none"
              placeholder="Describe what needs to be done..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#65635e] mb-1.5">Payment Offered (INR)</label>
            <div className="flex gap-2">
              <input
                type="number"
                required
                min="0"
                readOnly={priceLocked}
                className="w-full rounded-xl border border-[#e8e6df] bg-white py-2.5 px-3.5 text-[#1f1e1d] placeholder-[#8f8d86] focus:border-[#cc785c] text-sm outline-none"
                placeholder="Calculated by AI..."
                value={formData.payment}
                onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
              />
              <button
                type="button"
                onClick={handleEstimatePrice}
                disabled={aiLoading || priceLocked}
                className="flex items-center gap-1.5 bg-[#cc785c] hover:bg-[#b8694f] text-white px-4 py-2 rounded-xl text-xs font-medium disabled:opacity-50 whitespace-nowrap transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiLoading ? "Calculating..." : priceLocked ? "Locked ✓" : "AI Fair Price"}
              </button>
            </div>
            {!priceLocked && <p className="text-[11px] text-[#8f8d86] mt-1">AI calculates standard pricing to protect both parties.</p>}
            
            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="checkbox"
                id="isNegotiable"
                className="w-4 h-4 rounded text-[#cc785c] accent-[#cc785c]"
                checked={formData.isNegotiable}
                onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
              />
              <label htmlFor="isNegotiable" className="text-xs text-[#65635e]">Price is Negotiable</label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#65635e] mb-1.5">Gig Duration (Max 1 Week)</label>
            <select
              className="w-full rounded-xl border border-[#e8e6df] bg-white py-2.5 px-3.5 text-[#1f1e1d] focus:border-[#cc785c] text-sm outline-none"
              value={formData.expiresIn}
              onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })}
            >
              <option value="1">1 Day</option>
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
              <option value="7">1 Week</option>
            </select>
          </div>

          <div className="bg-[#faf9f5] p-4 rounded-2xl border border-[#e8e6df]">
            <label className="block text-xs font-medium text-[#1f1e1d] mb-2.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#cc785c]" /> Gig Location
            </label>
            
            <div className="flex gap-2 mb-2.5">
              <input
                type="text"
                placeholder="Type location (e.g. Lucknow Gomti Nagar)"
                className="flex-1 rounded-xl border border-[#e8e6df] bg-white py-2 px-3 text-xs text-[#1f1e1d] placeholder-[#8f8d86] focus:border-[#cc785c] outline-none"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSearchLocation}
                disabled={locating || !locationQuery.trim()}
                className="bg-[#1f1e1d] hover:bg-[#383734] text-white px-3.5 py-2 rounded-xl text-xs font-medium disabled:opacity-50 flex items-center gap-1 transition-colors"
              >
                <Search className="w-3.5 h-3.5" /> Search
              </button>
            </div>

            <div className="flex items-center gap-3 my-2 text-xs text-[#8f8d86]">
              <div className="h-px bg-[#e8e6df] flex-1"></div>
              <span>OR</span>
              <div className="h-px bg-[#e8e6df] flex-1"></div>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 border border-[#e8e6df] rounded-xl text-xs font-medium text-[#65635e] bg-white hover:bg-[#f0eee6] disabled:opacity-50 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#cc785c]" />
              {locating ? "Fetching..." : "Use Current GPS Location"}
            </button>
            
            {location && (
              <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
                <strong>Location Set:</strong> {address || "Coordinates pinned"}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-medium text-white bg-[#1f1e1d] hover:bg-[#383734] disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Posting..." : "Post Gig"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
