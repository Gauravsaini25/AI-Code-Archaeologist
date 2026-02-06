import React, { useState, useEffect } from 'react';
import { Send, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const ChatPanel = ({ onQuery }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Hello! I am your Code Archaeologist. Ask me anything about this repository.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse on mobile, but respect user choice on desktop unless resizing crosses boundary
  useEffect(() => {
    let lastWidth = window.innerWidth;

    const handleResize = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const wasMobile = lastWidth < 768;

      // Only auto-change state if we cross the breakpoint
      if (isMobile !== wasMobile) {
        setIsCollapsed(isMobile);
      }

      lastWidth = width;
    };

    // Initial check
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await onQuery(input);
      setMessages(prev => [...prev, { role: 'system', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: "Connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`absolute top-4 left-4 bottom-16 pointer-events-none z-50 transition-all duration-300 ease-out ${isCollapsed ? 'w-12' : 'w-[90vw] sm:w-72 lg:w-80'
        }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-12 pointer-events-auto flex items-center justify-center bg-[#1a1a1a] border border-white/10 rounded-r-lg z-20 hover:bg-[#252525] transition-colors shadow-lg"
      >
        {isCollapsed ? (
          <ChevronRight size={14} className="text-white/60" />
        ) : (
          <ChevronLeft size={14} className="text-white/60" />
        )}
      </button>

      {/* Panel */}
      <div
        className={`w-full h-full rounded-3xl pointer-events-auto flex flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 shadow-2xl'
          }`}
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {/* Header */}
        <div
          className="p-3 sm:p-4 flex items-center gap-3 bg-white/5 border-b border-white/10"
        >
          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-xs sm:text-sm">Archaeologist AI</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-[9px] sm:text-[10px] text-white/40">GPT-4 Connected</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[90%] px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-[13px] leading-relaxed ${msg.role === 'user' ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md'
                  }`}
                style={msg.role === 'user'
                  ? { background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', boxShadow: '0 4px 12px rgba(0,122,255,0.3)' }
                  : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.05)' }
                }
              >
                <span className="text-white">{msg.content}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-2.5 rounded-2xl rounded-bl-md text-[13px] text-white/50 animate-pulse bg-white/5">
                Analyzing...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-2 sm:p-3 bg-black/20 border-t border-white/5">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[13px] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all bg-white/10 border border-white/10"
              placeholder="Ask about impact or risk..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="w-9 sm:w-10 h-9 sm:h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 hover:scale-105 active:scale-95 bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/30 shadow-lg"
              disabled={loading}
            >
              <Send className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white" />
            </button>
          </form>
        </div>
      </div>

      {/* Collapsed State Icon */}
      {isCollapsed && (
        <div
          className="absolute top-4 left-0 w-12 h-12 rounded-2xl pointer-events-auto flex items-center justify-center cursor-pointer transition-transform hover:scale-105 glass-panel"
          onClick={() => setIsCollapsed(false)}
        >
          <Sparkles className="w-5 h-5 text-blue-400" />
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
