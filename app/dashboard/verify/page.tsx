"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldCheck, ArrowRight } from "lucide-react";

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
        // Update the NextAuth session so it knows we are verified
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Student Verification
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You must be a verified student to post or accept gigs.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleVerify}>
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                Student ID Number
              </label>
              <div className="mt-1">
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  required
                  placeholder="e.g. 21BCS012"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !studentId}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors"
              >
                {loading ? "Verifying..." : "Verify Identity"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
