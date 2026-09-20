"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

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
    expiresIn: "7"
  });
  const [location, setLocation] = useState<{lng: number, lat: number} | null>(null);
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
        (position) => {
          setLocation({
            lng: position.coords.longitude,
            lat: position.coords.latitude,
          });
          setLocating(false);
        },
        () => {
          alert("Failed to get location. Please allow location access.");
          setLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      alert("Please fetch your location first so workers nearby can find this gig.");
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
    <div className="min-h-screen bg-gray-50 font-medium">
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

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Gig Location</label>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            >
              {locating ? "Fetching Location..." : location ? "📍 Exact Location Pinned" : "📍 Pin Current Location"}
            </button>
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
