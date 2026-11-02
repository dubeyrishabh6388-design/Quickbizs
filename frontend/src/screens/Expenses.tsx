import React, { useState, useMemo } from "react";
import { 
  Plus, 
  X, 
  WalletCards, 
  TrendingDown, 
  Calendar, 
  Search, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Check, 
  Receipt, 
  Coffee, 
  Zap, 
  Building, 
  Users, 
  MoreHorizontal,
  CircleDollarSign
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import type { Expense } from "../context/BusinessContext";
import { useTranslation } from "../context/LanguageContext";

interface ExpensesProps {
  setActiveScreen?: (screen: any) => void;
}

export const Expenses: React.FC<ExpensesProps> = () => {
  const { t, language } = useTranslation();
  const { expenses, addExpense, approveExpense, deleteExpense, currentRole } = useBusiness();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Expense["category"]>("Tea/Snacks");

  // Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<"all" | "month" | "week" | "today">("all");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount.trim()) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid positive amount.");
      return;
    }

    addExpense(description.trim(), parsedAmount, category);
    setDescription("");
    setAmount("");
    setCategory("Tea/Snacks");
    setIsModalOpen(false);
    showToast("✓ Store Expense Logged Successfully");
  };

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  const handleDeleteExpense = async (id: string, desc: string) => {
    if (window.confirm(`Are you sure you want to delete expense "${desc}"?`)) {
      await deleteExpense(id);
      showToast("✓ Expense record deleted");
    }
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const totalAllTime = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const todayExpenses = expenses
      .filter(e => e.date && e.date.startsWith(todayStr))
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    const todayCount = expenses.filter(e => e.date && e.date.startsWith(todayStr)).length;

    const monthExpenses = expenses
      .filter(e => e.date && e.date.startsWith(currentMonthStr))
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const pendingExpenses = expenses.filter(e => e.status === "Pending Approval");
    const pendingCount = pendingExpenses.length;
    const pendingAmount = pendingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Category Breakdown
    const catTotals: Record<string, number> = {
      "Tea/Snacks": 0,
      "Electricity": 0,
      "Rent": 0,
      "Salary": 0,
      "Other": 0
    };
    expenses.forEach(e => {
      const cat = e.category || "Other";
      catTotals[cat] = (catTotals[cat] || 0) + (e.amount || 0);
    });

    return {
      totalAllTime,
      todayExpenses,
      todayCount,
      monthExpenses,
      pendingCount,
      pendingAmount,
      catTotals
    };
  }, [expenses]);

  // Filtered List
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return expenses.filter(e => {
      // Category filter
      if (selectedCategory !== "All" && e.category !== selectedCategory) return false;

      // Time filter
      if (timeFilter === "today" && (!e.date || !e.date.startsWith(todayStr))) return false;
      if (timeFilter === "month" && (!e.date || !e.date.startsWith(currentMonthStr))) return false;
      if (timeFilter === "week") {
        if (!e.date || new Date(e.date) < oneWeekAgo) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const descMatch = e.description?.toLowerCase().includes(query);
        const catMatch = e.category?.toLowerCase().includes(query);
        const loggedMatch = e.loggedBy?.toLowerCase().includes(query);
        if (!descMatch && !catMatch && !loggedMatch) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  }, [expenses, selectedCategory, timeFilter, searchQuery]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Tea/Snacks":
        return <Coffee className="h-4 w-4" />;
      case "Electricity":
        return <Zap className="h-4 w-4" />;
      case "Rent":
        return <Building className="h-4 w-4" />;
      case "Salary":
        return <Users className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Tea/Snacks":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Electricity":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
      case "Rent":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "Salary":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="w-full p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6 pb-28 text-slate-900 dark:text-white transition-colors">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-black text-xs z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toastMsg}
        </div>
      )}

      {/* Adaptive Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
            <WalletCards className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {t("expenses.title", "Store Expenses & Ledger")}
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {language === "hi" ? "दुकान खर्चे" : "Operating Outflow"}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {t("expenses.subtitle", "Record daily shop overheads, staff tea/snacks, electricity bills, rent & track total expenses")}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-black px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-orange/20 transition-all active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>{t("expenses.logNewExpense", "Log New Expense")}</span>
        </button>
      </div>

      {/* Executive 4-Card Outflow Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Total All-Time Expenses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("expenses.totalExpenses", "Total Expenses")}
            </span>
            <span className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="h-3.5 w-3.5" />
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums block">
            ₹{metrics.totalAllTime.toLocaleString("en-IN")}
          </span>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>{expenses.length} {language === "hi" ? "रिकॉर्ड्स" : "Records"}</span>
            <span>{language === "hi" ? "कुल खर्च" : "All-time Outflow"}</span>
          </div>
        </div>

        {/* Card 2: Today's Expenses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("expenses.todayExpenses", "Today's Expenses")}
            </span>
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5" />
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums block">
            ₹{metrics.todayExpenses.toLocaleString("en-IN")}
          </span>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>{metrics.todayCount} {language === "hi" ? "आज के खर्च" : "Bills Today"}</span>
            <span>{language === "hi" ? "दुकान से बाहर" : "Cash Out"}</span>
          </div>
        </div>

        {/* Card 3: This Month */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("expenses.thisMonth", "This Month")}
            </span>
            <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Calendar className="h-3.5 w-3.5" />
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums block">
            ₹{metrics.monthExpenses.toLocaleString("en-IN")}
          </span>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>{language === "hi" ? "मासिक खर्च" : "Monthly Run-rate"}</span>
            <span>{language === "hi" ? "ओवरहेड" : "Overheads"}</span>
          </div>
        </div>

        {/* Card 4: Pending Approval */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("expenses.pendingApproval", "Pending Approval")}
            </span>
            <span className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CircleDollarSign className="h-3.5 w-3.5" />
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums block">
            ₹{metrics.pendingAmount.toLocaleString("en-IN")}
          </span>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>{metrics.pendingCount} {language === "hi" ? "बाकी" : "Pending"}</span>
            <span className="text-amber-500">{language === "hi" ? "मालिक की मंजूरी प्रतीक्षित" : "Awaiting Owner"}</span>
          </div>
        </div>

      </div>

      {/* Category Breakdown Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <MoreHorizontal className="h-4 w-4 text-brand-orange" />
            Expense Category Breakdown
          </h3>
          <span className="text-[11px] text-slate-400 font-semibold">Distribution</span>
        </div>

        {/* Category Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {[
            { label: "Tea / Snacks", key: "Tea/Snacks", icon: Coffee, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            { label: "Electricity Bill", key: "Electricity", icon: Zap, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
            { label: "Shop Rent", key: "Rent", icon: Building, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
            { label: "Staff Salary", key: "Salary", icon: Users, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { label: "Other / Misc", key: "Other", icon: Receipt, color: "text-slate-600 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700" }
          ].map(c => {
            const Icon = c.icon;
            const amt = metrics.catTotals[c.key] || 0;
            const pct = metrics.totalAllTime > 0 ? Math.round((amt / metrics.totalAllTime) * 100) : 0;

            return (
              <div 
                key={c.key}
                onClick={() => setSelectedCategory(selectedCategory === c.key ? "All" : c.key)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                  selectedCategory === c.key ? "ring-2 ring-brand-orange scale-[1.02]" : ""
                } ${c.bg}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${c.color}`} />
                  <span className="text-xs font-black truncate">{c.label}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tabular-nums">
                    ₹{amt.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-3xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses by description, note, or logged by..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
          />
        </div>

        {/* Time Horizon Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: "all", label: "All Time" },
            { id: "month", label: "This Month" },
            { id: "week", label: "This Week" },
            { id: "today", label: "Today" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeFilter(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer shrink-0 ${
                timeFilter === t.id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {["All", "Tea/Snacks", "Electricity", "Rent", "Salary", "Other"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? "bg-brand-orange text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Expense Records List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt className="h-4 w-4 text-brand-orange" />
              Expense Ledger Records ({filteredExpenses.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Detailed breakdown of all outgoing shop expenditures
            </p>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Receipt className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No expenses found matching the selected criteria.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-brand-orange hover:underline font-black cursor-pointer"
            >
              + Click here to log a new expense
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-black border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Description</th>
                    <th className="px-5 py-3.5">Date & Time</th>
                    <th className="px-5 py-3.5">Logged By</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Amount (₹)</th>
                    <th className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredExpenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${getCategoryColor(e.category)}`}>
                          {getCategoryIcon(e.category)}
                          <span>{e.category}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        {e.description}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {e.date ? new Date(e.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        {e.loggedBy || "Staff"}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          e.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-sm text-slate-900 dark:text-white tabular-nums">
                        ₹{e.amount?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {e.status === "Pending Approval" && (currentRole === "Owner" || currentRole === "Manager") && (
                            <button
                              onClick={() => {
                                approveExpense(e.id);
                                showToast(`✓ Expense "${e.description}" approved`);
                              }}
                              title="Approve Expense"
                              className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteExpense(e.id, e.description)}
                            title="Delete Record"
                            className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Native Card View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800 p-3 space-y-2.5">
              {filteredExpenses.map((e) => (
                <div 
                  key={e.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`p-2 rounded-xl border ${getCategoryColor(e.category)}`}>
                        {getCategoryIcon(e.category)}
                      </span>
                      <div>
                        <span className="font-black text-xs text-slate-900 dark:text-white block">
                          {e.description}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          {e.date ? new Date(e.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-sm text-slate-900 dark:text-white block tabular-nums">
                        ₹{e.amount?.toLocaleString("en-IN")}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        e.status === "Approved"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}>
                        {e.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500">
                    <span>Logged by: <strong>{e.loggedBy || "Staff"}</strong></span>
                    <div className="flex items-center gap-2">
                      {e.status === "Pending Approval" && (currentRole === "Owner" || currentRole === "Manager") && (
                        <button
                          onClick={() => {
                            approveExpense(e.id);
                            showToast(`✓ Expense "${e.description}" approved`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteExpense(e.id, e.description)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Log Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 transition-colors">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <WalletCards className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">
                    Log Store Expense
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Record outgoing operational expenditure and overhead costs
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Expense Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chai for staff, Electricity bill, Cleaning maintenance"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Amount Paid (₹) <span className="text-rose-500">*</span>
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-base font-black text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Expense Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors cursor-pointer"
                >
                  <option value="Tea/Snacks">☕ Tea / Snacks</option>
                  <option value="Electricity">⚡ Electricity Bill</option>
                  <option value="Rent">🏬 Shop Rent</option>
                  <option value="Salary">👥 Staff Salary</option>
                  <option value="Other">📦 Other Operational Expense</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
