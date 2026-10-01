"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Sparkles, MapPin, Search, X } from "lucide-react";

const CATEGORIES = [
  "Errand",
  "Cleaning",
  "Tutoring",
  "Moving Help",
  "Pet Care",
  "Handyman",
  "Delivery",
  "Assembly",
  "Yard Work",
  "Tech Support",
  "Event Help",
  "Photography",
  "Cooking",
  "Shopping",
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
    deadline: "",
    isNegotiable: false
  });
  
  const [location, setLocation] = useState<{lng: number, lat: number} | null>(null);
  const [address, setAddress] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestDebounce = useRef<NodeJS.Timeout | null>(null);
  
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
    }
  }, [status, router]);

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

  const fetchLocationSuggestions = (query: string) => {
    if (suggestDebounce.current) clearTimeout(suggestDebounce.current);
    if (!query.trim() || query.length < 2) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    suggestDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setLocationSuggestions(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
      } catch { /* ignore */ }
    }, 300);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pickLocationSuggestion = (item: any) => {
    setLocation({ lat: Number(item.lat), lng: Number(item.lon) });
    setAddress(item.display_name);
    setLocationQuery(item.display_name);
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearchLocation = async () => {
    if (!locationQuery.trim()) return;
    setLocating(true);
    try {
      const res = await fetch(`/api/location/search?q=${encodeURIComponent(locationQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setLocation({ lat: Number(lat), lng: Number(lon) });
        setAddress(display_name);
        setLocationQuery(display_name);
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
    if (!formData.deadline) {
      alert("Please set a task deadline.");
      return;
    }
    setLoading(true);
    
    try {
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
          expiresAt: new Date(formData.deadline).toISOString(),
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


  if (status === "loading") {
    return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-[#475569]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans pb-20 selection:bg-[#2563eb] selection:text-white">
      <header className="bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] p-4 sticky top-0 z-50 flex items-center">
        <Link href="/dashboard" className="text-[#94a3b8] hover:text-[#0f172a] mr-4 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-semibold text-[#0f172a]">Post a New Task</h1>
      </header>

      <main className="p-4 max-w-2xl mx-auto pt-6">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#e2e8f0] shadow-sm">
          
          {/* ── Photo Upload ── */}
          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1.5">
              Task Photo <span className="text-[#94a3b8] font-normal">(optional)</span>
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
                <div className="relative rounded-2xl overflow-hidden border border-[#e2e8f0] h-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Click to change</span>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.preventDefault(); setImageBase64(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-slate-900/80 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Upload box */
                <div className="border-2 border-dashed border-[#e2e8f0] rounded-2xl h-36 flex flex-col items-center justify-center gap-1.5 hover:border-[#2563eb] transition-colors bg-slate-50">
                  <p className="text-xs text-[#475569] font-medium">Click to upload photo</p>
                  <p className="text-[10px] text-[#94a3b8]">JPG, PNG, WEBP — Max 2MB</p>
                </div>
              )}
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1.5">Gig Title</label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-[#e2e8f0] bg-white py-2.5 px-3.5 text-[#0f172a] placeholder-[#94a3b8] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-sm outline-none"
              placeholder="e.g., Help moving a study table"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1.5">Category</label>
            <select
              className="w-full rounded-xl border border-[#e2e8f0] bg-white py-2.5 px-3.5 text-[#0f172a] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-sm outline-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1.5">Description</label>
            <textarea
              required
              rows={4}
              className="w-full rounded-xl border border-[#e2e8f0] bg-white py-2.5 px-3.5 text-[#0f172a] placeholder-[#94a3b8] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-sm outline-none resize-none"
              placeholder="Describe what needs to be done..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1.5">Payment Offered (INR)</label>
            <div className="flex gap-2">
              <input
                type="number"
                required
                min="0"
                className="w-full rounded-xl border border-[#e2e8f0] bg-white py-2.5 px-3.5 text-[#0f172a] placeholder-[#94a3b8] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-sm outline-none"
                placeholder="Enter amount (₹)"
                value={formData.payment}
                onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
              />
              <button
                type="button"
                onClick={handleEstimatePrice}
                disabled={aiLoading}
                className="flex items-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-xl text-xs font-medium disabled:opacity-50 whitespace-nowrap transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiLoading ? "Calculating..." : "AI Fair Price"}
              </button>
            </div>
            <p className="text-[11px] text-[#94a3b8] mt-1">Use AI to estimate a fair price, or enter manually.</p>
            
            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="checkbox"
                id="isNegotiable"
                className="w-4 h-4 rounded text-[#2563eb] accent-[#2563eb]"
                checked={formData.isNegotiable}
                onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
              />
              <label htmlFor="isNegotiable" className="text-xs text-[#475569]">Price is Negotiable</label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1.5">
              Task Deadline <span className="text-[#94a3b8] font-normal">(by when must it be done?)</span>
            </label>
            <input
              type="datetime-local"
              required
              className="rounded-xl border border-[#e2e8f0] bg-white py-2.5 px-3.5 text-[#0f172a] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-sm outline-none w-full"
              value={formData.deadline}
              min={(() => {
                const d = new Date();
                d.setMinutes(d.getMinutes() + 30);
                return d.toISOString().slice(0, 16);
              })()}
              max={(() => {
                const d = new Date();
                d.setDate(d.getDate() + 7);
                return d.toISOString().slice(0, 16);
              })()}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
            <p className="text-[11px] text-[#94a3b8] mt-1">The task must be completed by this date and time.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-[#e2e8f0]">
            <label className="block text-xs font-medium text-[#0f172a] mb-2.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#2563eb]" /> Gig Location
            </label>
            
            <div className="flex flex-col gap-2 mb-2.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type location (e.g. Lucknow Gomti Nagar)"
                  className="flex-1 rounded-xl border border-[#e2e8f0] bg-white py-2 px-3 text-xs text-[#0f172a] placeholder-[#94a3b8] focus:border-[#2563eb] outline-none"
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    fetchLocationSuggestions(e.target.value);
                  }}
                  onFocus={() => {
                    if (locationSuggestions.length > 0) setShowSuggestions(true);
                  }}
                />
                <button
                  type="button"
                  onClick={handleSearchLocation}
                  disabled={locating || !locationQuery.trim()}
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-3.5 py-2 rounded-xl text-xs font-medium disabled:opacity-50 flex items-center gap-1 transition-colors shrink-0"
                >
                  <Search className="w-3.5 h-3.5" /> Search
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-[#e2e8f0] bg-white divide-y divide-slate-100 shadow-sm">
                  {locationSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => pickLocationSuggestion(item)}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-100 transition-colors flex items-start gap-2"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#2563eb] mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <p className="font-medium text-[#0f172a] line-clamp-1">
                          {item.display_name.split(',')[0]}
                        </p>
                        <p className="text-[11px] text-[#94a3b8] line-clamp-1">
                          {item.display_name.split(',').slice(1).join(',').trim()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 my-2 text-xs text-[#94a3b8]">
              <div className="h-px bg-[#e2e8f0] flex-1"></div>
              <span>OR</span>
              <div className="h-px bg-[#e2e8f0] flex-1"></div>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 border border-[#e2e8f0] rounded-xl text-xs font-medium text-[#475569] bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#2563eb]" />
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
              className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-medium text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Posting..." : "Post Gig"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
