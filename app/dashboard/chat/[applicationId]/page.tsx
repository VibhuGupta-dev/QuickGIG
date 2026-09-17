"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";

export default function ChatPage({ params }: { params: { applicationId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${params.applicationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated") {
      fetchMessages();
      // Poll every 5 seconds
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, params.applicationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await fetch(`/api/messages/${params.applicationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const newMessage = await res.json();
        setMessages(prev => [...prev, newMessage]);
        setText("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || status === "loading") return <div className="p-8 text-center">Loading chat...</div>;

  // @ts-expect-error session.user lacks id
  const currentUserId = session?.user?.id;

  return (
    <div className="min-h-screen bg-gray-50 font-medium flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 sticky top-0 z-50 flex items-center shadow-sm">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-black mr-4 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-black">Chat</h1>
      </header>

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full flex flex-col space-y-4 pt-6 overflow-y-auto pb-24">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">No messages yet. Say hi!</div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:static md:max-w-2xl md:mx-auto md:w-full md:rounded-b-3xl">
        <form onSubmit={handleSend} className="flex gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button type="submit" disabled={!text.trim()} className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 disabled:opacity-50 transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
