import React, { useState, useEffect } from "react";
import { 
  Plus, 
  X, 
  Receipt, 
  CheckCircle2,
  ShoppingBag,
  BarChart3,
  Sparkles
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import { api } from "../config/api";
import { DeepDataAnalyzer } from "../components/DeepDataAnalyzer";

interface ReportsProps {
  setActiveScreen: (screen: any) => void;
}

export const Reports: React.FC<ReportsProps> = ({ setActiveScreen }) => {
  const { orders, products, expenses, addExpense } = useBusiness();
  const [filterMode, setFilterMode] = useState<"All" | "Cash" | "UPI" | "Credit">("All");

  const [pickupOrders, setPickupOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"sales" | "pickups" | "deep-analysis">("deep-analysis");

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

  // Pickup Analytics Calculations
  const todayPickupOrders = pickupOrders.filter(o => o.createdAt.startsWith(today));
  const completedPickupOrders = pickupOrders.filter(o => o.orderStatus === "COMPLETED");
  const completedPickupRevenue = completedPickupOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const averagePickupValue = completedPickupOrders.length > 0 ? Math.round(completedPickupRevenue / completedPickupOrders.length) : 0;
  const cancelledPickupCount = pickupOrders.filter(o => o.orderStatus === "CANCELLED" || o.orderStatus === "REJECTED").length;
  const todayPickupSales = todayPickupOrders.filter(o => o.orderStatus === "COMPLETED").reduce((sum, o) => sum + o.totalAmount, 0);

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 pb-28 text-slate-900 dark:text-white">
      
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-black text-xs z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toastMsg}
        </div>
      )}

      {/* Standard Adaptive Page Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Financial Reports & Business Analytics
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                P&L Active
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Deep data analysis, sales drop diagnostics, profit & loss analysis, and digital pickups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("deep-analysis")}
            className="bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-orange/20 transition-all active:scale-98 cursor-pointer shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            Analyze My Data
          </button>
          
          <button
            type="button"
            onClick={() => setIsLoggingExpense(true)}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            Log Expense
          </button>
        </div>
      </div>

      {/* Tab Navigator */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 w-fit flex-wrap">
        <button 
          onClick={() => setActiveTab("deep-analysis")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "deep-analysis" 
              ? "bg-gradient-to-r from-brand-orange to-amber-500 text-white shadow-xs scale-[1.01]" 
              : "text-brand-orange hover:text-brand-orange-hover"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Full Store Data Analysis (AI Audit)</span>
        </button>

        <button 
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "sales" 
              ? "bg-white dark:bg-slate-900 text-brand-orange shadow-xs scale-[1.01]" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          POS Billing Analytics
        </button>

        <button 
          onClick={() => setActiveTab("pickups")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "pickups" 
              ? "bg-white dark:bg-slate-900 text-brand-orange shadow-xs scale-[1.01]" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Pickup Order Analytics
        </button>
      </div>

      {activeTab === "deep-analysis" && (
        <DeepDataAnalyzer onNavigateToScreen={setActiveScreen} />
      )}

      {activeTab === "sales" && (
        <>
          {/* 3 Plain Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Card 1: Today Sales */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Total Sales Today</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block tabular-nums">₹{totalSales.toLocaleString("en-IN")}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">{todayOrders.length} completed transactions</span>
            </div>

            {/* Card 2: Today Expenses */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Today's Store Expenses</span>
              <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block tabular-nums">₹{todayExpenses.toLocaleString("en-IN")}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">Chai, electricity, & shop costs</span>
            </div>

            {/* Card 3: Estimated Net Profit */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Estimated Net Profit</span>
              <span className={`text-xl sm:text-2xl font-black mt-1 block tabular-nums ${netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                ₹{netProfit.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">Sales minus item cost & expenses</span>
            </div>

          </div>

          {/* Plain Text Summary Line */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-2xl text-xs font-bold text-emerald-900 dark:text-emerald-200">
            💡 You completed {todayOrders.length} bills today totaling ₹{totalSales.toLocaleString("en-IN")}.
          </div>

          {/* Today's Transactions Log */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Receipt className="h-5 w-5 text-brand-orange" />
                Today's Bills ({filteredOrders.length})
              </h3>

              <div className="flex gap-1.5 overflow-x-auto">
                {["All", "Cash", "UPI", "Credit"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-colors cursor-pointer ${
                      filterMode === mode
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 italic text-xs font-medium">
                No bills matching criteria for today.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {filteredOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white block">{order.customerName}</span>
                      <span className="text-[10px] font-bold text-slate-400 block">{order.items.map(i => `${i.name} (${i.quantity})`).join(", ")}</span>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="font-black text-sm text-slate-900 dark:text-white block">₹{order.total}</span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        order.paymentMethod === "Credit" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      }`}>
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </>
      )}

      {activeTab === "pickups" && (
        <>
          {/* Pickup Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            {/* Today's Sales */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Pickup Revenue (Today)</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block tabular-nums">₹{todayPickupSales.toLocaleString("en-IN")}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">{todayPickupOrders.filter(o => o.orderStatus === "COMPLETED").length} pickups completed</span>
            </div>

            {/* Total Completed */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Lifetime Completed</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block tabular-nums">{completedPickupOrders.length}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">Total: ₹{completedPickupRevenue.toLocaleString("en-IN")}</span>
            </div>

            {/* Average Ticket Value */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Avg Pickup Value</span>
              <span className="text-xl sm:text-2xl font-black text-brand-orange mt-1 block tabular-nums">₹{averagePickupValue}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">Per completed customer pickup</span>
            </div>

            {/* Cancelled Orders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Cancelled / Rejected</span>
              <span className="text-xl sm:text-2xl font-black text-rose-600 mt-1 block tabular-nums">{cancelledPickupCount}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">Stock rolled back successfully</span>
            </div>

          </div>

          {/* Today's Pickup Order Log */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-brand-orange animate-pulse" />
                Today's Pickup Orders Ledger ({todayPickupOrders.length})
              </h3>
            </div>

            {todayPickupOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 italic text-xs font-medium">
                No pickup orders submitted today.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {todayPickupOrders.map((o) => (
                  <div 
                    key={o.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white block">{o.customer?.name || "Guest Customer"}</span>
                      <span className="text-[10px] font-bold text-slate-400 block">{o.items.map((i: any) => `${i.productName} (x${i.quantity})`).join(", ")}</span>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="font-black text-sm text-slate-900 dark:text-white block">₹{o.totalAmount}</span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        o.orderStatus === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : o.orderStatus === "CANCELLED" || o.orderStatus === "REJECTED" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-brand-orange/10 text-brand-orange border border-brand-orange/20"
                      }`}>
                        {o.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </>
      )}

      {/* Log Store Expense Modal */}
      {isLoggingExpense && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">Log Store Expense</h3>
              <button onClick={() => setIsLoggingExpense(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Electricity bill or Chai for staff"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold"
                >
                  <option value="Tea/Snacks">Tea / Snacks</option>
                  <option value="Electricity">Electricity Bill</option>
                  <option value="Rent">Shop Rent</option>
                  <option value="Salary">Staff Salary</option>
                  <option value="Other">Other Expense</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsLoggingExpense(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-white font-black py-3 rounded-xl text-xs shadow-md transition-colors"
                >
                  Save Expense
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
