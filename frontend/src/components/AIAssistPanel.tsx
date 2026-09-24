import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  Send, 
  CloudRain, 
  Calendar, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp, 
  RotateCcw, 
  Copy, 
  Check, 
  Zap,
  ChevronDown,
  ChevronUp,
  BarChart3
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import { motion, AnimatePresence } from "framer-motion";
import { AIMarkdownRenderer } from "./AIMarkdownRenderer";

export const AIAssistPanel: React.FC = () => {
  const { alerts, askAI } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showInsights, setShowInsights] = useState(true);

  const initialGreeting = {
    sender: "ai" as const,
    text: "Namaste! I am your **QuickBizs AI Copilot** powered by **Google Gemini 3.6 Flash**.\n\nI have direct access to your live inventory, today's sales bills, Udhaar Khata ledger, and staff attendance. Ask me anything about your store or choose a quick prompt below!",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string; time: string }[]>([
    initialGreeting
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom smoothly
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetSession = () => {
    setMessages([
      {
        sender: "ai",
        text: "Session refreshed! How can I assist you with your business right now?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const timeStamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: "user", text: userText, time: timeStamp }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await askAI(userText);
      setMessages(prev => [...prev, { sender: "ai", text: response, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "ai", text: "I encountered an error connecting to store AI. Please check your network and try again.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsTyping(false);
    }
  };

  const selectQuickQuestion = async (question: string) => {
    if (isTyping) return;
    const timeStamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: "user", text: question, time: timeStamp }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await askAI(question);
      setMessages(prev => [...prev, { sender: "ai", text: response, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "ai", text: "I encountered an error connecting to store AI. Please try again.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Filter for proactive weather/festival/alert insights
  const proactiveInsights = alerts.filter(a => a.type === "weather" || a.type === "festival");

  const quickPrompts = [
    { label: "Analyze Why Sales Drop", icon: BarChart3, query: "Analyze my whole store data: Why did my sales go down or fluctuate, how does it occur, and give me exact instructions to improve." },
    { label: "Low Stock Items", icon: ShoppingBag, query: "Which products are currently low on stock and need urgent reordering?" },
    { label: "Pending Khata Dues", icon: CreditCard, query: "Who has pending Udhaar dues and who owes the highest amount?" },
    { label: "Sales & Growth", icon: TrendingUp, query: "Analyze my sales today and give me best instructions to improve sales" },
    { label: "Rain Forecast", icon: CloudRain, query: "What weather forecasts affect sales and what items should I stock up?" },
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle QuickBizs AI Assistant"
        className={`fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 h-14 w-14 rounded-full flex items-center justify-center text-white shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/25 ${
          isOpen 
            ? "rotate-90 bg-slate-800 shadow-slate-900/60" 
            : "bg-gradient-to-tr from-brand-orange to-amber-500 shadow-brand-orange/40"
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6 animate-pulse" />}
      </button>

      {/* Slide-out Panel Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0.95 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed top-0 right-0 w-full sm:w-[420px] lg:w-[450px] h-screen bg-slate-950 border-l border-slate-800/80 shadow-2xl z-55 flex flex-col text-slate-100 font-sans"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-10 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-tr from-brand-orange to-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-orange/30 shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm tracking-tight text-white">
                      QuickBizs AI Copilot
                    </h3>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Gemini 3.6
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Store Intelligence · Live Database Connected
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetSession}
                  title="Reset conversation"
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  title="Close panel"
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Conversation Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Proactive Insights Section (Collapsible) */}
              {proactiveInsights.length > 0 && (
                <div className="rounded-2xl border border-slate-800/90 bg-slate-900/70 p-3 space-y-2">
                  <button
                    onClick={() => setShowInsights(!showInsights)}
                    className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Zap className="h-3.5 w-3.5" />
                      Today's Live Store Alerts ({proactiveInsights.length})
                    </span>
                    {showInsights ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {showInsights && (
                    <div className="space-y-2 pt-1">
                      {proactiveInsights.map((insight) => (
                        <div 
                          key={insight.id}
                          onClick={() => selectQuickQuestion(
                            insight.type === "weather" 
                              ? "Tell me about the rain sales forecast and what to stock" 
                              : "Suggest sweets stock for diwali and festival prep"
                          )}
                          className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-slate-700 transition-all duration-200 cursor-pointer flex gap-3 text-xs group"
                        >
                          <div className={`mt-0.5 rounded-lg p-1.5 h-fit shrink-0 ${
                            insight.type === "weather" 
                              ? "bg-blue-500/15 text-blue-400 border border-blue-500/20" 
                              : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {insight.type === "weather" ? <CloudRain className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-200 leading-tight mb-1 group-hover:text-brand-orange transition-colors">
                              {insight.message}
                            </p>
                            <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                              {insight.details}
                            </p>
                            <span className="text-[10px] font-bold text-brand-orange mt-1.5 inline-flex items-center gap-1 group-hover:underline">
                              Ask AI Analysis &rarr;
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Message Feed */}
              <div className="space-y-4 pt-1">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex gap-2.5 ${
                      msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    {msg.sender === "ai" ? (
                      <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-brand-orange to-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 font-bold text-[10px] mt-1">
                        YOU
                      </div>
                    )}

                    {/* Bubble */}
                    <div className={`flex flex-col max-w-[85%] ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}>
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        msg.sender === "user" 
                          ? "bg-gradient-to-r from-brand-orange to-amber-600 text-white rounded-tr-xs font-semibold shadow-brand-orange/10" 
                          : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs shadow-slate-950/50"
                      }`}>
                        {msg.sender === "user" ? (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        ) : (
                          <AIMarkdownRenderer content={msg.text} isDark={true} />
                        )}

                        {/* Actions for AI responses */}
                        {msg.sender === "ai" && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                            <span>QuickBizs Gemini Copilot</span>
                            <button
                              onClick={() => handleCopy(msg.text, i)}
                              className="hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Copy answer"
                            >
                              {copiedIndex === i ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" />
                                  <span className="text-emerald-400 font-semibold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {/* Modern Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-2.5 items-start">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-brand-orange to-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1 animate-pulse">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 rounded-tl-xs flex items-center gap-2.5">
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-brand-orange animate-bounce"></span>
                        <span className="h-2 w-2 rounded-full bg-brand-orange animate-bounce [animation-delay:0.2s]"></span>
                        <span className="h-2 w-2 rounded-full bg-brand-orange animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">
                        Analyzing your store data...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Quick Prompts Dock (Interactive Pill Chips) */}
            <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/90">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-[11px]">
                {quickPrompts.map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => selectQuickQuestion(prompt.query)}
                      disabled={isTyping}
                      className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-800 hover:border-brand-orange/60 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Icon className="h-3 w-3 text-brand-orange" />
                      <span>{prompt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Dock */}
            <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-900/90 flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-brand-orange/20 rounded-2xl px-3 py-1.5 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about sales, khata, stock..."
                  disabled={isTyping}
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none py-2"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className="h-8 w-8 bg-brand-orange hover:bg-brand-orange-hover disabled:bg-slate-800 disabled:text-slate-600 rounded-xl flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-500 px-1">
                <span>Gemini 3.6 Flash · Instant store analytics</span>
                <span>Press Enter to send</span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
