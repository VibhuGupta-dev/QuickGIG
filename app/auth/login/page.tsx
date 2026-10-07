"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#f8fafc] text-[#0f172a] font-sans selection:bg-[#2563eb] selection:text-white">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-3xl border border-[#e2e8f0] shadow-sm">
        
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white shadow-sm">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-[#0f172a]">QuickGig</span>
          </Link>
          <h2 className="text-2xl font-bold text-[#0f172a]">Welcome back</h2>
          <p className="mt-1 text-xs text-[#64748b]">Sign in to access local tasks and gigs</p>
        </div>
        
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="text-rose-600 text-xs text-center bg-rose-50 border border-rose-200 rounded-xl py-2 px-3">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1">Email address</label>
              <input
                type="email"
                required
                className="block w-full rounded-xl border border-[#e2e8f0] bg-white py-2.5 px-3 text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 sm:text-sm"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1">Password</label>
              <input
                type="password"
                required
                className="block w-full rounded-xl border border-[#e2e8f0] bg-white py-2.5 px-3 text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] px-4 py-2.5 text-sm font-medium text-white transition-all shadow-sm"
            >
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-[#64748b] pt-2 border-t border-[#e2e8f0]">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-semibold text-[#2563eb] hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}
