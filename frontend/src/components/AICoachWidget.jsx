import React, { useState, useRef, useEffect } from 'react';
import api from '../config/api';

const AICoachWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('ecochain_user') || 'null');
  const userName = user?.name?.split(' ')[0] || 'Explorer';

  const [messages, setMessages] = useState([
    { sender: 'bot', text: `👋 Hi ${userName}! I'm your EcoChain AI Coach. Ask me about carbon reduction, offset strategies, eco-friendly habits, or anything sustainability-related!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // Build conversation history for context
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const { data } = await api.post('/ai/chat', {
        message: userMessage,
        history
      });

      setMessages((prev) => [...prev, { sender: 'bot', text: data.response }]);
    } catch (err) {
      console.error('AI chat error:', err);
      const errorMsg = err.response?.status === 401
        ? '🔒 Session expired — please log in again to use the AI Coach.'
        : '⚠️ Could not reach the AI service. Please try again in a moment.';
      setMessages((prev) => [...prev, { sender: 'bot', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "How can I reduce my carbon footprint?",
    "What are carbon offsets?",
    "Best low-emission transport?",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans antialiased">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-indigo-950 hover:bg-indigo-900 text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer border border-slate-200/20 group relative"
        >
          <span className="text-2xl group-hover:rotate-12 transition-transform duration-150">🔮</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fadeIn text-slate-800" style={{ height: '500px' }}>
          {/* Header */}
          <div className="bg-indigo-950 px-4 py-3.5 flex items-center justify-between text-white border-b border-indigo-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-900 text-sm rounded-lg flex items-center justify-center border border-indigo-700">🔮</div>
              <div>
                <h3 className="font-black text-xs tracking-wide uppercase text-indigo-200">AI Carbon Coach</h3>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
                  HuggingFace Cloud RAG Active
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-indigo-300 hover:text-white transition-colors text-lg font-bold p-1 cursor-pointer">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 text-xs rounded-xl shadow-sm leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Quick question suggestions (only show when no user messages yet) */}
            {messages.length === 1 && !loading && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Try asking:</p>
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); }}
                    className="block w-full text-left px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50/50 transition-all cursor-pointer"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about emissions, offsets, eco tips..."
              disabled={loading}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AICoachWidget;