"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

interface Conversation {
  gigId: string;
  gigTitle: string;
  gigStatus: string;
  otherUser: { id: string; name: string };
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
    isMine: boolean;
  } | null;
  unreadCount: number;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { day: "numeric", month: "short" });
  }
}

const statusColors: Record<string, string> = {
  Open: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Accepted: "bg-blue-50 text-blue-700 border border-blue-200",
  "In-Progress": "bg-amber-50 text-amber-700 border border-amber-200",
  Completed: "bg-slate-100 text-[#475569] border border-[#e2e8f0]",
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-4 bg-white border border-[#e2e8f0] rounded-2xl animate-pulse">
      <div className="w-11 h-11 rounded-full bg-slate-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-slate-100 rounded-full w-2/5" />
        <div className="h-3 bg-slate-100 rounded-full w-3/5" />
        <div className="h-3 bg-slate-100 rounded-full w-4/5" />
      </div>
      <div className="h-3 bg-slate-100 rounded-full w-10 shrink-0" />
    </div>
  );
}

export default function ChatsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chat")
      .then((res) => {
        if (res.status === 401) {
          router.push("/auth/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          // Sort by latest message first
          const sorted = (data as Conversation[]).sort((a, b) => {
            const aTime = a.lastMessage?.createdAt
              ? new Date(a.lastMessage.createdAt).getTime()
              : 0;
            const bTime = b.lastMessage?.createdAt
              ? new Date(b.lastMessage.createdAt).getTime()
              : 0;
            return bTime - aTime;
          });
          setConversations(sorted);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans selection:bg-[#2563eb] selection:text-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] px-4 py-3 sticky top-0 z-50 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-[#94a3b8] hover:text-[#0f172a] transition-colors p-1.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <MessageCircle className="w-5 h-5 text-[#2563eb]" />
          <h1 className="text-base font-semibold text-[#0f172a]">Messages</h1>
        </div>
        {!loading && conversations.length > 0 && (
          <span className="text-xs font-medium text-[#475569] bg-slate-100 px-2.5 py-0.5 rounded-full border border-[#e2e8f0]">
            {conversations.length}
          </span>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 pb-20 space-y-3">
        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : conversations.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-[#2563eb]">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h2 className="text-base font-semibold text-[#0f172a] mb-1.5">
              No conversations yet
            </h2>
            <p className="text-sm text-[#475569] max-w-xs leading-relaxed">
              When you accept a gig or someone accepts yours, your chat will
              appear here.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors shadow-sm"
            >
              Browse Gigs
            </Link>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.gigId}
              onClick={() => router.push(`/dashboard/gig/${conv.gigId}`)}
              className="w-full flex items-center gap-3 p-4 bg-white border border-[#e2e8f0] rounded-2xl hover:border-[#2563eb] hover:shadow-sm transition-all text-left group"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-slate-100 border border-[#e2e8f0] flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-[#0f172a]">
                  {conv.otherUser.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`font-semibold text-sm text-[#0f172a] ${conv.unreadCount > 0 ? "font-bold" : ""}`}
                  >
                    {conv.otherUser.name}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${statusColors[conv.gigStatus] || statusColors["Completed"]}`}
                  >
                    {conv.gigStatus}
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8] truncate mb-1">
                  {conv.gigTitle}
                </p>
                {conv.lastMessage ? (
                  <p
                    className={`text-xs truncate ${conv.unreadCount > 0 ? "text-[#0f172a] font-medium" : "text-[#475569]"}`}
                  >
                    {conv.lastMessage.isMine ? (
                      <span className="text-[#94a3b8]">You: </span>
                    ) : null}
                    {conv.lastMessage.content}
                  </p>
                ) : (
                  <p className="text-xs text-[#94a3b8] italic">No messages</p>
                )}
              </div>

              {/* Right side: time + badge */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {conv.lastMessage && (
                  <span className="text-[10px] text-[#94a3b8]">
                    {formatTime(conv.lastMessage.createdAt)}
                  </span>
                )}
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-[#2563eb] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </main>
    </div>
  );
}
