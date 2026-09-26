"use client";
import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center px-4">
      <div className="bg-white border border-[#e8e6df] rounded-2xl p-8 max-w-md w-full text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 text-rose-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#1f1e1d]">Something went wrong</h2>
          <p className="text-sm text-[#65635e] mt-1">
            {error.message || "An unexpected error occurred."}
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#cc785c] text-white text-sm font-medium rounded-xl hover:bg-[#b8694f] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
