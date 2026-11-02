import React, { useState, useEffect } from "react";
import { 
  Plus, 
  X, 
  Receipt, 
  CheckCircle2,
  ShoppingBag,
  BarChart3,
  Sparkles,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  Flame,
  Percent,
  CircleDollarSign
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import { useTranslation } from "../context/LanguageContext";
import { api } from "../config/api";
import { DeepDataAnalyzer } from "../components/DeepDataAnalyzer";

interface ReportsProps {
  setActiveScreen: (screen: any) => void;
}

export const Reports: React.FC<ReportsProps> = ({ setActiveScreen }) => {
  const { language } = useTranslation();
  const { orders, products, expenses, addExpense } = useBusiness();
  const [filterMode, setFilterMode] = useState<"All" | "Cash" | "UPI" | "Credit">("All");

  const [pickupOrders, setPickupOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"deep-analysis" | "sales" | "pickups">("deep-analysis");

  const fetchPickupOrders = async () => {
    try {
      const res = await api.get("/pickup-orders/merchant/orders");
      if (res.data?.success && res.data?.data?.orders) {
        setPickupOrders(res.data.data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch pickup orders for reports:", err);
    }
  };

  useEffect(() => {
    fetchPickupOrders();
  }, []);

  // Expense Logger Modal
  const [isLoggingExpense, setIsLoggingExpense] = useState(false);
  const [expDescription, setExpDescription] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState<"Rent" | "Electricity" | "Salary" | "Tea/Snacks" | "Other">("Tea/Snacks");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter(o => o.date.startsWith(today));
  
  const totalSales = todayOrders.reduce((acc, o) => acc + o.total, 0);

  const totalCost = todayOrders.reduce((orderAcc, order) => {
    const orderCost = order.items.reduce((itemAcc, item) => {
      const prod = products.find(p => p.id === item.productId);
      const cost = prod ? prod.costPrice : item.price * 0.8;
      return itemAcc + cost * item.quantity;
    }, 0);
    return orderAcc + orderCost;
  }, 0);

  const grossProfit = totalSales - totalCost;
  const todayExpenses = expenses
    .filter(e => e.date.startsWith(today))
    .reduce((acc, e) => acc + e.amount, 0);

  const netProfit = grossProfit - todayExpenses;
  const profitMarginPercent = totalSales > 0 ? Math.round((netProfit / totalSales) * 100) : 0;
  const avgOrderValue = todayOrders.length > 0 ? Math.round(totalSales / todayOrders.length) : 0;

  // Payment Breakdown
  const cashSales = todayOrders.filter(o => o.paymentMethod === "Cash").reduce((sum, o) => sum + o.total, 0);
  const upiSales = todayOrders.filter(o => o.paymentMethod === "UPI").reduce((sum, o) => sum + o.total, 0);
  const creditSales = todayOrders.filter(o => o.paymentMethod === "Credit").reduce((sum, o) => sum + o.total, 0);

  const cashPercent = totalSales > 0 ? Math.round((cashSales / totalSales) * 100) : 0;
  const upiPercent = totalSales > 0 ? Math.round((upiSales / totalSales) * 100) : 0;
  const creditPercent = totalSales > 0 ? Math.round((creditSales / totalSales) * 100) : 0;

  // Top Selling Products Today
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  todayOrders.forEach(order => {
    order.items.forEach(item => {
      const key = item.productId || item.name;
      const existing = productSalesMap[key] || { name: item.name, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += item.price * item.quantity;
      productSalesMap[key] = existing;
    });
  });
  const topSellingProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue).slice(0, 4);

  // Pickup Analytics Calculations
  const todayPickupOrders = pickupOrders.filter(o => o.createdAt.startsWith(today));
  const completedPickupOrders = pickupOrders.filter(o => o.orderStatus === "COMPLETED");
  const completedPickupRevenue = completedPickupOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const averagePickupValue = completedPickupOrders.length > 0 ? Math.round(completedPickupRevenue / completedPickupOrders.length) : 0;
  const cancelledPickupCount = pickupOrders.filter(o => o.orderStatus === "CANCELLED" || o.orderStatus === "REJECTED").length;
  const todayPickupSales = todayPickupOrders.filter(o => o.orderStatus === "COMPLETED").reduce((sum, o) => sum + o.totalAmount, 0);
  const pickupFulfillmentRate = pickupOrders.length > 0 ? Math.round((completedPickupOrders.length / pickupOrders.length) * 100) : 100;

  const filteredOrders = todayOrders.filter(o => filterMode === "All" || o.paymentMethod === filterMode);

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDescription || !expAmount) return;

    const amt = parseFloat(expAmount);
    if (isNaN(amt) || amt <= 0) return;

    addExpense(expDescription, amt, expCategory);
    setExpDescription("");
    setExpAmount("");
    setIsLoggingExpense(false);
    showToast("✓ Store Expense Logged");
  };

  const handleQuickAmount = (val: number) => {
    setExpAmount(val.toString());
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-28 text-slate-900 dark:text-white transition-colors">
      
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-black text-xs z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toastMsg}
        </div>
      )}

      {/* Adaptive Page Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-orange to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-orange/20">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {language === "hi" ? "व्यापार और वित्तीय रिपोर्ट्स" : "Business & Financial Reports"}
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                P&L Live
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {language === "hi" ? "दुकान का मुनाफा, बिक्री का रुझान, नकद बनाम ऑनलाइन पेमेंट और डिजिटल पिकअप्स" : "Live store profitability, root-cause diagnosis, daily sales trends & pickup performance"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("deep-analysis")}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-orange/20 transition-all active:scale-98 cursor-pointer shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            <span>{language === "hi" ? "एआई दुकान ऑडिट" : "AI Store Audit"}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setIsLoggingExpense(true)}
            className="flex-1 sm:flex-initial bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4 text-brand-orange" />
            <span>{language === "hi" ? "+ खर्च दर्ज करें" : "Log Expense"}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigator - Touch friendly horizontal scroll */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-x-auto no-scrollbar w-full sm:w-fit">
        <button 
          onClick={() => setActiveTab("deep-analysis")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
            activeTab === "deep-analysis" 
              ? "bg-gradient-to-r from-brand-orange to-amber-500 text-white shadow-sm" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Full Store Data Analysis</span>
          <span className="text-[9px] bg-white/20 text-white font-extrabold px-1.5 py-0.2 rounded-full">AI</span>
        </button>

        <button 
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
            activeTab === "sales" 
              ? "bg-white dark:bg-slate-900 text-brand-orange shadow-sm" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Receipt className="h-3.5 w-3.5" />
          <span>POS Daily Ledger & P&L</span>
        </button>

        <button 
          onClick={() => setActiveTab("pickups")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
            activeTab === "pickups" 
              ? "bg-white dark:bg-slate-900 text-brand-orange shadow-sm" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Digital Pickups</span>
          {pickupOrders.length > 0 && (
            <span className="text-[9px] bg-brand-orange/15 text-brand-orange font-extrabold px-1.5 py-0.2 rounded-full">
              {pickupOrders.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "deep-analysis" && (
        <DeepDataAnalyzer onNavigateToScreen={setActiveScreen} />
      )}

      {activeTab === "sales" && (
        <div className="space-y-6">
          
          {/* Executive 4-Card Financial KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Card 1: Total Sales */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Gross Sales
                </span>
                <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums block">
                ₹{totalSales.toLocaleString("en-IN")}
              </span>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>{todayOrders.length} Bills</span>
                <span>Avg ₹{avgOrderValue}</span>
              </div>
            </div>

            {/* Card 2: Today's Expenses */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Store Expenses
                </span>
                <span className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <TrendingDown className="h-3.5 w-3.5" />
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums block">
                ₹{todayExpenses.toLocaleString("en-IN")}
              </span>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Outflow</span>
                <span className="text-slate-400 truncate max-w-[90px]">Operational</span>
              </div>
            </div>

            {/* Card 3: Net Profit */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-orange/5 rounded-bl-full pointer-events-none group-hover:bg-brand-orange/10 transition-colors" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Estimated Profit
                </span>
                <span className={`p-1.5 rounded-xl ${netProfit >= 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600"}`}>
                  <CircleDollarSign className="h-3.5 w-3.5" />
                </span>
              </div>
              <span className={`text-xl sm:text-2xl font-black tabular-nums block ${netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                ₹{netProfit.toLocaleString("en-IN")}
              </span>
              <div className="flex items-center justify-between text-[11px] font-semibold mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Net Margin</span>
                <span className={`font-black ${profitMarginPercent >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                  {profitMarginPercent}%
                </span>
              </div>
            </div>

            {/* Card 4: Gross Margin */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Gross Margin
                </span>
                <span className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Percent className="h-3.5 w-3.5" />
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums block">
                ₹{grossProfit.toLocaleString("en-IN")}
              </span>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Before Expense</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">
                  {totalSales > 0 ? Math.round((grossProfit / totalSales) * 100) : 0}%
                </span>
              </div>
            </div>

          </div>

          {/* Payment Split & Top Products Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Payment Distribution Strip */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-brand-orange" />
                    Payment Method Split
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Cash vs UPI Digital vs Khata Credit
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">Today</span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${cashPercent}%` }} className="bg-emerald-500 transition-all duration-500" title={`Cash: ${cashPercent}%`} />
                <div style={{ width: `${upiPercent}%` }} className="bg-sky-500 transition-all duration-500" title={`UPI: ${upiPercent}%`} />
                <div style={{ width: `${creditPercent}%` }} className="bg-amber-500 transition-all duration-500" title={`Credit: ${creditPercent}%`} />
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-center">
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Cash</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block mt-0.5">₹{cashSales.toLocaleString("en-IN")}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">{cashPercent}%</span>
                </div>
                <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-2.5 text-center">
                  <span className="text-[10px] font-black text-sky-700 dark:text-sky-400 uppercase tracking-wider block">UPI</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block mt-0.5">₹{upiSales.toLocaleString("en-IN")}</span>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold block">{upiPercent}%</span>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-2.5 text-center">
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Khata Udhaar</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block mt-0.5">₹{creditSales.toLocaleString("en-IN")}</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">{creditPercent}%</span>
                </div>
              </div>
            </div>

            {/* Top Selling Items Today */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Flame className="h-4 w-4 text-brand-orange animate-pulse" />
                    Top Performing Items Today
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Fastest movers and revenue drivers
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">{topSellingProducts.length} items</span>
              </div>

              {topSellingProducts.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  No sales logged today yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {topSellingProducts.map((prod, idx) => (
                    <div 
                      key={prod.name}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-6 h-6 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0 ${
                          idx === 0 
                            ? "bg-amber-500 text-white shadow-xs" 
                            : idx === 1 
                            ? "bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white truncate">
                          {prod.name}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-black text-slate-900 dark:text-white block">₹{prod.revenue.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">{prod.quantity} units sold</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Today's Transactions Log */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-brand-orange" />
                  Today's Completed Bills ({filteredOrders.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Instant receipt stream and transaction history
                </p>
              </div>

              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {["All", "Cash", "UPI", "Credit"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-colors cursor-pointer ${
                      filterMode === mode
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-10 text-slate-500 italic text-xs font-medium">
                No bills matching criteria for today.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {filteredOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center justify-between gap-3 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-brand-orange/10 text-brand-orange font-black flex items-center justify-center shrink-0 text-sm">
                        {order.customerName ? order.customerName.charAt(0).toUpperCase() : "C"}
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-slate-900 dark:text-white block truncate">
                          {order.customerName || "Walk-in Customer"}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                          {order.items.map(i => `${i.name} (x${i.quantity})`).join(", ")}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="font-black text-sm text-slate-900 dark:text-white block">
                        ₹{order.total.toLocaleString("en-IN")}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        order.paymentMethod === "Credit" 
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" 
                          : order.paymentMethod === "UPI"
                          ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

      {activeTab === "pickups" && (
        <div className="space-y-6">
          
          {/* Pickup Analytics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Today's Sales */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Today's Pickup Sales
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block tabular-nums">
                ₹{todayPickupSales.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                {todayPickupOrders.filter(o => o.orderStatus === "COMPLETED").length} Completed
              </span>
            </div>

            {/* Lifetime Completed */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Total Pickups Handled
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block tabular-nums">
                {completedPickupOrders.length}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                Total ₹{completedPickupRevenue.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Average Ticket Value */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Avg Pickup Ticket
              </span>
              <span className="text-xl sm:text-2xl font-black text-brand-orange mt-1 block tabular-nums">
                ₹{averagePickupValue}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                Per customer order
              </span>
            </div>

            {/* Fulfillment Success Rate */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Success Rate
              </span>
              <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block tabular-nums">
                {pickupFulfillmentRate}%
              </span>
              <span className="text-[11px] text-rose-500 mt-1 block font-medium">
                {cancelledPickupCount} Cancelled / Rejected
              </span>
            </div>

          </div>

          {/* Today's Pickup Order Log */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-brand-orange animate-pulse" />
                  Today's Digital Pickup Ledger ({todayPickupOrders.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Counter pickup verification and fulfillment state
                </p>
              </div>
            </div>

            {todayPickupOrders.length === 0 ? (
              <div className="text-center py-10 text-slate-500 italic text-xs font-medium">
                No pickup orders submitted today.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {todayPickupOrders.map((o) => (
                  <div 
                    key={o.id}
                    className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {o.customer?.name || "Guest Customer"}
                        </span>
                        {o.pickupCode && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                            #{o.pickupCode}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mt-0.5">
                        {o.items.map((i: any) => `${i.productName} (x${i.quantity})`).join(", ")}
                      </span>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="font-black text-sm text-slate-900 dark:text-white block">
                        ₹{o.totalAmount}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        o.orderStatus === "COMPLETED" 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                          : o.orderStatus === "CANCELLED" || o.orderStatus === "REJECTED" 
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                          : "bg-brand-orange/10 text-brand-orange border border-brand-orange/20"
                      }`}>
                        {o.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

      {/* Log Store Expense Modal with Quick Amount Preset Chips */}
      {isLoggingExpense && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 transition-colors">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">Log Store Expense</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Record outgoing operational expenditure and overhead costs</p>
              </div>
              <button 
                onClick={() => setIsLoggingExpense(false)} 
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Expense Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electricity bill, Chai for staff, Shop maintenance"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Amount Paid (₹) <span className="text-red-500">*</span>
                  </label>
                  {/* Quick Preset Amount Chips */}
                  <div className="flex items-center gap-1.5">
                    {[50, 100, 200, 500, 1000].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => handleQuickAmount(preset)}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-100 hover:bg-brand-orange/10 hover:text-brand-orange dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        ₹{preset}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-base font-black text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Expense Category
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors cursor-pointer"
                >
                  <option value="Tea/Snacks">Tea / Snacks</option>
                  <option value="Electricity">Electricity Bill</option>
                  <option value="Rent">Shop Rent</option>
                  <option value="Salary">Staff Salary</option>
                  <option value="Other">Other Expense</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLoggingExpense(false)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-black rounded-xl text-xs shadow-md shadow-brand-orange/20 transition-colors cursor-pointer"
                >
                  Save Store Expense
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
