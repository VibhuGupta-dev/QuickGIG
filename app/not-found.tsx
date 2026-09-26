import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center px-4">
      <div className="text-center space-y-5 max-w-sm">
        <p className="text-6xl font-bold text-[#e8e6df]">404</p>
        <div>
          <h2 className="text-xl font-semibold text-[#1f1e1d]">Page not found</h2>
          <p className="text-sm text-[#65635e] mt-1">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f1e1d] text-white text-sm font-medium rounded-xl hover:bg-[#383734] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
