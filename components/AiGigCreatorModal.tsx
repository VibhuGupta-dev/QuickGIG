'use client';

import React, { useState } from 'react';
import { Gig } from '../types/gig';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Wand2
} from 'lucide-react';

interface AiGigCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGigCreated: (gig: Gig) => void;
  initialPrompt?: string;
}

export const AiGigCreatorModal: React.FC<AiGigCreatorModalProps> = ({
  isOpen,
  onClose,
  onGigCreated,
  initialPrompt = '',
}) => {
  const [magicPrompt, setMagicPrompt] = useState(initialPrompt);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Gig['category']>('Delivery');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Gomti Nagar, Sector 4');
  const [payment, setPayment] = useState<number>(350);
  const [duration, setDuration] = useState('45 mins');
  const [urgency, setUrgency] = useState<Gig['urgency']>('Today');
  const [requirements, setRequirements] = useState<string[]>([
    'Smartphone with active GPS',
    'Student or Gov ID verification'
  ]);
  const [reqInput, setReqInput] = useState('');

  if (!isOpen) return null;

  const handleMagicAutofill = async () => {
    if (!magicPrompt.trim()) return;
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'parse_gig',
          prompt: magicPrompt,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        setTitle(d.title || magicPrompt);
        if (d.category) setCategory(d.category);
        if (d.description) setDescription(d.description);
        if (d.suggestedPayment) setPayment(Number(d.suggestedPayment));
        if (d.duration) setDuration(d.duration);
        if (d.urgency) setUrgency(d.urgency);
        if (d.safetyNotes && Array.isArray(d.safetyNotes)) {
          setRequirements(d.safetyNotes);
        }
      }
    } catch (err) {
      console.error('Error autofilling:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddRequirement = () => {
    if (reqInput.trim()) {
      setRequirements([...requirements, reqInput.trim()]);
      setReqInput('');
    }
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newGig: Gig = {
      id: `gig-${Date.now()}`,
      title,
      category,
      description,
      locationName: locationName || 'Central Lucknow Campus Area',
      distanceKm: +(Math.random() * 2 + 0.5).toFixed(1),
      payment: Number(payment) || 300,
      duration: duration || '45 mins',
      urgency,
      postedAt: 'Just now',
      posterName: 'Vibhu Gupta (You)',
      posterRating: 5.0,
      posterCompletedGigs: 1,
      verifiedPoster: true,
      aiMatchScore: 99,
      aiTags: ['New Posting', 'Quick Accept', category],
      safetyScore: 98,
      requirements: requirements.length > 0 ? requirements : ['Basic reliability', 'Verified ID'],
      status: 'Open',
    };

    onGigCreated(newGig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl shadow-indigo-950/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Create a Micro-Gig with AI
            </h2>
            <p className="text-xs text-slate-400">
              Type naturally in everyday words. AI auto-structures category, fair rate & safety specs.
            </p>
          </div>
        </div>

        {/* AI Magic Box */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900/60 border border-indigo-500/30">
          <label className="block text-xs font-semibold text-indigo-300 mb-2 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-cyan-300" />
            AI Prompt Auto-Drafter
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={magicPrompt}
              onChange={(e) => setMagicPrompt(e.target.value)}
              placeholder="e.g. Need someone to help move 2 study chairs to 2nd floor, paying ₹300"
              className="flex-1 bg-[#090d18] text-xs text-slate-200 placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-400"
            />
            <button
              type="button"
              onClick={handleMagicAutofill}
              disabled={isAiLoading || !magicPrompt.trim()}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 transition-all flex-shrink-0"
            >
              {isAiLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI Parsing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Magic Autofill</span>
                </>
              )}
            </button>
          </div>
          <span className="text-[10px] text-slate-400 block mt-2 font-mono">
            💡 Tip: Mention what you need done, where, and your approximate budget.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Gig Title */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              Gig Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deliver chemistry practical notes to Gate 2"
              className="w-full bg-[#0d121f] text-sm text-slate-200 placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Gig['category'])}
                className="w-full bg-[#0d121f] text-xs text-slate-200 px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500"
              >
                <option value="Delivery">Delivery & Courier</option>
                <option value="Moving">Moving & Heavy Lifting</option>
                <option value="Tutoring">Tutoring & Academic</option>
                <option value="Tech Help">Tech & Computer Assist</option>
                <option value="Home Care">Home Care & Cleaning</option>
                <option value="Event Assist">Event & College Fest Assist</option>
                <option value="Pet Care">Pet Care & Walking</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as Gig['urgency'])}
                className="w-full bg-[#0d121f] text-xs text-slate-200 px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500"
              >
                <option value="Immediate">Immediate (Within 1-2 hours)</option>
                <option value="Today">Today (By evening)</option>
                <option value="Flexible">Flexible (This week)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              Task Details & Context *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task clearly so students or nearby workers can understand what is required..."
              className="w-full bg-[#0d121f] text-xs text-slate-200 placeholder-slate-500 p-3 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Location, Payout, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Location Area
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Gomti Nagar, Sec 4"
                  className="w-full bg-[#0d121f] text-xs text-slate-200 pl-8 pr-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Payout (₹ INR)
              </label>
              <div className="relative">
                <span className="text-emerald-400 font-bold text-xs absolute left-3 top-2.5 pointer-events-none">₹</span>
                <input
                  type="number"
                  min={100}
                  step={50}
                  value={payment}
                  onChange={(e) => setPayment(Number(e.target.value))}
                  className="w-full bg-[#0d121f] text-xs text-slate-200 pl-7 pr-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Est. Duration
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 45 mins"
                  className="w-full bg-[#0d121f] text-xs text-slate-200 pl-8 pr-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Requirements & Safety checklist */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              Requirements / Safety Instructions
            </label>
            <div className="space-y-1.5 mb-2">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    {req}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
                placeholder="Add instruction (e.g. 'Must have sports shoes')..."
                className="flex-1 bg-[#0d121f] text-xs text-slate-200 px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="px-3 py-2 text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl border border-white/10"
              >
                Add
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Publish to Local Radar</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
