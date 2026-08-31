import Link from "next/link";
import { Briefcase, MapPin, ArrowRight, ShieldCheck, Clock, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-200">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-black fill-black" />
            <span className="font-extrabold text-xl tracking-tight">QuickGig</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-semibold text-gray-600 hover:text-black transition-colors">
              Log in
            </Link>
            <Link href="/auth/register" className="text-sm font-semibold bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all hover:scale-105 shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="relative px-4 pt-24 pb-32 sm:pt-32 sm:pb-40 overflow-hidden">
          {/* Subtle dotted background pattern */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-70"></div>
          
          <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 mb-2 uppercase tracking-wide">
              <span className="flex h-2 w-2 rounded-full bg-black animate-pulse"></span>
              Hyper-Local Gig Network
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Find small jobs, <br className="hidden sm:block" />
              <span className="text-gray-400">right in your neighborhood.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-500 leading-relaxed font-medium">
              Need help moving furniture? Or looking to earn extra cash nearby? 
              QuickGig connects you with local tasks instantly. No middlemen, no hassle.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link href="/auth/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                Start Earning <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black border-2 border-gray-200 px-8 py-4 rounded-full font-semibold hover:border-black hover:bg-gray-50 transition-all duration-200">
                Post a Task
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 border-t border-gray-200 py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Why use QuickGig?</h2>
              <p className="text-lg text-gray-500 font-medium">Built for simplicity, speed, and local communities.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Location First</h3>
                <p className="text-gray-500 leading-relaxed font-medium">Discover tasks within a few kilometers of your exact location. No more traveling across the city for a small gig.</p>
              </div>
              
              {/* Card 2 */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Quick & Flexible</h3>
                <p className="text-gray-500 leading-relaxed font-medium">Work when you want, for as long as you want. Perfect for students and part-time workers with unpredictable schedules.</p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Open for Everyone</h3>
                <p className="text-gray-500 leading-relaxed font-medium">No need to be a registered business. Anyone can post a task, and anyone can complete one to earn money.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400 text-sm font-medium">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-gray-300" />
            <span className="font-bold text-gray-900 text-lg">QuickGig</span>
          </div>
          <p>© {new Date().getFullYear()} QuickGig Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
