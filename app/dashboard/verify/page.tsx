"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerifyStudent() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/verify-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      
      if (res.ok) {
        await update({ isVerified: true });
        alert("Verification successful!");
        router.push("/dashboard");
      } else {
        const data = await res.json();
        alert(data.error || "Verification failed");
      }
    } catch (e) {
      console.error(e);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#1f1e1d] font-sans flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#cc785c] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 bg-[#cc785c] text-white rounded-2xl flex items-center justify-center shadow-sm">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="mt-4 text-2xl font-serif text-[#1f1e1d]">
          Student Verification
        </h2>
        <p className="mt-1 text-xs text-[#65635e]">
          Verify your student roll number to start posting and claiming gigs
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-[#e8e6df] rounded-3xl shadow-sm sm:px-8">
          <form className="space-y-4" onSubmit={handleVerify}>
            <div>
              <label htmlFor="studentId" className="block text-xs font-medium text-[#65635e] mb-1.5">
                University Roll / Student ID Number
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                required
                placeholder="e.g. 2301221720037"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="block w-full px-3.5 py-2.5 border border-[#e8e6df] bg-white rounded-xl text-[#1f1e1d] placeholder-[#8f8d86] focus:outline-none focus:border-[#cc785c] text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !studentId}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-[#1f1e1d] hover:bg-[#383734] disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? "Verifying..." : "Verify Identity"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-[#8f8d86]">
            Need help?{" "}
            <Link href="/dashboard" className="text-[#cc785c] font-medium hover:underline">
              Return to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
