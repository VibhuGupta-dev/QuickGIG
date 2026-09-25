'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Search,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [promptInput, setPromptInput] = useState('');

  const sampleTasks = [
    {
      title: 'Deliver university lab records to Gate 2',
      location: 'Gomti Nagar, Sec 4',
      distance: '1.4 km',
      pay: '₹280',
      time: '30 mins',
      category: 'Delivery'
    },
    {
      title: 'Help carry 3 boxes of study material (3rd Floor)',
      location: 'Indira Nagar, Block B',
      distance: '2.8 km',
      pay: '₹450',
      time: '45 mins',
      category: 'Moving'
    },
    {
      title: 'Python Pandas practicals tutoring (1 hour)',
      location: 'SRMCEM Library Cafe',
      distance: '0.6 km',
      pay: '₹600',
      time: '1 hr',
      category: 'Tutoring'
    }
  ];

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) {
      router.push('/dashboard');
      return;
    }
    // Forward query to dashboard
    router.push(`/dashboard?search=${encodeURIComponent(promptInput.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#1f1e1d] flex flex-col font-sans selection:bg-[#cc785c] selection:text-white">
      
      {/* Claude-style Minimalist Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#e8e6df] bg-[#faf9f5]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#cc785c] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight text-[#1f1e1d]">QuickGig</span>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            <Link 
              href="/auth/login" 
              className="text-sm font-medium text-[#65635e] hover:text-[#1f1e1d] transition-colors px-2 py-1"
            >
              Log in
            </Link>
            <Link 
              href="/auth/register" 
              className="text-sm font-medium bg-[#1f1e1d] hover:bg-[#383734] text-white px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Get Started
            </Link>
          </nav>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            
            {/* Minimal pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0eee6] border border-[#e2dfd5] text-xs font-medium text-[#65635e] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cc785c]" />
              <span>Hyper-local micro-tasks for students & local communities</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="text-4xl sm:text-6xl font-normal tracking-tight text-[#1f1e1d] leading-[1.18] font-serif">
              Find small jobs, <br />
              <span className="text-[#65635e] font-sans">right in your neighborhood.</span>
            </h1>

            {/* Calm Subheading */}
            <p className="mt-5 text-base sm:text-lg text-[#65635e] max-w-xl mx-auto leading-relaxed">
              Need help moving furniture, tutoring, or running an errand? QuickGig connects you with trusted hands nearby in minutes. No middlemen, no hassle.
            </p>

            {/* Claude-style Minimal Prompt Box */}
            <div className="mt-10 max-w-2xl mx-auto">
              <form 
                onSubmit={handlePromptSubmit}
                className="bg-white border border-[#e8e6df] hover:border-[#cc785c]/60 focus-within:border-[#cc785c] rounded-2xl p-2.5 shadow-sm transition-all text-left"
              >
                <div className="flex items-center gap-3 px-3 py-1.5">
                  <Search className="w-4 h-4 text-[#8f8d86] flex-shrink-0" />
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="Describe a task or skill... (e.g. 'Help moving study table 2km away')"
                    className="w-full bg-transparent text-sm text-[#1f1e1d] placeholder-[#8f8d86] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-[#cc785c] hover:bg-[#b8694f] text-white transition-all shadow-sm"
                    title="Search or Post"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Minimal Suggestion Chips */}
              <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs text-[#8f8d86]">
                <span>Popular:</span>
                {['Campus delivery', 'Moving help', 'Python tutor', 'Laptop setup', 'Dog walk'].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPromptInput(chip)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#e8e6df] hover:border-[#cc785c] text-[#65635e] hover:text-[#1f1e1d] transition-all text-xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                href="/auth/register" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1f1e1d] hover:bg-[#383734] text-white px-7 py-3 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow"
              >
                Start Earning <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/dashboard/add-gig" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-[#f5f4ef] text-[#1f1e1d] border border-[#e8e6df] px-7 py-3 rounded-xl font-medium text-sm transition-all"
              >
                Post a Task
              </Link>
            </div>

          </div>
        </section>

        {/* Live Tasks Preview (Clean & Simple) */}
        <section className="py-12 px-4 sm:px-6 border-t border-[#e8e6df] bg-white">
          <div className="max-w-4xl mx-auto">
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[#1f1e1d]">Nearby sample tasks</h2>
                <p className="text-xs text-[#65635e]">Active opportunities in your local radius</p>
              </div>
              <Link 
                href="/dashboard" 
                className="text-xs font-medium text-[#cc785c] hover:underline flex items-center gap-1"
              >
                View all in Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sampleTasks.map((task, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-[#faf9f5] border border-[#e8e6df] hover:border-[#cc785c]/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-white border border-[#e8e6df] text-[#65635e] font-medium text-[11px]">
                        {task.category}
                      </span>
                      <span className="font-semibold text-[#cc785c] text-sm">
                        {task.pay}
                      </span>
                    </div>

                    <h3 className="font-medium text-sm text-[#1f1e1d] leading-snug line-clamp-2">
                      {task.title}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#e8e6df] flex items-center justify-between text-xs text-[#65635e]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#8f8d86]" />
                      <span>{task.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#8f8d86]" />
                      <span>{task.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Why QuickGig (3 Clean Cards) */}
        <section className="py-20 px-4 sm:px-6 border-t border-[#e8e6df]">
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-12 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#1f1e1d] tracking-tight">
                Why use QuickGig?
              </h2>
              <p className="text-sm text-[#65635e]">
                Built for simplicity, speed, and local communities.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-2xl border border-[#e8e6df] shadow-sm flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#f0eee6] flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-[#cc785c]" />
                </div>
                <h3 className="text-base font-semibold text-[#1f1e1d] mb-1.5">
                  Location First
                </h3>
                <p className="text-xs text-[#65635e] leading-relaxed">
                  Discover tasks within a few kilometers of your exact location. No traveling across the city for a small gig.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-2xl border border-[#e8e6df] shadow-sm flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#f0eee6] flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5 text-[#cc785c]" />
                </div>
                <h3 className="text-base font-semibold text-[#1f1e1d] mb-1.5">
                  Quick &amp; Flexible
                </h3>
                <p className="text-xs text-[#65635e] leading-relaxed">
                  Work when you want, for as long as you want. Perfect for students with fluctuating class schedules.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-2xl border border-[#e8e6df] shadow-sm flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#f0eee6] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5 text-[#cc785c]" />
                </div>
                <h3 className="text-base font-semibold text-[#1f1e1d] mb-1.5">
                  Open for Everyone
                </h3>
                <p className="text-xs text-[#65635e] leading-relaxed">
                  No need to be an agency or registered business. Anyone can post a task, and anyone can complete one safely.
                </p>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Claude-style Minimal Clean Footer */}
      <footer className="border-t border-[#e8e6df] bg-white py-10 px-4 sm:px-6 text-xs text-[#65635e]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#cc785c] flex items-center justify-center text-white">
              <Sparkles className="w-3 h-3 fill-white" />
            </div>
            <span className="font-semibold text-[#1f1e1d]">QuickGig</span>
            <span className="text-[#8f8d86]">• Hyper-local micro-gig platform</span>
          </div>

          <div className="flex items-center gap-1.5 text-center sm:text-right text-[11px] text-[#8f8d86]">
            <GraduationCap className="w-3.5 h-3.5 text-[#cc785c]" />
            <span>Capstone Project • SRMCEM Lucknow</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
