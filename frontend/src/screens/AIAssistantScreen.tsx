import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  Users,
  Lightbulb,
  DollarSign,
  Copy,
  Check
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import { AIMarkdownRenderer } from "../components/AIMarkdownRenderer";

export const AIAssistantScreen: React.FC = () => {
  const { askAI, getAIForecast, products, customers, orders, employees, expenses, suppliers } = useBusiness();
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string; time: string }[]>([
    {
      sender: "ai",
      text: "Namaste! I am your QuickBizs AI Business Copilot powered by Google Gemini. I have live access to your inventory, bills, customer Udhaar ledger, and staff attendance. Ask me anything about your business data!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isRefreshingForecast, setIsRefreshingForecast] = useState(false);
  const [forecastData, setForecastData] = useState<{ demandPrediction: string; rosterSuggestion: string; cashflowAdvice: string }>({
    demandPrediction: "Tomorrow's footfall will peak in the morning (08:00 - 11:00 AM) and evening. Ensure fresh staples are restocked.",
    rosterSuggestion: "Billing cashier station should be staffed by 08:30 AM. Assign floor backup for restocking shelves.",
    cashflowAdvice: "Send polite WhatsApp reminders to top Khata accounts over ₹1,000 to maximize working capital."
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const loadForecast = async () => {
    setIsRefreshingForecast(true);
    try {
      const data = await getAIForecast();
      if (data) setForecastData(data);
    } catch (e) {
      console.warn("Forecast fetch error:", e);
    } finally {
      setIsRefreshingForecast(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, []);

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
      setMessages(prev => [...prev, { sender: "ai", text: "I encountered an error connecting to store AI. Please try again.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestClick = async (q: string) => {
    if (isTyping) return;
    const timeStamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: "user", text: q, time: timeStamp }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await askAI(q);
      setMessages(prev => [...prev, { sender: "ai", text: response, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "ai", text: "I encountered an error connecting to store AI. Please try again.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Live store data calculations
  const lowStock = products.filter(p => p.stock <= p.minStock);
  const outstandingCredit = customers.reduce((acc, c) => acc + (c.pendingDues || 0), 0);
  const todaySalesTotal = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const absentStaffCount = employees.filter(e => e.status === "Absent").length;
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const suppliersDueTotal = suppliers.reduce((acc, s) => acc + (s.pendingDues || 0), 0);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 pb-28 text-slate-900 dark:text-white">
      
      {/* Adaptive Page Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                QuickBizs AI Assistant
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Gemini 3.6 Flash Active
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Intelligent Store Copilot · Ask anything about your store's live sales, inventory, Udhaar, and staff
            </p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{
            sender: "ai",
            text: "Session cleared. How can I help you optimize your business today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }])}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Chat Session
        </button>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: Audits & Next Day Forecast */}
        <div className="w-full lg:w-96 space-y-5 shrink-0">
          
          {/* Active Audits */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xs relative overflow-hidden">
            <div className="absolute right-0 top-0 h-40 w-40 bg-brand-orange/20 rounded-full blur-2xl"></div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-white flex items-center gap-2 relative z-10">
              <Zap className="h-4 w-4 text-brand-orange" />
              QuickBizs Proactive Audits
            </h3>

            <div className="space-y-2.5 mt-4 relative z-10 text-xs">
              <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 font-medium">Today's Revenue:</span>
                <span className="text-emerald-400 font-bold">₹{todaySalesTotal.toLocaleString()} ({orders.length} bills)</span>
              </div>

              <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 font-medium">Inventory Status:</span>
                {lowStock.length > 0 ? (
                  <span className="text-brand-orange font-bold">{lowStock.length} items low</span>
                ) : (
                  <span className="text-emerald-400 font-bold">100% Stock Healthy</span>
                )}
              </div>

              <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 font-medium">Credit Collections:</span>
                {outstandingCredit > 0 ? (
                  <span className="text-rose-400 font-bold">₹{outstandingCredit.toLocaleString()} pending</span>
                ) : (
                  <span className="text-emerald-400 font-bold">₹0 Outstanding</span>
                )}
              </div>

              <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 font-medium">Staff Attendance:</span>
                <span className="text-slate-200 font-bold">
                  {employees.filter(e => e.status !== "Absent").length}/{employees.length} present
                  {absentStaffCount > 0 && <span className="text-rose-400 ml-1">({absentStaffCount} absent)</span>}
                </span>
              </div>

              <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 font-medium">Supplier Payables:</span>
                <span className="text-slate-200 font-bold">
                  ₹{suppliersDueTotal.toLocaleString()} due
                </span>
              </div>

              <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 font-medium">Store Expenses:</span>
                <span className="text-slate-200 font-bold">
                  ₹{totalExpenses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Next-Day Forecasting Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Next-Day AI Forecasting</span>
              <button 
                onClick={loadForecast} 
                disabled={isRefreshingForecast}
                className="cursor-pointer hover:text-brand-orange transition-colors"
                title="Refresh Forecast"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${isRefreshingForecast ? "animate-spin text-brand-orange" : ""}`} />
              </button>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Demand predictions */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  Demand Predictor
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-normal">
                  {forecastData.demandPrediction}
                </p>
              </div>

              {/* Roster Suggestions */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  Roster Suggestion
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-normal">
                  {forecastData.rosterSuggestion}
                </p>
              </div>

              {/* Cashflow Advice */}
              {forecastData.cashflowAdvice && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-amber-500" />
                    Cashflow Strategy
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-normal">
                    {forecastData.cashflowAdvice}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Suggested prompts list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 font-semibold text-slate-800 dark:text-slate-200">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Quick AI Analysis Prompts
            </h4>
            
            <div className="space-y-2">
              <div 
                onClick={() => handleSuggestClick("Analyze my sales today and break down payment methods")}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 text-xs active:scale-98"
              >
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-500 mt-0.5">
                  <ShoppingBag className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-xs">Today's Sales Analysis</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">"Analyze today's sales and payment split"</p>
                </div>
              </div>

              <div 
                onClick={() => handleSuggestClick("Which products in my store need urgent reordering?")}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 text-xs active:scale-98"
              >
                <div className="p-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-500 mt-0.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-xs">Low Stock & Reorders</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">"Which products need urgent reordering?"</p>
                </div>
              </div>

              <div 
                onClick={() => handleSuggestClick("Who has pending Udhaar and who owes the highest amount?")}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 text-xs active:scale-98"
              >
                <div className="p-1.5 bg-rose-50 dark:bg-rose-500/10 rounded-lg text-rose-500 mt-0.5">
                  <CreditCard className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-xs">Udhaar (Khata) Dues</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">"Who owes the most pending Udhaar?"</p>
                </div>
              </div>

              <div 
                onClick={() => handleSuggestClick("Check staff attendance and tell me who was absent today")}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 text-xs active:scale-98"
              >
                <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-500 mt-0.5">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-xs">Staff Attendance</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">"Check staff attendance & absent list"</p>
                </div>
              </div>

              <div 
                onClick={() => handleSuggestClick("How can I increase my store profit and reduce expenses this week?")}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 text-xs active:scale-98"
              >
                <div className="p-1.5 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-500 mt-0.5">
                  <Lightbulb className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-xs">Profit Improvement</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">"How can I increase profit this week?"</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Extended Chat Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xs min-h-[580px]">
          
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Active AI Intelligence Session</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">Context: Live Store Database · Gemini 3.6 Flash</span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-3 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar Badge */}
                {msg.sender === "ai" ? (
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-orange to-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    YOU
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`flex flex-col max-w-[85%] ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}>
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    msg.sender === "user" 
                      ? "bg-gradient-to-r from-brand-orange to-amber-600 text-white rounded-tr-xs font-semibold shadow-brand-orange/15" 
                      : "bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700/60"
                  }`}>
                    {msg.sender === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <AIMarkdownRenderer content={msg.text} />
                    )}

                    {/* Copy action on AI response */}
                    {msg.sender === "ai" && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-brand-orange">QuickBizs AI Copilot</span>
                        <button
                          onClick={() => handleCopy(msg.text, i)}
                          className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Copy answer"
                        >
                          {copiedIndex === i ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-500 font-bold">Copied</span>
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
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-start">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-orange to-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 animate-pulse">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 rounded-tl-xs border border-slate-200 dark:border-slate-700/60 flex items-center gap-3 shadow-xs">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-brand-orange animate-bounce"></span>
                    <span className="h-2 w-2 rounded-full bg-brand-orange animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-2 w-2 rounded-full bg-brand-orange animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-xs font-semibold">
                    Gemini AI is analyzing live store data...
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              placeholder="Ask anything: 'How much sales today?', 'Who owes Udhaar?', 'Which items to reorder?'..."
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="h-10 w-10 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 rounded-xl flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow-xs shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
