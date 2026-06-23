import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const AICoachWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '👋 Hi Hritika! I am your local EcoChain AI Coach. Ask me anything about carbon reductions, transit options, or your Stellar asset offsets!' }
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
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const historyString = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
      
      const response = await axios.post(`${backendUrl}/api/ai/chat`, {
        message: userMessage,
        history: historyString
      });

      setMessages((prev) => [...prev, { sender: 'bot', text: response.data.response }]);
    } catch (err) {
      console.error('🚨 Failed to stream data from local Ollama node:', err);
      setMessages((prev) => [...prev, { sender: 'bot', text: '⚠️ Connection timeout. Ensure your backend server is active and Ollama is running.' }]);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="w-80 sm:w-96 h-125 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fadeIn text-slate-800">
          <div className="bg-indigo-950 px-4 py-3.5 flex items-center justify-between text-white border-b border-indigo-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-900 text-sm rounded-lg flex items-center justify-center border border-indigo-700">🔮</div>
              <div>
                <h3 className="font-black text-xs tracking-wide uppercase text-indigo-200">AI Carbon Coach</h3>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse"></span> Local Ollama RAG Active
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-indigo-300 hover:text-white transition-colors text-lg font-bold p-1 cursor-pointer">✕</button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50---">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 text-xs rounded-xl shadow-xs leading-relaxed break-word whitespace-pre-line ${msg.sender === 'user' ? 'bg-indigo-600 text-white font-medium rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl rounded-tl-none flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your emissions footprint..."
              disabled={loading}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-hidden focus:border-indigo-600 focus:bg-white transition-all"
            />
            <button type="submit" disabled={loading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AICoachWidget;