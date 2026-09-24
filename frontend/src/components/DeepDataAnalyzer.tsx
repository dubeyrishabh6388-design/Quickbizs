import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CreditCard, 
  DollarSign, 
  RefreshCw, 
  Copy, 
  Check, 
  Layers, 
  Zap, 
  Target,
  BarChart3,
  PieChart
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import { AIMarkdownRenderer } from "./AIMarkdownRenderer";

interface DeepDataAnalyzerProps {
  onNavigateToScreen?: (screen: string) => void;
}

export const DeepDataAnalyzer: React.FC<DeepDataAnalyzerProps> = ({ onNavigateToScreen }) => {
  const { orders, products, customers, expenses, askAI } = useBusiness();

  // State
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeScope, setTimeScope] = useState<"all" | "month" | "week" | "today">("month");
  const [activeTab, setActiveTab] = useState<"overview" | "why-sales-drop" | "causality" | "action-plan" | "ai-audit">("overview");
  const [aiAuditReport, setAiAuditReport] = useState<string | null>(null);
  const [isGeneratingAiAudit, setIsGeneratingAiAudit] = useState(false);
  const [copiedAudit, setCopiedAudit] = useState(false);
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  // 1. Data Aggregations & Calculations
  const analysis = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // Filter orders by time scope
    let filteredOrders = [...orders];
    if (timeScope === "today") {
      filteredOrders = orders.filter(o => o.date.startsWith(todayStr));
    } else if (timeScope === "week") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredOrders = orders.filter(o => new Date(o.date) >= oneWeekAgo);
    } else if (timeScope === "month") {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredOrders = orders.filter(o => new Date(o.date) >= oneMonthAgo);
    }

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const orderCount = filteredOrders.length;
    const avgOrderValue = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

    // Payment method breakdown
    const cashSales = filteredOrders.filter(o => o.paymentMethod === "Cash").reduce((sum, o) => sum + o.total, 0);
    const upiSales = filteredOrders.filter(o => o.paymentMethod === "UPI").reduce((sum, o) => sum + o.total, 0);
    const creditSales = filteredOrders.filter(o => o.paymentMethod === "Credit").reduce((sum, o) => sum + o.total, 0);

    const cashPercent = totalRevenue > 0 ? Math.round((cashSales / totalRevenue) * 100) : 0;
    const upiPercent = totalRevenue > 0 ? Math.round((upiSales / totalRevenue) * 100) : 0;
    const creditPercent = totalRevenue > 0 ? Math.round((creditSales / totalRevenue) * 100) : 0;

    // Inventory & Stockout Opportunity Cost
    const lowStockItems = products.filter(p => p.stock <= p.minStock);
    const outOfStockItems = products.filter(p => p.stock === 0);
    
    // Estimated lost sales: each low-stock item is missing an estimated 3 sales units per day
    const estimatedLostRevenue = lowStockItems.reduce((acc, p) => acc + (p.price * 3), 0);

    // Udhaar / Khata Metrics
    const totalPendingUdhaar = customers.reduce((acc, c) => acc + (c.pendingDues || 0), 0);
    const overdueCustomers = customers.filter(c => c.pendingDues > 0).sort((a, b) => b.pendingDues - a.pendingDues);
    const highRiskUdhaar = overdueCustomers.filter(c => c.pendingDues > 1500).reduce((acc, c) => acc + c.pendingDues, 0);

    // Margins & Expenses
    const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const estimatedCost = filteredOrders.reduce((orderAcc, order) => {
      const oCost = order.items.reduce((itemAcc, item) => {
        const prod = products.find(p => p.id === item.productId);
        const cost = prod?.costPrice || (item.price * 0.75);
        return itemAcc + (cost * item.quantity);
      }, 0);
      return orderAcc + oCost;
    }, 0);

    const grossProfit = totalRevenue - estimatedCost;
    const grossMarginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;
    const netProfit = grossProfit - (timeScope === "today" ? Math.round(totalExpenses / 30) : totalExpenses);
    const netMarginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    // Hourly footfall analysis (distribution of orders by hour 0-23)
    const hourlyOrders: Record<number, number> = {};
    filteredOrders.forEach(o => {
      const hr = new Date(o.date).getHours();
      hourlyOrders[hr] = (hourlyOrders[hr] || 0) + 1;
    });

    // Detect lull hours (between 12:00 and 16:00) vs rush hours (17:00 to 21:00)
    const afternoonOrders = (hourlyOrders[12] || 0) + (hourlyOrders[13] || 0) + (hourlyOrders[14] || 0) + (hourlyOrders[15] || 0);
    const eveningOrders = (hourlyOrders[18] || 0) + (hourlyOrders[19] || 0) + (hourlyOrders[20] || 0) + (hourlyOrders[21] || 0);

    // Root-Cause Diagnoses calculation
    const dropCauses: Array<{
      id: string;
      severity: "critical" | "high" | "moderate" | "positive";
      title: string;
      impactAmount?: number;
      impactText: string;
      mechanism: string;
      evidence: string;
      solution: string;
    }> = [];

    // 1. Stockout check
    if (lowStockItems.length > 0) {
      dropCauses.push({
        id: "stockouts",
        severity: lowStockItems.length >= 3 ? "critical" : "high",
        title: "Lost Walk-in Sales from Out-of-Stock Bestsellers",
        impactAmount: estimatedLostRevenue,
        impactText: `~₹${estimatedLostRevenue.toLocaleString()} in missed daily sales`,
        mechanism: "When staple daily items (like milk, bread, cooking oil, or top snacks) are unavailable, buyers don't just leave without that item—they abandon their entire basket to shop at a neighboring store.",
        evidence: `${lowStockItems.length} product(s) are at or below minimum safety stock (${outOfStockItems.length} completely out of stock).`,
        solution: "Trigger immediate supplier purchase orders for high-turnover SKUs and set minimum safety thresholds to at least 3 days of peak sales volume."
      });
    }

    // 2. Trapped capital in Khata check
    if (totalPendingUdhaar > 2000) {
      dropCauses.push({
        id: "khata-lockup",
        severity: totalPendingUdhaar > 10000 ? "critical" : "high",
        title: "Working Capital Trapped in Customer Khata (Udhaar)",
        impactAmount: totalPendingUdhaar,
        impactText: `₹${totalPendingUdhaar.toLocaleString()} cash trapped with customers`,
        mechanism: "When customers delay payment on informal credit (Udhaar), your liquid cash is locked. You are unable to pay distributors on time, resulting in lost cash discounts and distributor restocking delays.",
        evidence: `${overdueCustomers.length} customer(s) currently owe dues. Top debtor owes ₹${overdueCustomers[0]?.pendingDues.toLocaleString() || 0}.`,
        solution: "Send polite 1-click WhatsApp payment reminders with UPI payment links. Enforce a ₹1,000 credit ceiling for slow-paying accounts."
      });
    }

    // 3. Afternoon Footfall Lull
    if (orderCount > 5 && afternoonOrders <= (eveningOrders * 0.25)) {
      dropCauses.push({
        id: "afternoon-lull",
        severity: "moderate",
        title: "Severe Midday Slump (12 PM - 4 PM Drop-off)",
        impactText: "Shop fixed costs running while transactions drop below 20%",
        mechanism: "Local footfall thins out during mid-afternoon heat. Without afternoon-specific promotional triggers (tea/snack combos, grocery delivery offers), counter staff sits idle while rent & electricity continue accruing.",
        evidence: `Only ${afternoonOrders} orders occurred between 12 PM - 4 PM compared to ${eveningOrders} orders during evening hours.`,
        solution: "Launch an 'Afternoon Happy Hours' promotion on bulk staples or snack combos with WhatsApp broadcast to nearby residential customers."
      });
    }

    // 4. Payment Speed Bottleneck
    if (cashPercent > 55) {
      dropCauses.push({
        id: "cash-friction",
        severity: "moderate",
        title: "Cash Handling & Change (Chutta) Delays During Rush Hours",
        impactText: "Cash represents " + cashPercent + "% of billing",
        mechanism: "Cash transactions take 45-60 seconds longer per customer due to counting and hunting for coin change. During 7 PM - 9 PM rush, queue buildup causes impatient customers to walk away without buying.",
        evidence: `${cashPercent}% of transactions were paid in Cash vs only ${upiPercent}% via instant QR/UPI.`,
        solution: "Place physical QR code standees at the counter entrance so buyers scan and pay while their items are being bagged."
      });
    }

    // 5. Operating Expense Overrun
    if (totalExpenses > (grossProfit * 0.45) && grossProfit > 0) {
      dropCauses.push({
        id: "expense-creep",
        severity: "high",
        title: "Overhead Expenses Eating Gross Profit Margins",
        impactText: `Expenses consuming ${Math.round((totalExpenses / grossProfit) * 100)}% of gross profit`,
        mechanism: "Shop miscellaneous expenditures (chai/snacks, delivery fuel, utilities) have risen faster than revenue growth, squeezing bottom-line owner take-home pay.",
        evidence: `Total logged expenses are ₹${totalExpenses.toLocaleString()} against ₹${grossProfit.toLocaleString()} gross margin.`,
        solution: "Audit monthly supplier transport charges, track daily snack allowances, and renegotiate bulk procurement costs."
      });
    }

    // Store Health Score (0-100)
    let healthScore = 85;
    if (lowStockItems.length >= 3) healthScore -= 20;
    else if (lowStockItems.length > 0) healthScore -= 10;
    
    if (totalPendingUdhaar > 15000) healthScore -= 20;
    else if (totalPendingUdhaar > 5000) healthScore -= 10;
    
    if (netMarginPercent < 10) healthScore -= 15;
    else if (netMarginPercent < 18) healthScore -= 5;
    
    if (healthScore < 30) healthScore = 35;

    return {
      totalRevenue,
      orderCount,
      avgOrderValue,
      cashPercent,
      upiPercent,
      creditPercent,
      lowStockItems,
      outOfStockItems,
      estimatedLostRevenue,
      totalPendingUdhaar,
      overdueCustomers,
      highRiskUdhaar,
      grossProfit,
      grossMarginPercent,
      netProfit,
      netMarginPercent,
      totalExpenses,
      dropCauses,
      healthScore,
      afternoonOrders,
      eveningOrders
    };
  }, [orders, products, customers, expenses, timeScope]);

  // Handle "Analyze My Data" Button Click
  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
      setActiveTab("overview");
    }, 750);
  };

  // Generate Deep AI Audit via Gemini
  const handleGenerateAiAudit = async () => {
    setIsGeneratingAiAudit(true);
    try {
      const prompt = `Please perform an executive deep data analysis on my store data:
Total Sales: ₹${analysis.totalRevenue.toLocaleString()} across ${analysis.orderCount} orders.
Average Order Value: ₹${analysis.avgOrderValue}.
Payment Split: ${analysis.cashPercent}% Cash, ${analysis.upiPercent}% UPI, ${analysis.creditPercent}% Credit/Udhaar.
Low Stock Items: ${analysis.lowStockItems.length} items (${analysis.lowStockItems.map(p => p.name).join(", ") || "None"}).
Total Pending Customer Khata/Udhaar: ₹${analysis.totalPendingUdhaar.toLocaleString()} across ${analysis.overdueCustomers.length} customers.
Total Store Expenses: ₹${analysis.totalExpenses.toLocaleString()}.
Gross Margin: ${analysis.grossMarginPercent}%, Net Profit: ₹${analysis.netProfit.toLocaleString()}.

Please structure your response with:
### 1. Executive Diagnostic & Health Rating
Analyze why my sales went down or fluctuated, citing exact figures.
### 2. The Core Root Causes ("Why It Occurred")
Explain the operational chain reaction (e.g. stockouts -> walkaways -> cashflow dip).
### 3. Step-by-Step Recovery Playbook
- **Today (Immediate Actions)**: Exact tasks with names and amounts.
- **This Week**: Merchandising & credit collection.
- **This Month**: Growth strategies.
### 4. Projected Financial Recovery
Estimate how much monthly revenue can be unlocked.`;

      const reply = await askAI(prompt);
      setAiAuditReport(reply);
      setActiveTab("ai-audit");
    } catch (err) {
      setAiAuditReport("Error generating AI Deep Audit. Please check network connection and try again.");
    } finally {
      setIsGeneratingAiAudit(false);
    }
  };

  const toggleAction = (key: string) => {
    setCompletedActions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyAiAudit = () => {
    if (!aiAuditReport) return;
    navigator.clipboard.writeText(aiAuditReport);
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card with Prominent "Analyze My Data" Button — Theme-Adaptive */}
      <div className="relative overflow-hidden bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs dark:shadow-xl text-slate-900 dark:text-white">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-orange/5 dark:bg-brand-orange/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange text-xs font-black uppercase tracking-wider border border-brand-orange/25 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Store Intelligence Engine
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/25">
                Gemini 3.6 Flash Synced
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Full Store Data Analysis & Root-Cause Audit
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Analyze your complete store database to uncover exactly <strong className="text-slate-900 dark:text-white font-black">why your sales went down</strong>, where cash is getting trapped, and how to recover lost daily revenue with step-by-step instructions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Time horizon selector */}
            <select
              value={timeScope}
              onChange={(e) => setTimeScope(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl px-3.5 py-3 text-xs font-bold focus:outline-none focus:border-brand-orange cursor-pointer"
            >
              <option value="today">Today's Real-time Data</option>
              <option value="week">Past 7 Days Data</option>
              <option value="month">Past 30 Days Data</option>
              <option value="all">All Historical Store Data</option>
            </select>

            {/* The Main CTA Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-orange via-amber-500 to-brand-orange hover:from-brand-orange-hover hover:to-amber-600 text-white font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-brand-orange/30 hover:shadow-brand-orange/50 transition-all transform active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Scanning All Store Data...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze My Data</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live snapshot bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Database Scope</span>
            <span className="text-slate-900 dark:text-white font-bold">{analysis.orderCount} Orders · {products.length} Products</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Calculated Revenue</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">₹{analysis.totalRevenue.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Trapped Khata (Udhaar)</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold tabular-nums">₹{analysis.totalPendingUdhaar.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Stockout Alerts</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{analysis.lowStockItems.length} SKUs below threshold</span>
          </div>
        </div>
      </div>

      {/* Analysis Results View */}
      {hasAnalyzed && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "overview"
                  ? "bg-brand-orange text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Data Overview & Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab("why-sales-drop")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "why-sales-drop"
                  ? "bg-brand-orange text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <TrendingDown className="h-4 w-4" />
              <span>Why Sales Drop ({analysis.dropCauses.length} Causes)</span>
            </button>

            <button
              onClick={() => setActiveTab("causality")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "causality"
                  ? "bg-brand-orange text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>How It Actually Occurs</span>
            </button>

            <button
              onClick={() => setActiveTab("action-plan")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "action-plan"
                  ? "bg-brand-orange text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Target className="h-4 w-4" />
              <span>Improvement Action Plan</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("ai-audit");
                if (!aiAuditReport) handleGenerateAiAudit();
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "ai-audit"
                  ? "bg-gradient-to-r from-purple-600 to-brand-orange text-white shadow-xs"
                  : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Gemini AI Deep Audit</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW & HEALTH METRICS */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Top Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Store Health Score */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Health Index</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      analysis.healthScore >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" :
                      analysis.healthScore >= 60 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" :
                      "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                    }`}>
                      {analysis.healthScore >= 80 ? "Healthy" : analysis.healthScore >= 60 ? "Moderate" : "Action Needed"}
                    </span>
                  </div>
                  <div className="my-3 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                      {analysis.healthScore}
                    </span>
                    <span className="text-sm font-bold text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        analysis.healthScore >= 80 ? "bg-emerald-500" : analysis.healthScore >= 60 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${analysis.healthScore}%` }}
                    />
                  </div>
                </div>

                {/* Average Order Value (AOV) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Ticket Size (AOV)</span>
                  <div className="my-3">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                      ₹{analysis.avgOrderValue.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Based on {analysis.orderCount} customer transactions
                  </p>
                </div>

                {/* Estimated Lost Revenue From Stockouts */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Lost Sales</span>
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                  </div>
                  <div className="my-3">
                    <span className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
                      ~₹{analysis.estimatedLostRevenue.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-500 font-medium">
                    {analysis.lowStockItems.length} products below safety stock
                  </p>
                </div>

                {/* Capital Trapped in Khata */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trapped Udhaar Capital</span>
                    <CreditCard className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="my-3">
                    <span className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                      ₹{analysis.totalPendingUdhaar.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Owed across {analysis.overdueCustomers.length} customer accounts
                  </p>
                </div>

              </div>

              {/* Profitability & Payment Methods Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Margins & Net Profit */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-brand-orange" />
                    Profit Margins & Overhead Breakdown
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Gross Profit Margin:</span>
                      <span className="font-black text-slate-900 dark:text-white">{analysis.grossMarginPercent}% (₹{analysis.grossProfit.toLocaleString()})</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Store Operating Expenses:</span>
                      <span className="font-black text-rose-500">₹{analysis.totalExpenses.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Estimated Net Profit:</span>
                      <span className={`font-black text-sm ${analysis.netProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        ₹{analysis.netProfit.toLocaleString()} ({analysis.netMarginPercent}% Net)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Split */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-emerald-500" />
                    Payment Method Split & Cash Velocity
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">UPI / QR (Instant Bank Deposit)</span>
                        <span className="text-emerald-500 font-black">{analysis.upiPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${analysis.upiPercent}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Cash Transactions</span>
                        <span className="text-amber-500 font-black">{analysis.cashPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${analysis.cashPercent}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Udhaar / Credit Ledger (Delayed)</span>
                        <span className="text-rose-500 font-black">{analysis.creditPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${analysis.creditPercent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: WHY SALES DROP (ROOT CAUSES) */}
          {activeTab === "why-sales-drop" && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 text-amber-500 rounded-xl">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Identified {analysis.dropCauses.length} Key Drivers Causing Sales Dips
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Based on real-time transaction timestamps, shelf stockouts, and unpaid customer balances.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {analysis.dropCauses.map((cause, idx) => (
                  <div 
                    key={cause.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          cause.severity === "critical" ? "bg-rose-500/15 text-rose-500 border border-rose-500/30" :
                          cause.severity === "high" ? "bg-amber-500/15 text-amber-500 border border-amber-500/30" :
                          "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                        }`}>
                          {cause.severity} Priority
                        </span>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          #{idx + 1}. {cause.title}
                        </h4>
                      </div>

                      {cause.impactAmount && (
                        <span className="text-xs font-black text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-900/50 self-start sm:self-auto">
                          Estimated Loss: ₹{cause.impactAmount.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Live Store Evidence</span>
                        <p className="text-slate-700 dark:text-slate-300 font-semibold">{cause.evidence}</p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Why It Causes Revenue Drop</span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{cause.mechanism}</p>
                      </div>

                      <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">3. Immediate Solution</span>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold">{cause.solution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HOW IT ACTUALLY OCCURS (CAUSALITY CHAIN) */}
          {activeTab === "causality" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-brand-orange" />
                  The Operational Causality Chain (How the Drop Happens)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Retail drops rarely happen randomly. They occur through a predictable chain reaction of operational friction.
                </p>
              </div>

              {/* Visual Step-by-Step Flow */}
              <div className="relative border-l-2 border-brand-orange/30 pl-6 ml-3 space-y-8 text-xs">
                
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                    1
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                    <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider">Root Trigger (The Catalyst)</span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Stockout of Daily Staples or Credit Lockup
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Fast-moving daily essentials (Milk, Bread, Eggs, Tea) run out of stock during the day, or suppliers delay orders because store working capital is locked in unpaid customer Udhaar.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                    2
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Customer Psychology & Behavioral Shift</span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Walk-Away & Cross-Sell Collapse
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      When regular walk-ins discover their primary item is missing, 80% do not wait. They walk over to the next store. The shop loses not only the ₹30 milk sale, but also the accompanying ₹200 snacks, biscuits, and spices they would have bought impulsively.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                    3
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Financial Squeeze</span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Fixed Overheads Overwhelm Diminished Volume
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      While daily transaction volume slips by 15-20%, store rent, staff wages, and electricity remain 100% fixed. This causes the merchant's net profit margin to rapidly compress from ~20% down to single digits.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                    4
                  </div>
                  <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">The Reversal Strategy</span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      How to Break the Cycle Today
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      1. Protect core safety stock (never let top 10 items hit zero).<br />
                      2. Collect Udhaar via courteous WhatsApp payment links.<br />
                      3. Use afternoon combo bundles to revitalize the 12 PM - 4 PM footfall gap.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: STEP-BY-STEP ACTION PLAN */}
          {activeTab === "action-plan" && (
            <div className="space-y-6">
              
              {/* Today's Action Checklist */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Zap className="h-4 w-4 text-brand-orange" />
                      Phase 1: Immediate Tasks to Execute Today
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Check off tasks as you complete them to protect today's cashflow.
                    </p>
                  </div>
                  <span className="text-xs font-black text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-xl">
                    High Priority
                  </span>
                </div>

                <div className="space-y-2.5">
                  
                  {/* Task 1: Reorder Low Stock */}
                  {analysis.lowStockItems.length > 0 && (
                    <div 
                      onClick={() => toggleAction("reorder")}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-xs ${
                        completedActions["reorder"] 
                          ? "bg-emerald-500/10 border-emerald-500/30 line-through opacity-70"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-brand-orange/50"
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={!!completedActions["reorder"]} 
                        onChange={() => {}}
                        className="mt-0.5 rounded text-brand-orange cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">
                          Reorder {analysis.lowStockItems.length} Low-Stock SKU(s) Immediately
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Urgent items: {analysis.lowStockItems.slice(0, 3).map(p => p.name).join(", ")}. Contact supplier today to prevent weekend walk-aways.
                        </p>
                      </div>
                      {onNavigateToScreen && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onNavigateToScreen("inventory"); }}
                          className="text-[10px] font-bold text-brand-orange hover:underline shrink-0"
                        >
                          Open Inventory &rarr;
                        </button>
                      )}
                    </div>
                  )}

                  {/* Task 2: Udhaar Recovery */}
                  {analysis.overdueCustomers.length > 0 && (
                    <div 
                      onClick={() => toggleAction("udhaar")}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-xs ${
                        completedActions["udhaar"] 
                          ? "bg-emerald-500/10 border-emerald-500/30 line-through opacity-70"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-brand-orange/50"
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={!!completedActions["udhaar"]} 
                        onChange={() => {}}
                        className="mt-0.5 rounded text-brand-orange cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">
                          Send Courteous WhatsApp Reminders to Top {Math.min(3, analysis.overdueCustomers.length)} Khata Debtors
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Top debtor: {analysis.overdueCustomers[0]?.name} (₹{analysis.overdueCustomers[0]?.pendingDues.toLocaleString()}). Recovering even 50% unlocks ₹{Math.round(analysis.totalPendingUdhaar * 0.5).toLocaleString()} working capital.
                        </p>
                      </div>
                      {onNavigateToScreen && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onNavigateToScreen("customers"); }}
                          className="text-[10px] font-bold text-brand-orange hover:underline shrink-0"
                        >
                          Open Khata &rarr;
                        </button>
                      )}
                    </div>
                  )}

                  {/* Task 3: Counter QR Optimization */}
                  <div 
                    onClick={() => toggleAction("qr")}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-xs ${
                      completedActions["qr"] 
                        ? "bg-emerald-500/10 border-emerald-500/30 line-through opacity-70"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-brand-orange/50"
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={!!completedActions["qr"]} 
                      onChange={() => {}}
                      className="mt-0.5 rounded text-brand-orange cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white">
                        Position UPI QR Standee Directly at Billing Point of View
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Avoid change delays during 7 PM - 9 PM evening rush. Cuts billing wait time by 40% and stops queue drop-offs.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Weekly & Monthly Playbook */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Weekly */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
                  <h4 className="font-black text-xs uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Phase 2: This Week's Improvements
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                      <span><strong>Midday Flash Deals (12 PM - 4 PM):</strong> Offer a 5% bundle discount on bulk pulses or cleaning supplies to revive the afternoon slump.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                      <span><strong>Staff Schedule Realignment:</strong> Ensure maximum cashier and helper presence between 6:30 PM and 9:30 PM.</span>
                    </li>
                  </ul>
                </div>

                {/* Monthly */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
                  <h4 className="font-black text-xs uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" />
                    Phase 3: Monthly Growth Targets
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                      <span><strong>Supplier Terms Negotiation:</strong> Request 14-day rolling credit terms from top 2 distributors using your reliable bill volume.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                      <span><strong>Automated Restock Triggers:</strong> Set min-stock levels to 3x average daily sales for zero stockout risk.</span>
                    </li>
                  </ul>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: GEMINI AI DEEP AUDIT */}
          {activeTab === "ai-audit" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-brand-orange text-white flex items-center justify-center shadow-md shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      Gemini 3.6 Flash Deep Audit Report
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Live store diagnostic tailored to your exact store inventory, sales, and Khata numbers
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {aiAuditReport && (
                    <button
                      onClick={copyAiAudit}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedAudit ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Report</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={handleGenerateAiAudit}
                    disabled={isGeneratingAiAudit}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingAiAudit ? "animate-spin" : ""}`} />
                    <span>Re-Run AI Audit</span>
                  </button>
                </div>
              </div>

              {isGeneratingAiAudit ? (
                <div className="py-16 text-center space-y-3">
                  <div className="flex justify-center items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-brand-orange animate-bounce"></span>
                    <span className="h-3 w-3 rounded-full bg-brand-orange animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-3 w-3 rounded-full bg-brand-orange animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Gemini 3.6 Flash is analyzing your store's live financial data and formulating instructions...
                  </p>
                </div>
              ) : aiAuditReport ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750">
                  <AIMarkdownRenderer content={aiAuditReport} />
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Click "Re-Run AI Audit" to generate an executive report from Google Gemini.
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Initial Callout if not analyzed yet */}
      {!hasAnalyzed && (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-brand-orange/10 text-brand-orange mx-auto flex items-center justify-center">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h3 className="font-black text-base text-slate-900 dark:text-white">
            Ready to Inspect Your Store's Complete Performance?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Click the <strong className="text-brand-orange">"Analyze My Data"</strong> button above to run an instant diagnostic on sales dips, stockouts, Udhaar dues, and step-by-step recovery tasks.
          </p>
          <button
            onClick={handleRunAnalysis}
            className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Run Analysis Now</span>
          </button>
        </div>
      )}

    </div>
  );
};
