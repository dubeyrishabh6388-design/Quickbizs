import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Truck, 
  Phone, 
  CheckCircle2, 
  X,
  Coins
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import type { Supplier } from "../context/BusinessContext";

export const Suppliers: React.FC = () => {
  const { suppliers, addSupplier, settleSupplierDues } = useBusiness();
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Add Supplier Modal
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  // Record Payment Modal
  const [settlingSupplier, setSettlingSupplier] = useState<Supplier | null>(null);
  const [settleAmount, setSettleAmount] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addSupplier(name, phone, contactPerson || name);
    setName("");
    setPhone("");
    setContactPerson("");
    setIsAddingSupplier(false);
    showToast("✓ Supplier Added Successfully");
  };

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingSupplier || !settleAmount) return;

    const amt = parseFloat(settleAmount);
    if (isNaN(amt) || amt <= 0) return;

    settleSupplierDues(settlingSupplier.id, amt);
    setSettlingSupplier(null);
    setSettleAmount("");
    showToast(`✓ Payment of ₹${amt} Recorded`);
  };

  const totalDuesSum = suppliers.reduce((acc, s) => acc + s.pendingDues, 0);

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
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Suppliers & Wholesale Directory
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {suppliers.length} Vendors
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Wholesale accounts payable, vendor contacts, purchase orders, and payment settlements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Total Payable Dues</span>
            <span className="text-lg font-black text-brand-orange tabular-nums">₹{totalDuesSum.toLocaleString("en-IN")}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingSupplier(true)}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Supplier
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by supplier name, contact person, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange"
          />
        </div>
      </div>

      {/* Supplier Cards List (Mobile: 1 Col, Desktop: Multi-Col Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <Truck className="h-10 w-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-bold">No suppliers found.</p>
          </div>
        ) : (
          filteredSuppliers.map((sup) => (
            <div 
              key={sup.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{sup.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{sup.phone}</span>
                    {sup.contactPerson && <span>({sup.contactPerson})</span>}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase block">Pending Dues</span>
                  <span className={`text-base font-black tabular-nums ${sup.pendingDues > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500"}`}>
                    ₹{sup.pendingDues.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={`tel:${sup.phone}`}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all text-center"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call Supplier
                </a>

                <button
                  onClick={() => setSettlingSupplier(sup)}
                  disabled={sup.pendingDues <= 0}
                  className={`font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                    sup.pendingDues > 0
                      ? "bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Coins className="h-3.5 w-3.5" />
                  Pay Dues
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sticky Bottom Floating Action Button */}
      <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 max-w-4xl mx-auto z-30">
        <button
          onClick={() => setIsAddingSupplier(true)}
          className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-black py-4 rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-brand-orange/20"
        >
          <Plus className="h-5 w-5" />
          Add New Supplier
        </button>
      </div>

      {/* Add Supplier Modal */}
      {isAddingSupplier && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">Add New Supplier</h3>
              <button onClick={() => setIsAddingSupplier(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Supplier Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kirana Wholesale Traders"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Contact Person Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Sanjay Shah"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingSupplier(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-white font-black py-3 rounded-xl text-xs shadow-md cursor-pointer transition-colors"
                >
                  Save Supplier
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {settlingSupplier && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block">{settlingSupplier.name}</span>
                <h3 className="font-black text-base text-slate-900 dark:text-white">Record Payment to Supplier</h3>
              </div>
              <button onClick={() => setSettlingSupplier(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Enter Amount Paid (₹)</label>
                <input
                  type="number"
                  placeholder={`Max ₹${settlingSupplier.pendingDues}`}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  max={settlingSupplier.pendingDues}
                  required
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-3 text-lg font-black text-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSettlingSupplier(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-white font-black py-3 rounded-xl text-xs shadow-md cursor-pointer transition-colors"
                >
                  Confirm Payment
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
