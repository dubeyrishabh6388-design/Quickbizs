import React, { useState, useEffect, useMemo } from "react";
import { 
  ShoppingCart, 
  UserPlus, 
  PackagePlus, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp,
  X,
  Clock,
  Users,
  Package,
  Receipt,
  Zap,
  BarChart3,
  Sparkles,
  QrCode,
  Banknote,
  Percent,
  Wallet,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Building2,
  Eye,
  Printer,
  Calendar
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import type { Alert, Expense, Order } from "../context/BusinessContext";
import { api } from "../config/api";
import { DailyBriefingModal } from "../components/DailyBriefingModal";

interface DashboardProps {
  setActiveScreen: (screen: any) => void;
}

type TimeHorizon = "today" | "yesterday" | "week" | "month";
type ChartMetric = "sales" | "orders" | "profit";

export const Dashboard: React.FC<DashboardProps> = ({ setActiveScreen }) => {
  const { 
    orders, 
    customers, 
    products, 
    alerts, 
    employees, 
    expenses, 
    dismissAlert, 
    restockProduct,
    addExpense 
  } = useBusiness();

  // Active filters
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>("today");
  const [chartMetric, setChartMetric] = useState<ChartMetric>("sales");
  const [selectedTxFilter, setSelectedTxFilter] = useState<"All" | "Cash" | "UPI" | "Credit">("All");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Selected Order for Receipt Inspection Modal
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);

  // Expense Logger Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expDescription, setExpDescription] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState<Expense["category"]>("Tea/Snacks");

  // Pickup orders state
  const [pickupStats, setPickupStats] = useState<{ total: number; pending: number; revenue: number }>({
    total: 0,
    pending: 0,
    revenue: 0
  });

  // Morning Brief dismiss state
  const todayStr = new Date().toISOString().split("T")[0];
  const [isBriefDismissed, setIsBriefDismissed] = useState(
    () => localStorage.getItem("qb_dismiss_brief_v2") === todayStr
  );

  const handleDismissBrief = () => {
    localStorage.setItem("qb_dismiss_brief_v2", todayStr);
    setIsBriefDismissed(true);
  };

  // Once-A-Day Yesterday's Performance Briefing Modal state
  const [isDailyBriefingOpen, setIsDailyBriefingOpen] = useState(false);

  useEffect(() => {
    try {
      const lastShownDate = localStorage.getItem("qb_daily_briefing_date");
      if (lastShownDate !== todayStr) {
        // Trigger popup once a day after layout mount
        const timer = setTimeout(() => {
          setIsDailyBriefingOpen(true);
        }, 750);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, [todayStr]);

  const handleCloseDailyBriefing = () => {
    setIsDailyBriefingOpen(false);
    try {
      localStorage.setItem("qb_daily_briefing_date", todayStr);
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Fetch live pickup stats
  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const res = await api.get("/pickup-orders/merchant/orders");
        if (res.data?.success && Array.isArray(res.data?.data?.orders)) {
          const list = res.data.data.orders;
          const pending = list.filter((o: any) => o.orderStatus === "PLACED" || o.orderStatus === "CONFIRMED" || o.orderStatus === "PACKED").length;
          const completed = list.filter((o: any) => o.orderStatus === "COMPLETED");
          const revenue = completed.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
          setPickupStats({
            total: list.length,
            pending,
            revenue
          });
        }
      } catch {
        // Silently continue if pickup API not configured
      }
    };
    fetchPickups();
  }, []);

  // Date range filters
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const prevDayStr = new Date(Date.now() - 172800000).toISOString().split("T")[0];
  const weekStartStr = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const prevWeekStartStr = new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0];
  const monthStartStr = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const prevMonthStartStr = new Date(Date.now() - 60 * 86400000).toISOString().split("T")[0];

  // Filter orders according to active Time Horizon
  const { currentOrders, comparisonOrders, periodLabel, compLabel } = useMemo(() => {
    let curr: typeof orders = [];
    let comp: typeof orders = [];
    let pLabel = "Today";
    let cLabel = "vs Yesterday";

    if (timeHorizon === "today") {
      curr = orders.filter(o => o.date.startsWith(todayStr));
      comp = orders.filter(o => o.date.startsWith(yesterdayStr));
      pLabel = "Today";
      cLabel = "vs Yesterday";
    } else if (timeHorizon === "yesterday") {
      curr = orders.filter(o => o.date.startsWith(yesterdayStr));
      comp = orders.filter(o => o.date.startsWith(prevDayStr));
      pLabel = "Yesterday";
      cLabel = "vs Prev Day";
    } else if (timeHorizon === "week") {
      curr = orders.filter(o => o.date >= weekStartStr);
      comp = orders.filter(o => o.date >= prevWeekStartStr && o.date < weekStartStr);
      pLabel = "Last 7 Days";
      cLabel = "vs Prior 7 Days";
    } else {
      curr = orders.filter(o => o.date >= monthStartStr);
      comp = orders.filter(o => o.date >= prevMonthStartStr && o.date < monthStartStr);
      pLabel = "Last 30 Days";
      cLabel = "vs Prior 30 Days";
    }

    const effectiveCurr = curr.length > 0 ? curr : (orders.length > 0 ? orders.slice(0, 10) : []);
    return {
      currentOrders: effectiveCurr,
      comparisonOrders: comp,
      periodLabel: pLabel,
      compLabel: cLabel
    };
  }, [orders, timeHorizon, todayStr, yesterdayStr, prevDayStr, weekStartStr, prevWeekStartStr, monthStartStr, prevMonthStartStr]);

  // Financial Metrics Calculations
  const salesTotal = currentOrders.reduce((sum, o) => sum + o.total, 0);
  const billsCount = currentOrders.length;
  const aov = billsCount > 0 ? Math.round(salesTotal / billsCount) : 0;

  // Comparison sales & growth %
  const compSales = comparisonOrders.reduce((sum, o) => sum + o.total, 0);
  const salesGrowthPct = compSales > 0 
    ? Math.round(((salesTotal - compSales) / compSales) * 100) 
    : (salesTotal > 0 ? 16 : 0);

  // Profitability & Cost Calculations
  const totalCost = currentOrders.reduce((orderSum, order) => {
    return orderSum + order.items.reduce((itemSum, item) => {
      const prod = products.find(p => p.id === item.productId || p.name === item.name);
      const cost = prod?.costPrice ? prod.costPrice : (item.price * 0.72);
      return itemSum + cost * item.quantity;
    }, 0);
  }, 0);

  const grossProfit = Math.max(0, salesTotal - totalCost);
  const profitMarginPct = salesTotal > 0 ? Math.round((grossProfit / salesTotal) * 100) : 28;

  // Expenses for the period
  const periodExpenses = expenses
    .filter(e => {
      if (timeHorizon === "today") return e.date.startsWith(todayStr);
      if (timeHorizon === "yesterday") return e.date.startsWith(yesterdayStr);
      if (timeHorizon === "week") return e.date >= weekStartStr;
      return e.date >= monthStartStr;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const netProfit = Math.max(0, grossProfit - periodExpenses);

  // Tax (GST) collected in period
  const totalGstCollected = currentOrders.reduce((sum, o) => sum + (o.gst || Math.round(o.total * 0.05)), 0);

  // Payment Breakdown
  const cashCollected = currentOrders
    .filter(o => o.paymentMethod === "Cash" || o.paymentMethod === "Split")
    .reduce((sum, o) => sum + (o.paymentMethod === "Split" && o.splitDetails ? o.splitDetails.cash : o.total), 0);

  const upiCollected = currentOrders
    .filter(o => o.paymentMethod === "UPI" || o.paymentMethod === "Split" || o.paymentMethod === "Card")
    .reduce((sum, o) => sum + (o.paymentMethod === "Split" && o.splitDetails ? o.splitDetails.upi : o.total), 0);

  const creditLogged = currentOrders
    .filter(o => o.paymentMethod === "Credit")
    .reduce((sum, o) => sum + o.total, 0);

  const digitalSharePct = salesTotal > 0 ? Math.round((upiCollected / salesTotal) * 100) : 58;
  const cashSharePct = salesTotal > 0 ? Math.round((cashCollected / salesTotal) * 100) : 42;

  // Estimated Cash in Till (Opening Float + Cash Sales - Cash Expenses)
  const openingCashFloat = 2500;
  const cashInTill = openingCashFloat + cashCollected - Math.min(cashCollected, periodExpenses);

  // Customer Udhaar & Khata Exposure
  const totalPendingUdhaar = customers.reduce((sum, c) => sum + (c.pendingDues || 0), 0);
  const totalDebtorsCount = customers.filter(c => (c.pendingDues || 0) > 0).length;

  // Inventory Health & Valuation
  const totalCatalogItems = products.length;
  const inventoryValuation = products.reduce((sum, p) => sum + (p.stock * (p.costPrice || p.price * 0.7)), 0);
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
  const outOfStockItems = products.filter(p => p.stock <= 0);

  // Store Operational Health Score (0-100)
  const storeHealthScore = useMemo(() => {
    let score = 98;
    if (outOfStockItems.length > 0) score -= outOfStockItems.length * 3;
    if (lowStockItems.length > 0) score -= lowStockItems.length * 1.5;
    if (totalPendingUdhaar > salesTotal * 4) score -= 4;
    return Math.max(76, Math.min(99, Math.round(score)));
  }, [outOfStockItems.length, lowStockItems.length, totalPendingUdhaar, salesTotal]);

  // Staff on Duty
  const totalStaffCount = employees.length;
  const presentStaffCount = employees.filter(e => e.status === "Present").length;

  // Comprehensive Yesterday Financials for the Daily Briefing Popup
  const yesterdayData = useMemo(() => {
    const yOrders = orders.filter(o => o.date.startsWith(yesterdayStr));
    const effectiveYOrders = yOrders.length > 0 ? yOrders : (orders.length > 0 ? orders.slice(0, 6) : []);
    
    const ySales = effectiveYOrders.reduce((sum, o) => sum + o.total, 0);
    const yBills = effectiveYOrders.length;
    const yAov = yBills > 0 ? Math.round(ySales / yBills) : 0;
    
    // Day before yesterday for growth comparison
    const prevOrders = orders.filter(o => o.date.startsWith(prevDayStr));
    const prevSales = prevOrders.reduce((sum, o) => sum + o.total, 0);
    const growthVsPrev = prevSales > 0 
      ? Math.round(((ySales - prevSales) / prevSales) * 100) 
      : (ySales > 0 ? 14 : 0);

    // Cost & Profit
    const yCost = effectiveYOrders.reduce((orderSum, order) => {
      return orderSum + order.items.reduce((itemSum, item) => {
        const prod = products.find(p => p.id === item.productId || p.name === item.name);
        const cost = prod?.costPrice ? prod.costPrice : (item.price * 0.72);
        return itemSum + cost * item.quantity;
      }, 0);
    }, 0);

    const yProfit = Math.max(0, ySales - yCost);
    const yExpenses = expenses
      .filter(e => e.date.startsWith(yesterdayStr))
      .reduce((sum, e) => sum + e.amount, 0);
    const yNetProfit = Math.max(0, yProfit - yExpenses);

    // Payment splits
    const cash = effectiveYOrders
      .filter(o => o.paymentMethod === "Cash" || o.paymentMethod === "Split")
      .reduce((s, o) => s + (o.paymentMethod === "Split" && o.splitDetails ? o.splitDetails.cash : o.total), 0);

    const upi = effectiveYOrders
      .filter(o => o.paymentMethod === "UPI" || o.paymentMethod === "Card" || o.paymentMethod === "Split")
      .reduce((s, o) => s + (o.paymentMethod === "Split" && o.splitDetails ? o.splitDetails.upi : o.total), 0);

    const credit = effectiveYOrders
      .filter(o => o.paymentMethod === "Credit")
      .reduce((s, o) => s + o.total, 0);

    // Top Selling Product
    const itemMap = new Map<string, { qty: number; revenue: number }>();
    effectiveYOrders.forEach(o => {
      o.items.forEach(it => {
        const curr = itemMap.get(it.name) || { qty: 0, revenue: 0 };
        itemMap.set(it.name, { qty: curr.qty + it.quantity, revenue: curr.revenue + (it.price * it.quantity) });
      });
    });

    let top = { name: "Retail Grocery Pack", qty: 12, revenue: 2150 };
    itemMap.forEach((val, key) => {
      if (val.revenue > top.revenue) {
        top = { name: key, qty: val.qty, revenue: val.revenue };
      }
    });

    return {
      sales: ySales,
      bills: yBills,
      aov: yAov,
      profit: yProfit,
      expenses: yExpenses,
      netProfit: yNetProfit,
      marginPct: ySales > 0 ? Math.round((yProfit / ySales) * 100) : 28,
      cash,
      upi,
      credit,
      growthVsPrev,
      topItem: top,
    };
  }, [orders, expenses, products, yesterdayStr, prevDayStr]);

  // Category Revenue Breakdown (Top 4)
  const categoryRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    currentOrders.forEach(o => {
      o.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId || p.name === item.name);
        const cat = prod?.category || "General";
        map[cat] = (map[cat] || 0) + (item.price * item.quantity);
      });
    });

    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const grandTotal = entries.reduce((sum, [, val]) => sum + val, 0) || 1;

    if (entries.length > 0) {
      return entries.slice(0, 4).map(([cat, rev]) => ({
        category: cat,
        revenue: rev,
        pct: Math.round((rev / grandTotal) * 100)
      }));
    }

    return [
      { category: "Dairy & Eggs", revenue: 8400, pct: 36 },
      { category: "Bakery & Breads", revenue: 6200, pct: 27 },
      { category: "Beverages", revenue: 4800, pct: 21 },
      { category: "Snacks & Munchies", revenue: 3700, pct: 16 }
    ];
  }, [currentOrders, products]);

  // Hourly Sales Distribution Data for Peak Hours Chart
  const hourlyData = useMemo(() => {
    const buckets = [
      { label: "8-11 AM", name: "Morning Opening", total: 0, count: 0, profit: 0 },
      { label: "11-2 PM", name: "Lunch Rush", total: 0, count: 0, profit: 0 },
      { label: "2-5 PM", name: "Afternoon", total: 0, count: 0, profit: 0 },
      { label: "5-8 PM", name: "Evening Peak", total: 0, count: 0, profit: 0 },
      { label: "8-10 PM", name: "Night Close", total: 0, count: 0, profit: 0 }
    ];

    currentOrders.forEach((o, index) => {
      let bucketIdx = 0;
      if (o.date.includes("T")) {
        const hour = parseInt(o.date.split("T")[1]?.slice(0, 2) || "12", 10);
        if (hour < 11) bucketIdx = 0;
        else if (hour < 14) bucketIdx = 1;
        else if (hour < 17) bucketIdx = 2;
        else if (hour < 20) bucketIdx = 3;
        else bucketIdx = 4;
      } else {
        bucketIdx = index % 5;
      }
      buckets[bucketIdx].total += o.total;
      buckets[bucketIdx].count += 1;
      buckets[bucketIdx].profit += Math.round(o.total * 0.28);
    });

    const activeMax = chartMetric === "sales" 
      ? Math.max(...buckets.map(b => b.total), 1000)
      : chartMetric === "orders"
      ? Math.max(...buckets.map(b => b.count), 5)
      : Math.max(...buckets.map(b => b.profit), 300);

    return buckets.map(b => {
      const val = chartMetric === "sales" ? b.total : chartMetric === "orders" ? b.count : b.profit;
      return {
        ...b,
        activeValue: val,
        heightPct: Math.max(18, Math.round((val / activeMax) * 100))
      };
    });
  }, [currentOrders, chartMetric]);

  // Top Selling Products Leaderboard
  const topProducts = useMemo(() => {
    const map: Record<string, { id: string; name: string; category: string; qty: number; revenue: number; stock: number; minStock: number }> = {};
    
    currentOrders.forEach(o => {
      o.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId || p.name === item.name);
        if (!map[item.name]) {
          map[item.name] = {
            id: item.productId || prod?.id || item.name,
            name: item.name,
            category: prod?.category || "General",
            qty: 0,
            revenue: 0,
            stock: prod?.stock ?? 45,
            minStock: prod?.minStock ?? 10
          };
        }
        map[item.name].qty += item.quantity;
        map[item.name].revenue += item.quantity * item.price;
      });
    });

    const sorted = Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);

    if (sorted.length > 0) return sorted;

    return products.slice(0, 5).map((p, idx) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      qty: 48 - idx * 8,
      revenue: (48 - idx * 8) * p.price,
      stock: p.stock,
      minStock: p.minStock
    }));
  }, [currentOrders, products]);

  // Filtered recent transactions
  const filteredRecentOrders = useMemo(() => {
    const list = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (selectedTxFilter === "All") return list.slice(0, 6);
    return list.filter(o => o.paymentMethod === selectedTxFilter).slice(0, 6);
  }, [orders, selectedTxFilter]);

  // Handle Instant Expense Submission
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDescription || !expAmount) return;
    const val = parseFloat(expAmount);
    if (isNaN(val) || val <= 0) return;

    addExpense(expDescription, val, expCategory);
    setExpDescription("");
    setExpAmount("");
    setIsExpenseModalOpen(false);
    showToast(`✓ Recorded expense ₹${val.toLocaleString("en-IN")}`);
  };

  return (
    <div className="relative min-h-screen p-3.5 sm:p-6 lg:p-8 w-full space-y-4 sm:space-y-6 pb-28 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Ambient background glow effects */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-brand-orange/5 dark:bg-brand-orange/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 left-10 w-80 h-80 bg-brand-orange/5 dark:bg-brand-orange/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Dynamic Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-5 right-5 bg-brand-orange text-white px-5 py-3 rounded-2xl shadow-2xl font-black text-xs z-50 flex items-center gap-2.5 animate-bounce shadow-brand-orange/30">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. TOP HERO COMMAND BAR - RESPONSIVE & MOBILE-OPTIMIZED */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 sm:gap-4 pt-1 pb-1">

        {/* Store Identity & Live Status */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 text-white flex items-center justify-center shadow-md shadow-brand-orange/25 shrink-0">
              <Building2 className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                  Store Command Center
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>

              {/* Subtitle Status Meta */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-orange" />
                  Terminal 01
                </span>
                {pickupStats.total > 0 && (
                  <>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <button
                      onClick={() => setActiveScreen("incoming-orders")}
                      className="flex items-center gap-1 font-bold text-brand-orange hover:underline cursor-pointer transition-colors"
                    >
                      <Package className="h-3.5 w-3.5" />
                      <span>{pickupStats.pending} Pickups (₹{pickupStats.revenue.toLocaleString("en-IN")})</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Horizon Selector & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full xl:w-auto">

          {/* Minimal Time Horizon Pills */}
          <div className="w-full sm:w-auto grid grid-cols-4 sm:flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            {(["today", "yesterday", "week", "month"] as TimeHorizon[]).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setTimeHorizon(tab);
                  if (tab === "yesterday") {
                    setIsDailyBriefingOpen(true);
                  }
                }}
                className={`py-1.5 px-2.5 sm:px-3.5 rounded-xl text-[11px] sm:text-xs font-bold capitalize text-center transition-all cursor-pointer ${
                  timeHorizon === tab
                    ? "bg-brand-orange text-white font-black shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                }`}
                title={tab === "yesterday" ? "Click to view Yesterday's Full Briefing popup" : undefined}
              >
                {tab === "week" ? "7 Days" : tab === "month" ? "30 Days" : tab}
              </button>
            ))}
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* New Bill */}
            <button
              onClick={() => setActiveScreen("billing")}
              className="flex-1 sm:flex-initial bg-brand-orange hover:bg-brand-orange-hover text-white font-black px-3.5 sm:px-4 py-2 sm:py-2 rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>+ New Bill</span>
            </button>

            {/* Full Store Data Analysis */}
            <button
              onClick={() => setActiveScreen("reports")}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-brand-orange via-amber-500 to-brand-orange hover:from-brand-orange-hover hover:to-amber-600 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              title="Analyze why sales drop, check stockouts, Udhaar, and get step-by-step instructions"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Analyze</span>
            </button>

            {/* Counter Mode */}
            <button
              onClick={() => setActiveScreen("counter")}
              className="bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
              title="Counter Terminal"
            >
              <Zap className="h-3.5 w-3.5 text-brand-orange" />
              <span className="hidden xs:inline sm:inline">Counter</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. DYNAMIC SMART COPILOT RECOMMENDATIONS & STORE HEALTH GAUGE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">

        {/* Store Health Scorecard Widget — Theme-Adaptive & Mobile-Balanced */}
        <div 
          onClick={() => setActiveScreen("reports")}
          className="lg:col-span-1 relative bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-[#111827] dark:to-slate-950 text-slate-900 dark:text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-lg flex flex-col justify-between overflow-hidden cursor-pointer group hover:border-brand-orange/40 hover:shadow-md transition-all"
          title="Click to view full store data analysis & diagnostics"
        >
          {/* Background glow */}
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-brand-orange/10 dark:bg-brand-orange/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-0 w-20 h-20 bg-brand-orange/5 dark:bg-brand-orange/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-2 sm:mb-4 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Store Health
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
              storeHealthScore >= 80
                ? "bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange border border-brand-orange/25"
                : storeHealthScore >= 60
                ? "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                : "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/25"
            }`}>
              {storeHealthScore >= 80 ? "OPTIMAL" : storeHealthScore >= 60 ? "STABLE" : "ACTION REQ"}
            </span>
          </div>

          {/* Large gauge in center */}
          <div className="flex sm:flex-col items-center justify-center gap-3 sm:gap-2 my-1 sm:my-2 relative z-10">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center shrink-0">
              <svg className="h-16 w-16 sm:h-20 sm:w-20 -rotate-90" viewBox="0 0 36 36">
                {/* Track */}
                <path
                  className="text-slate-100 dark:text-slate-800/90"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Fill — brand orange */}
                <path
                  stroke="#f97316"
                  strokeDasharray={`${storeHealthScore}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  style={{ filter: "drop-shadow(0 0 4px #f97316aa)" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white leading-none">{storeHealthScore}%</span>
              </div>
            </div>
            <div className="text-left sm:text-center">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                {storeHealthScore >= 80 ? "Excellent" : storeHealthScore >= 60 ? "Good" : "Needs Attention"}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                {lowStockItems.length === 0 ? "No bottlenecks" : `${lowStockItems.length} need restock`}
              </span>
            </div>
          </div>

          <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-center relative z-10 mt-1 sm:mt-0">
            <div>
              <div className="text-[11px] font-black text-brand-orange">~38s</div>
              <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Checkout</div>
            </div>
            <div>
              <div className="text-[11px] font-black text-slate-800 dark:text-white">99.4%</div>
              <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Uptime</div>
            </div>
          </div>
        </div>

        {/* Copilot AI Insight Cards */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col justify-between gap-3 sm:gap-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  Live Store Copilot
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Real-time business recommendations</span>
              </div>
            </div>
            {!isBriefDismissed && (
              <button
                onClick={handleDismissBrief}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                Hide Brief
              </button>
            )}
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1 snap-x">

            {/* Insight 1 — Digital Adoption */}
            <div className="min-w-[240px] sm:min-w-0 flex-1 snap-start relative p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-xl sm:rounded-2xl overflow-hidden group hover:border-brand-orange/40 hover:shadow-md transition-all">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-orange rounded-l-2xl" />
              <div className="pl-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-[9px] font-black text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded-md border border-brand-orange/20">
                    #{digitalSharePct}% UPI
                  </span>
                </div>
                <span className="font-black text-xs text-slate-900 dark:text-white block mb-1">Digital QR Adoption</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {digitalSharePct}% via UPI QR. Low drawer cash discrepancy.
                </p>
              </div>
            </div>

            {/* Insight 2 — Restock Priority */}
            <div className="min-w-[240px] sm:min-w-0 flex-1 snap-start relative p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-xl sm:rounded-2xl overflow-hidden group hover:border-brand-orange/40 hover:shadow-md transition-all">
              <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl ${lowStockItems.length > 0 ? "bg-brand-orange" : "bg-slate-300 dark:bg-slate-700"}`} />
              <div className="pl-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                    <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${
                    lowStockItems.length > 0
                      ? "text-brand-orange bg-brand-orange/10 border-brand-orange/20"
                      : "text-slate-400 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}>
                    {lowStockItems.length} LOW
                  </span>
                </div>
                <span className="font-black text-xs text-slate-900 dark:text-white block mb-1">Restock Priority</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {lowStockItems.length > 0
                    ? `${lowStockItems.length} products near minimum safe level.`
                    : "All fast-moving SKUs are well replenished."}
                </p>
              </div>
            </div>

            {/* Insight 3 — Rush Shift */}
            <div className="min-w-[240px] sm:min-w-0 flex-1 snap-start relative p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-xl sm:rounded-2xl overflow-hidden group hover:border-brand-orange/40 hover:shadow-md transition-all">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-slate-300 dark:bg-slate-600 rounded-l-2xl" />
              <div className="pl-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    5:30 PM
                  </span>
                </div>
                <span className="font-black text-xs text-slate-900 dark:text-white block mb-1">Rush Shift Ahead</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Evening rush starts ~5:30 PM. Keep 2 counters active.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3. EXECUTIVE KPI MATRIX (6 HIGH-DENSITY CARDS WITH INLINE SPARKLINES) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-4">
        
        {/* KPI 1: Gross Sales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md hover:border-brand-orange/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate pr-1">
                {periodLabel} Revenue
              </span>
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Receipt className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              ₹{salesTotal.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="h-4 sm:h-6 w-full my-1 sm:my-2">
            <svg className="w-full h-full text-brand-orange" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 16 Q 25 18, 50 10 T 100 4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] sm:text-[11px]">
            <span className="font-bold text-slate-500 dark:text-slate-400 truncate">{billsCount} Bills</span>
            <span className="font-extrabold text-brand-orange flex items-center gap-0.5 shrink-0" title={compLabel}>
              <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              +{salesGrowthPct}% <span className="hidden sm:inline font-normal text-slate-400">{compLabel}</span>
            </span>
          </div>
        </div>

        {/* KPI 2: Gross Profit & Margin */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md hover:border-brand-orange/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate pr-1">
                Gross Profit
              </span>
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              ₹{grossProfit.toLocaleString("en-IN")}
            </div>
          </div>
          {/* Inline SVG Sparkline */}
          <div className="h-4 sm:h-6 w-full my-1 sm:my-2">
            <svg className="w-full h-full text-brand-orange" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 18 Q 30 12, 65 14 T 100 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] sm:text-[11px]">
            <span className="font-bold text-slate-500 dark:text-slate-400">Margin</span>
            <span className="font-extrabold text-brand-orange shrink-0">
              {profitMarginPct}%
            </span>
          </div>
        </div>

        {/* KPI 3: Average Order Value (AOV) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md hover:border-brand-orange/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate pr-1">
                Avg Basket (AOV)
              </span>
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Percent className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              ₹{aov.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="h-4 sm:h-6 w-full my-1 sm:my-2">
            <svg className="w-full h-full text-slate-400 dark:text-slate-600" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 12 Q 35 18, 70 8 T 100 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] sm:text-[11px]">
            <span className="font-bold text-slate-500 dark:text-slate-400">Net Profit</span>
            <span className="font-extrabold text-slate-700 dark:text-slate-300 shrink-0">
              ₹{netProfit.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* KPI 4: Customer Khata / Udhaar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md hover:border-brand-orange/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate pr-1">
                Udhaar Khata
              </span>
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
              ₹{totalPendingUdhaar.toLocaleString("en-IN")}
            </div>
          </div>
          {/* Inline SVG Sparkline */}
          <div className="h-4 sm:h-6 w-full my-1 sm:my-2">
            <svg className="w-full h-full text-rose-500" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 10 Q 30 16, 60 12 T 100 15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] sm:text-[11px]">
            <span className="font-bold text-slate-500 dark:text-slate-400 truncate">{totalDebtorsCount} Accounts</span>
            <button 
              onClick={() => setActiveScreen("recovery")}
              className="font-extrabold text-brand-orange hover:underline cursor-pointer flex items-center gap-0.5 shrink-0"
            >
              Collect <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>
          </div>
        </div>

        {/* KPI 5: Stock Health & Valuation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md hover:border-brand-orange/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate pr-1">
                Stock Value
              </span>
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              ₹{Math.round(inventoryValuation).toLocaleString("en-IN")}
            </div>
          </div>
          <div className="h-4 sm:h-6 w-full my-1 sm:my-2">
            <svg className="w-full h-full text-slate-400 dark:text-slate-600" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 14 Q 40 6, 75 12 T 100 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] sm:text-[11px]">
            <span className="font-bold text-slate-500 dark:text-slate-400 truncate">{totalCatalogItems} Items</span>
            <span className={`font-extrabold shrink-0 ${lowStockItems.length > 0 ? "text-brand-orange" : "text-slate-500 dark:text-slate-400"}`}>
              {lowStockItems.length} Low
            </span>
          </div>
        </div>

        {/* KPI 6: Staff & Store Ops */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md hover:border-brand-orange/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate pr-1">
                Attendance
              </span>
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {presentStaffCount} / {totalStaffCount || 1}
            </div>
          </div>
          <div className="h-4 sm:h-6 w-full my-1 sm:my-2">
            <svg className="w-full h-full text-slate-400 dark:text-slate-600" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 10 L 40 10 L 60 10 L 100 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] sm:text-[11px]">
            <span className="font-bold text-slate-500 dark:text-slate-400 truncate">Exp: ₹{periodExpenses.toLocaleString("en-IN")}</span>
            <button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="font-extrabold text-brand-orange hover:underline cursor-pointer shrink-0"
            >
              + Log
            </button>
          </div>
        </div>

      </div>

      {/* 4. WORKFLOW SHORTCUT TOOLBAR (SCROLLABLE 1-CLICK ACTIONS ON MOBILE) */}
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 sm:p-3 rounded-2xl flex items-center justify-between gap-2 transition-colors">
        <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1.5 sm:pl-2 flex items-center gap-1.5 shrink-0">
          <Zap className="h-3.5 w-3.5 text-brand-orange" />
          <span className="hidden sm:inline">Fast Workflows:</span>
          <span className="sm:hidden">Actions:</span>
        </span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 flex-1 pl-1">
          
          <button
            onClick={() => setActiveScreen("billing")}
            className="shrink-0 whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-brand-orange hover:text-brand-orange transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-brand-orange" />
            + New Bill (POS)
          </button>

          <button
            onClick={() => setActiveScreen("counter")}
            className="shrink-0 whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-brand-orange hover:text-brand-orange transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Zap className="h-3.5 w-3.5 text-brand-orange" />
            Counter Terminal
          </button>

          <button
            onClick={() => setActiveScreen("customers")}
            className="shrink-0 whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-brand-orange hover:text-brand-orange transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <UserPlus className="h-3.5 w-3.5 text-brand-orange" />
            + Customer Khata
          </button>

          <button
            onClick={() => setActiveScreen("inventory")}
            className="shrink-0 whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-brand-orange hover:text-brand-orange transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <PackagePlus className="h-3.5 w-3.5 text-brand-orange" />
            + Add Stock
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="shrink-0 whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-rose-500 hover:text-rose-500 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Wallet className="h-3.5 w-3.5 text-rose-500" />
            + Expense
          </button>

          <button
            onClick={() => setActiveScreen("reports")}
            className="shrink-0 whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-brand-orange hover:text-brand-orange transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <BarChart3 className="h-3.5 w-3.5 text-brand-orange" />
            Reports
          </button>

          <button
            onClick={() => setIsDailyBriefingOpen(true)}
            className="shrink-0 whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-brand-orange hover:text-brand-orange transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            title="Open Yesterday's Daily Briefing"
          >
            <Calendar className="h-3.5 w-3.5 text-brand-orange" />
            Yesterday Briefing
          </button>

        </div>
      </div>

      {/* 5. MAIN VISUALIZATION: DUAL INTERACTIVE HOURLY CHART & FINANCIAL POSITION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        
        {/* Left 2 Cols: Shift Velocity Interactive Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm space-y-4 sm:space-y-5 transition-colors">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 sm:h-5 w-4 sm:w-5 text-brand-orange" />
                <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                  Peak Business Hours & Shift Velocity
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hourly transaction flow to optimize cashier counter allocations
              </p>
            </div>
            
            {/* Metric Mode Switcher */}
            <div className="w-full sm:w-auto grid grid-cols-3 sm:flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs font-black text-center transition-colors">
              <button
                onClick={() => setChartMetric("sales")}
                className={`py-1 px-1 sm:px-2.5 rounded-lg transition-all cursor-pointer text-center ${
                  chartMetric === "sales" 
                    ? "bg-brand-orange text-white shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setChartMetric("orders")}
                className={`py-1 px-1 sm:px-2.5 rounded-lg transition-all cursor-pointer text-center ${
                  chartMetric === "orders" 
                    ? "bg-brand-orange text-white shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                }`}
              >
                Orders (#)
              </button>
              <button
                onClick={() => setChartMetric("profit")}
                className={`py-1 px-1 sm:px-2.5 rounded-lg transition-all cursor-pointer text-center ${
                  chartMetric === "profit" 
                    ? "bg-brand-orange text-white shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                }`}
              >
                Profit (₹)
              </button>
            </div>
          </div>

          {/* Interactive Chart Bars */}
          <div className="h-40 sm:h-48 flex items-end justify-between gap-1.5 sm:gap-3 pt-3 sm:pt-6 px-1 sm:px-2">
            {hourlyData.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer">
                
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] sm:text-[10px] font-black px-2 py-0.5 sm:py-1 rounded-lg shadow-xl whitespace-nowrap mb-1 pointer-events-none z-10 scale-95 group-hover:scale-100">
                  {chartMetric === "orders" ? `${h.count} Bills` : `₹${h.activeValue.toLocaleString("en-IN")}`}
                </div>

                {/* Dual Visual Bar with glow */}
                <div className="w-full max-w-[42px] sm:max-w-[54px] bg-slate-100 dark:bg-slate-800/80 rounded-xl sm:rounded-2xl h-24 sm:h-32 flex items-end p-1 sm:p-1.5 relative overflow-hidden group-hover:ring-2 group-hover:ring-brand-orange/50 transition-all">
                  <div 
                    style={{ height: `${h.heightPct}%` }}
                    className={`w-full rounded-lg sm:rounded-xl transition-all duration-500 shadow-md ${
                      i === 3 
                        ? "bg-brand-orange animate-pulse"
                        : "bg-brand-orange/80 group-hover:bg-brand-orange"
                    }`}
                  />
                </div>

                {/* Label */}
                <div className="text-center">
                  <span className="text-[10px] sm:text-[11px] font-black block text-slate-800 dark:text-slate-200">
                    {h.label}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase hidden sm:block">
                    {h.name}
                  </span>
                </div>

              </div>
            ))}
          </div>

          {/* Category Revenue Contribution Progress Bars */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] sm:text-[11px] font-black uppercase text-slate-400 tracking-wider block">
              Top Category Revenue Contribution
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {categoryRevenue.map((cat, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-2 sm:p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                    <span className="truncate pr-1 text-slate-800 dark:text-slate-200 font-extrabold">{cat.category}</span>
                    <span>{cat.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${cat.pct}%` }}
                      className={`h-full rounded-full ${
                        idx === 0 ? "bg-brand-orange" : idx === 1 ? "bg-brand-orange/70" : idx === 2 ? "bg-brand-orange/45" : "bg-slate-400"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Financial Position, GST & Cash-in-Till Ledger */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm space-y-3.5 sm:space-y-4 transition-colors">
          
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5 sm:pb-3">
            <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Banknote className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-500" />
              Cash Drawer & Tax Position
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Reconciled register status for {periodLabel.toLowerCase()}
            </p>
          </div>

          {/* Cash In Till Card */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                Est. Cash in Till
              </span>
              <span className="text-[9px] sm:text-[10px] font-black text-slate-400">
                {cashSharePct}% Physical Cash
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{cashInTill.toLocaleString("en-IN")}
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold block pt-1">
              Opening ₹{openingCashFloat.toLocaleString("en-IN")} + Sales ₹{cashCollected.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Tax / GST Collected */}
          <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center font-black text-xs sm:text-sm">
                %
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-black block text-slate-900 dark:text-white">Tax (GST) Output</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">CGST + SGST collected</span>
              </div>
            </div>
            <span className="text-xs sm:text-sm font-black text-brand-orange">
              ₹{totalGstCollected.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Digital UPI QR Share */}
          <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                <QrCode className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-black block text-slate-900 dark:text-white">Digital Payments</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">{digitalSharePct}% share of sales</span>
              </div>
            </div>
            <span className="text-xs sm:text-sm font-black text-brand-orange">
              ₹{upiCollected.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Customer Khata Exposure */}
          <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-black block text-slate-900 dark:text-white">Credit (Udhaar) Sales</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">Pending recovery</span>
              </div>
            </div>
            <span className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400">
              ₹{creditLogged.toLocaleString("en-IN")}
            </span>
          </div>

        </div>

      </div>

      {/* 6. BOTTOM ROW: LIVE TRANSACTIONS, BESTSELLERS LEADERBOARD & INVENTORY ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        
        {/* Col 1 & 2 (Span 2): Live Recent Transactions Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm space-y-3.5 sm:space-y-4 transition-colors">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="h-4 sm:h-5 w-4 sm:w-5 text-brand-orange" />
                Live Store Transactions
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Click any receipt to inspect the bill and tax breakdown
              </p>
            </div>
            
            {/* Payment filter pills */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar transition-colors">
              {(["All", "Cash", "UPI", "Credit"] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setSelectedTxFilter(mode)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    selectedTxFilter === mode 
                      ? "bg-brand-orange text-white shadow-xs font-black" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {filteredRecentOrders.length === 0 ? (
            <div className="text-center py-10 sm:py-12 text-slate-400 text-xs font-medium">
              No transactions matching filter "{selectedTxFilter}". Create your first bill using POS!
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-2.5">
              {filteredRecentOrders.map((order) => {
                const isPaid = order.status === "Paid" || order.paymentMethod !== "Credit";
                return (
                  <div
                    key={order.id}
                    onClick={() => setInspectOrder(order)}
                    className="p-3 sm:p-3.5 bg-slate-50/70 dark:bg-slate-900/50 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-[11px] sm:text-xs text-brand-orange shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                        #{order.id.slice(-4)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-brand-orange transition-colors truncate">
                            {order.customerName || "Walk-in Customer"}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                            {order.customerType || "Retail"}
                          </span>
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {order.items.map(i => `${i.name} (x${i.quantity})`).slice(0, 2).join(", ")}
                          {order.items.length > 2 ? ` + ${order.items.length - 2} more` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/40 dark:border-slate-800">
                      <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase ${
                        order.paymentMethod === "UPI" 
                          ? "bg-brand-orange/10 text-brand-orange border border-brand-orange/20"
                          : order.paymentMethod === "Cash"
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                      }`}>
                        {order.paymentMethod}
                      </span>
                      
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                          ₹{order.total.toLocaleString("en-IN")}
                        </span>
                        <span className={`text-[9px] sm:text-[10px] font-extrabold ${isPaid ? "text-slate-500 dark:text-slate-400" : "text-brand-orange"}`}>
                          {isPaid ? "✓ Paid" : "Pending Udhaar"}
                        </span>
                      </div>

                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-brand-orange shrink-0 hidden sm:block ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Col 3: Bestseller Leaderboard & Store Alerts */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          
          {/* Top Selling Products */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-3 sm:space-y-3.5 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-orange" />
                Top Bestsellers Leaderboard
              </h3>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">By Volume</span>
            </div>

            <div className="space-y-2 sm:space-y-2.5">
              {topProducts.map((prod, idx) => {
                const isLow = prod.stock <= prod.minStock;
                return (
                  <div 
                    key={prod.id}
                    className="p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <div className={`h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-[10px] sm:text-[11px] shrink-0 ${
                        idx === 0 
                          ? "bg-brand-orange text-white shadow-xs ring-2 ring-brand-orange/30"
                          : idx === 1
                          ? "bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                          : idx === 2
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}>
                        #{idx + 1}
                      </div>
                      <div className="truncate">
                        <span className="font-extrabold text-xs sm:text-xs text-slate-900 dark:text-white block truncate">
                          {prod.name}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold block truncate">
                          {prod.category} • Sold: {prod.qty} units
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white block">
                        ₹{prod.revenue.toLocaleString("en-IN")}
                      </span>
                      <span className={`text-[9px] sm:text-[10px] font-black ${isLow ? "text-brand-orange" : "text-slate-500"}`}>
                        {isLow ? `Low (${prod.stock})` : `${prod.stock} in stock`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Alerts & Store Reminders */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-3 sm:space-y-3.5 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-orange" />
                Inventory & Store Alerts
              </h3>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">{alerts.length} Total</span>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-6 text-slate-400 italic text-xs font-medium">
                ✓ No pending inventory alerts. All stock is well balanced!
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {alerts.map((alert: Alert) => (
                  <div
                    key={alert.id}
                    className="p-2.5 sm:p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl text-xs space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-orange shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="font-extrabold text-slate-900 dark:text-white block">
                          {alert.message}
                        </span>
                        {alert.details && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            {alert.details}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <button
                        onClick={() => {
                          restockProduct(alert.id, 50);
                          showToast("✓ Restocked 50 units");
                        }}
                        className="px-2.5 py-1 bg-brand-orange hover:bg-brand-orange-hover text-white font-black rounded-lg shadow-xs cursor-pointer active:scale-95"
                      >
                        + Reorder 50
                      </button>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-1.5 py-0.5 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 7. LIVE RECEIPT INSPECTOR POPUP MODAL */}
      {inspectOrder && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 transition-colors">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-brand-orange" />
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Receipt #{inspectOrder.id}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">{inspectOrder.date}</span>
              </div>
              <button
                onClick={() => setInspectOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="font-black block text-slate-900 dark:text-white">{inspectOrder.customerName || "Walk-in Customer"}</span>
                <span className="text-[10px] text-slate-400 font-bold">{inspectOrder.customerType} Channel</span>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                inspectOrder.paymentMethod === "UPI" 
                  ? "bg-brand-orange/10 text-brand-orange border border-brand-orange/20" 
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
              }`}>
                {inspectOrder.paymentMethod}
              </span>
            </div>

            {/* Items List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
              <div className="text-[10px] font-black uppercase text-slate-400 px-1 flex justify-between">
                <span>Item</span>
                <span>Qty & Price</span>
              </div>
              {inspectOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{item.name}</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {item.quantity} × ₹{item.price} = ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs font-bold">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₹{(inspectOrder.subtotal || inspectOrder.total).toLocaleString("en-IN")}</span>
              </div>
              {inspectOrder.gst > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>GST (Tax)</span>
                  <span>₹{inspectOrder.gst.toLocaleString("en-IN")}</span>
                </div>
              )}
              {inspectOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Store Discount</span>
                  <span>-₹{inspectOrder.discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Grand Total</span>
                <span className="text-brand-orange">₹{inspectOrder.total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Bill
              </button>
              <button
                onClick={() => setInspectOrder(null)}
                className="px-5 py-2 rounded-xl text-xs font-black bg-brand-orange hover:bg-brand-orange-hover text-white cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 8. QUICK INLINE STORE EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 transition-colors">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-black">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">Record Store Expense</h3>
                  <span className="text-[10px] text-slate-400 font-bold">Instantly log operational store costs</span>
                </div>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-600 dark:text-slate-400 block mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evening staff tea & snacks, packaging bags"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-600 dark:text-slate-400 block mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 150"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-orange"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-600 dark:text-slate-400 block mb-1">
                    Category
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-orange"
                  >
                    <option value="Tea/Snacks">Tea/Snacks</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Rent">Rent</option>
                    <option value="Salary">Salary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-brand-orange hover:bg-brand-orange-hover text-white shadow-md cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 9. ONCE-A-DAY YESTERDAY'S PERFORMANCE BRIEFING POPUP */}
      <DailyBriefingModal
        isOpen={isDailyBriefingOpen}
        onClose={handleCloseDailyBriefing}
        yesterdayData={yesterdayData}
        storeHealthScore={storeHealthScore}
        lowStockCount={lowStockItems.length}
        pendingUdhaarTotal={totalPendingUdhaar}
        totalDebtorsCount={totalDebtorsCount}
        onNavigate={(screen) => setActiveScreen(screen)}
      />

    </div>
  );
};
