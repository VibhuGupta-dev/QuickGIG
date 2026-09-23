"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
          <ShieldCheck className="w-8 h-8 text-black" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Student Verification
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          You must be a verified student to post or accept gigs.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-950 py-8 px-4 border border-gray-800 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleVerify}>
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-300">
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
                  className="appearance-none block w-full px-3 py-3 border border-gray-700 bg-gray-900 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-white sm:text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !studentId}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50 transition-colors"
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
