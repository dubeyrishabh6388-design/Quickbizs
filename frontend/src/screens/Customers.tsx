import React, { useState, useEffect } from "react";
import { 
  Search, 
  UserPlus, 
  X,
  CheckCircle2,
  Phone,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Users,
  ShieldCheck
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import type { Customer } from "../context/BusinessContext";
import { api } from "../config/api";

export const Customers: React.FC = () => {
  const { customers, addCustomer, settleCustomerDues } = useBusiness();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"All" | "Pending Udhaar">("All");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Add Customer Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Transaction Entry Modal (Gave Udhaar or Received Jama)
  const [activeTxCustomer, setActiveTxCustomer] = useState<Customer | null>(null);
  const [txType, setTxType] = useState<"Jama" | "Udhaar">("Jama");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // Customer Profile drawer states
  const [activeProfileCustomer, setActiveProfileCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [customerTrust, setCustomerTrust] = useState<any>(null);
  const [loadingProfileData, setLoadingProfileData] = useState(false);

  const fetchCustomerProfileDetails = async (cust: Customer) => {
    setLoadingProfileData(true);
    setCustomerOrders([]);
    setCustomerTrust(null);
    try {
      const res = await api.get("/pickup-orders/merchant/orders");
      if (res.data?.success && res.data?.data?.orders) {
        const allOrders = res.data.data.orders;
        const matched = allOrders.filter((o: any) => {
          const orderPhone = o.customer?.phone || o.customerPhone || "";
          return orderPhone.replace(/\D/g, "").includes(cust.phone.replace(/\D/g, ""));
        });
        setCustomerOrders(matched);
        const foundWithTrust = matched.find((o: any) => o.customer?.trustScore);
        if (foundWithTrust) {
          setCustomerTrust(foundWithTrust.customer.trustScore);
        } else {
          setCustomerTrust({ score: 100, restrictedStatus: false });
        }
      }
    } catch (err) {
      console.error("Failed to load customer profile details:", err);
    } finally {
      setLoadingProfileData(false);
    }
  };

  useEffect(() => {
    if (activeProfileCustomer) {
      fetchCustomerProfileDetails(activeProfileCustomer);
    }
  }, [activeProfileCustomer]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    const matchesFilter = selectedFilter === "All" || (selectedFilter === "Pending Udhaar" && c.pendingDues > 0);
    return matchesSearch && matchesFilter;
  });

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addCustomer(name, phone, address || undefined);

    setName("");
    setPhone("");
    setAddress("");
    setIsAddOpen(false);
    showToast("✓ Customer Added Successfully");
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTxCustomer || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Error: Transaction amount must be a positive number greater than zero.");
      return;
    }
    if (numAmount > 50000) {
      alert("Error: Maximum single transaction limit is ₹50,000 to prevent accidental entry errors.");
      return;
    }

    const paymentAmount = txType === "Jama" ? numAmount : -numAmount;

    settleCustomerDues(activeTxCustomer.id, paymentAmount);

    setAmount("");
    setActiveTxCustomer(null);
    showToast(txType === "Jama" ? "✓ Payment Received Logged" : "✓ Udhaar Credit Logged");
  };

  const totalUdhaarSum = customers.reduce((acc, c) => acc + Math.max(0, c.pendingDues), 0);

  return (
    <div className="p-2.5 sm:p-5 lg:p-8 w-full space-y-3 sm:space-y-5 pb-24 text-slate-900 dark:text-white">
      
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl font-black text-xs z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toastMsg}
        </div>
      )}

      {/* Standard Adaptive Page Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                Customer Khata
              </h1>
              <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                {customers.length}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
              Udhaar ledger, customer credit tracking, WhatsApp balance reminders, and instant Jama/Udhaar entries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Total Pending Udhaar</span>
            <span className="text-base sm:text-lg font-black text-rose-500 tabular-nums">₹{totalUdhaarSum.toLocaleString("en-IN")}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white font-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Add Customer</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Mobile Udhaar Quick Summary Banner (Prominently visible on mobile phones) */}
      <div className="sm:hidden bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-xs">
            ₹
          </div>
          <div>
            <span className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Total Outstanding Udhaar</span>
            <span className="text-sm font-black text-rose-600 dark:text-rose-400 tabular-nums">₹{totalUdhaarSum.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
          {customers.filter(c => c.pendingDues > 0).length} Due
        </span>
      </div>

      {/* Search & Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 sm:py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange"
          />
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setSelectedFilter("All")}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold cursor-pointer transition-all ${
              selectedFilter === "All"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-brand-orange/50"
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setSelectedFilter("Pending Udhaar")}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold cursor-pointer transition-all ${
              selectedFilter === "Pending Udhaar"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-800 hover:border-rose-500/50"
            }`}
          >
            Pending Udhaar ({customers.filter(c => c.pendingDues > 0).length})
          </button>
        </div>
      </div>

      {/* Customer List View (Mobile: Compact Cards, Desktop: Multi-Col Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <User className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-bold">No customers found.</p>
          </div>
        ) : (
          filteredCustomers.map((c) => (
            <div 
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{c.name}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">Balance Due</span>
                  <span className={`text-xs sm:text-sm font-black ${c.pendingDues > 0 ? "text-rose-600" : c.pendingDues < 0 ? "text-emerald-600" : "text-slate-500"}`}>
                    {c.pendingDues > 0 ? `₹${c.pendingDues} (Udhaar)` : c.pendingDues < 0 ? `₹${Math.abs(c.pendingDues)} (Adv)` : "₹0 (Clear)"}
                  </span>
                </div>
              </div>

              {/* 2 Primary Action Buttons: Udhaar (-) & Jama (+) */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setActiveTxCustomer(c);
                    setTxType("Udhaar");
                  }}
                  className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold py-2 px-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Udhaar (-)
                </button>

                <button
                  onClick={() => {
                    setActiveTxCustomer(c);
                    setTxType("Jama");
                  }}
                  className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold py-2 px-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer"
                >
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                  Jama (+)
                </button>
              </div>

              {/* View Profile & History Button */}
              <button
                onClick={() => setActiveProfileCustomer(c)}
                className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold rounded-lg sm:rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-100 dark:border-slate-700/60"
              >
                <User className="h-3.5 w-3.5 text-brand-orange" />
                View Profile & History
              </button>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button on mobile */}
      <div className="fixed bottom-[72px] right-4 z-30 sm:hidden">
        <button
          onClick={() => setIsAddOpen(true)}
          className="h-12 w-12 rounded-2xl bg-brand-orange hover:bg-brand-orange-hover text-white shadow-xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          title="Add Customer"
        >
          <UserPlus className="h-5 w-5" />
        </button>
      </div>

      {/* Add Customer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">Add New Customer</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Address / Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Near Temple"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 text-white font-black py-3 rounded-xl text-xs shadow-md"
                >
                  Save Customer
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Transaction Entry Modal (Jama or Udhaar) */}
      {activeTxCustomer && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block">{activeTxCustomer.name}</span>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  {txType === "Jama" ? "Received Money (Jama)" : "Gave Credit (Udhaar)"}
                </h3>
              </div>
              <button onClick={() => setActiveTxCustomer(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Enter Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0.01"
                  max="50000"
                  step="0.01"
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-3 text-lg font-black text-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Note / Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Milk & Bread payment"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTxCustomer(null)}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 font-black py-3 rounded-xl text-xs shadow-md text-white ${
                    txType === "Jama" ? "bg-emerald-600" : "bg-rose-600"
                  }`}
                >
                  {txType === "Jama" ? "Save Jama (+)" : "Save Udhaar (-)"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
      {/* Customer Profile Detail Modal */}
      {activeProfileCustomer && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 shrink-0">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block">Customer Account Folder</span>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">{activeProfileCustomer.name}</h3>
              </div>
              <button onClick={() => setActiveProfileCustomer(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              
              {/* Trust Score Block */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-brand-orange animate-pulse" />
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">Pickup Trust Score</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-205">
                      {loadingProfileData ? "Synchronizing..." : `${customerTrust?.score ?? 100} / 100`}
                    </span>
                  </div>
                </div>
                {customerTrust?.restrictedStatus && (
                  <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase border border-rose-500/20">Restricted Checkout</span>
                )}
              </div>

              {/* Matched Pickup Orders List */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pickup Order History</h4>
                {loadingProfileData ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-bold">Loading order ledger history...</div>
                ) : customerOrders.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 italic font-medium">No pickup orders recorded for this customer account.</div>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map((o: any) => (
                      <div key={o.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 dark:text-white">#{o.orderNumber}</span>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                              {new Date(o.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">{o.items.map((i: any) => `${i.productName} (x${i.quantity})`).join(", ")}</p>
                        </div>
                        <div className="text-right shrink-0 space-y-0.5">
                          <p className="font-black text-slate-950 dark:text-white">₹{o.totalAmount}</p>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                            o.orderStatus === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
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

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 shrink-0">
              <button
                onClick={() => setActiveProfileCustomer(null)}
                className="w-full bg-slate-900 dark:bg-slate-700 text-white font-black py-3 rounded-xl text-xs shadow-md cursor-pointer"
              >
                Close Folder
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
