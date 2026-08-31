"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    payment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/gigs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          payment: Number(formData.payment)
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        alert("Failed to post gig");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

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
            <label className="block text-sm font-semibold text-gray-900 mb-2">Payment Offered (₹)</label>
            <input
              type="number"
              required
              min="0"
              className="w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
              placeholder="e.g., 500"
              value={formData.payment}
              onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
            />
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
