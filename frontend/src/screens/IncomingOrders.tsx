import React, { useState, useEffect, useCallback } from "react";
import { 
  ShoppingBag, 
  User, 
  Clock, 
  Check, 
  X, 
  Package, 
  ChevronRight, 
  Search, 
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { api } from "../config/api";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  lineTotal: number;
  quantity: number;
  packingStatus?: "PENDING" | "PACKED" | "NOT_AVAILABLE";
  remarks?: string;
  replacementStatus?: "NONE" | "REQUESTED" | "ACCEPTED" | "REJECTED";
}

interface CustomerDetails {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface PickupOrder {
  id: string;
  orderNumber: string;
  businessId: string;
  customerId: string;
  orderStatus: "PENDING" | "ACCEPTED" | "PACKING" | "REPLACEMENT_NEEDED" | "READY" | "COMPLETED" | "CANCELLED" | "REJECTED";
  paymentMethod: string;
  paymentStatus: string;
  scheduledPickupTime: string;
  orderNotes?: string;
  totalAmount: number;
  totalItems: number;
  createdAt: string;
  customer?: CustomerDetails;
  items: OrderItem[];
}

export const IncomingOrders: React.FC = () => {
  const [orders, setOrders] = useState<PickupOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeOrder, setActiveOrder] = useState<PickupOrder | null>(null);
  
  // Verification states
  const [pinInput, setPinInput] = useState("");
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/pickup-orders/merchant/orders");
      if (response.data?.success && response.data?.data) {
        const fetched = response.data.data.orders || [];
        setOrders(fetched);
        return fetched;
      }
    } catch (err: any) {
      console.error("Failed to load pickup orders:", err);
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  // Poll for updates every 15 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Action Handlers
  const handleAccept = async (orderId: string) => {
    try {
      const res = await api.post(`/pickup-orders/merchant/orders/${orderId}/accept`);
      if (res.data?.success) {
        fetchOrders();
        if (activeOrder?.id === orderId) {
          setActiveOrder(prev => prev ? { ...prev, orderStatus: "ACCEPTED" } : null);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to accept order.");
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      const res = await api.post(`/pickup-orders/merchant/orders/${orderId}/reject`);
      if (res.data?.success) {
        fetchOrders();
        if (activeOrder?.id === orderId) {
          setActiveOrder(prev => prev ? { ...prev, orderStatus: "REJECTED" } : null);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to reject order.");
    }
  };

  const handleStartPacking = async (orderId: string) => {
    try {
      const res = await api.post(`/pickup-orders/merchant/orders/${orderId}/start-packing`);
      if (res.data?.success) {
        fetchOrders();
        if (activeOrder?.id === orderId) {
          setActiveOrder(prev => prev ? { ...prev, orderStatus: "PACKING" } : null);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to start packing.");
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      const res = await api.post(`/pickup-orders/merchant/orders/${orderId}/ready`);
      if (res.data?.success) {
        fetchOrders();
        if (activeOrder?.id === orderId) {
          setActiveOrder(prev => prev ? { ...prev, orderStatus: "READY" } : null);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to mark order ready.");
    }
  };

  const handleMarkItemPacked = async (itemId: string, packingStatus: "PACKED" | "NOT_AVAILABLE", remarks?: string) => {
    if (!activeOrder) return;
    try {
      const res = await api.post(`/pickup-orders/merchant/orders/${activeOrder.id}/mark-packed`, {
        itemId,
        packingStatus,
        remarks
      });
      if (res.data?.success) {
        const latestOrders = await fetchOrders();
        const updated = latestOrders.find((o: any) => o.id === activeOrder.id);
        if (updated) {
          setActiveOrder(updated);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update item status.");
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    setVerifyingPin(true);
    setPinError(null);
    try {
      const res = await api.post(`/pickup-orders/merchant/orders/${activeOrder.id}/verify-pin`, {
        pin: pinInput || "0000"
      });
      if (res.data?.success) {
        // Automatically trigger completion
        await handleComplete(activeOrder.id);
      }
    } catch (err: any) {
      setPinError(err.response?.data?.message || "Invalid pickup PIN.");
    } finally {
      setVerifyingPin(false);
    }
  };

  const handleComplete = async (orderId: string) => {
    try {
      const res = await api.post(`/pickup-orders/merchant/orders/${orderId}/complete`);
      if (res.data?.success) {
        setPinInput("");
        fetchOrders();
        setActiveOrder(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to complete pickup.");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this pickup order?")) return;
    try {
      const res = await api.post(`/pickup-orders/merchant/orders/${orderId}/cancel`);
      if (res.data?.success) {
        fetchOrders();
        setActiveOrder(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel order.");
    }
  };

  // Filter and search
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === "ALL" || order.orderStatus === filterStatus;
    const customerName = order.customer?.name || "";
    const customerPhone = order.customer?.phone || "";
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerPhone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Header Bar */}
      <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 flex justify-between items-center shrink-0">
        <div>
          <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider block mb-1">
            Store Counter Panel
          </span>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Incoming Pickup Orders</h2>
        </div>
        <button 
          onClick={fetchOrders}
          disabled={loading}
          className="p-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors cursor-pointer flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Sync Feed
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Left Side: Order Feed */}
        <div className="w-1/2 flex flex-col border-r border-slate-200 dark:border-slate-900 overflow-hidden bg-white dark:bg-slate-950">
          
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-900 space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-600" />
              <input
                type="text"
                placeholder="Search by Order ID or customer phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {["ALL", "PENDING", "ACCEPTED", "PACKING", "REPLACEMENT_NEEDED", "READY", "COMPLETED", "CANCELLED"].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all shrink-0 cursor-pointer ${
                    filterStatus === status 
                      ? "bg-brand-orange text-white" 
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Feed Scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <ShoppingBag className="h-10 w-10 text-slate-400 dark:text-slate-700 animate-pulse" />
                <p className="text-xs font-bold text-slate-400 dark:text-slate-600">No matching orders in feed.</p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const isSelected = activeOrder?.id === order.id;
                
                // Color coding for status
                let statusBadge = "bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400";
                if (order.orderStatus === "PENDING") statusBadge = "bg-brand-orange/10 border-brand-orange/30 text-brand-orange";
                else if (order.orderStatus === "ACCEPTED") statusBadge = "bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300";
                else if (order.orderStatus === "PACKING") statusBadge = "bg-brand-orange/15 border-brand-orange/35 text-brand-orange";
                else if (order.orderStatus === "REPLACEMENT_NEEDED") statusBadge = "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400";
                else if (order.orderStatus === "READY") statusBadge = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
                else if (order.orderStatus === "COMPLETED") statusBadge = "bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400";

                return (
                  <button
                    key={order.id}
                    onClick={() => {
                      setActiveOrder(order);
                      setPinInput("");
                      setPinError(null);
                    }}
                    className={`w-full p-4 border text-left rounded-2xl flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer ${
                      isSelected 
                        ? "bg-slate-50 dark:bg-slate-900 border-brand-orange shadow-lg" 
                        : "bg-white dark:bg-slate-900/30 border-slate-200 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-800"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white">#{order.orderNumber}</span>
                        <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase rounded-full border ${statusBadge}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">{order.customer?.name || "Guest Customer"}</p>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 font-bold">
                        <Clock className="h-3 w-3" />
                        <span>Pickup: {new Date(order.scheduledPickupTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="text-xs font-black text-slate-900 dark:text-white">₹{order.totalAmount}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">{order.totalItems} items</p>
                      <ChevronRight className={`h-4 w-4 text-slate-400 dark:text-slate-700 ml-auto transition-transform ${isSelected ? 'translate-x-1' : ''}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Order Detail Viewer */}
        <div className="w-1/2 flex flex-col overflow-hidden bg-slate-100/30 dark:bg-slate-955/20">
          {activeOrder ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Top Summary */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-900 space-y-4 shrink-0 bg-white dark:bg-slate-950">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-md font-black text-slate-900 dark:text-white">Order #{activeOrder.orderNumber}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Placed at {new Date(activeOrder.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  <span className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black text-slate-900 dark:text-white">
                    ₹{activeOrder.totalAmount}
                  </span>
                </div>

                {/* Customer card */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-900 p-3.5 rounded-2xl">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Customer</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <User className="h-3.5 w-3.5 text-brand-orange" />
                      <span>{activeOrder.customer?.name || "Guest Customer"}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block pl-5">{activeOrder.customer?.phone || ""}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Pickup Window</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Clock className="h-3.5 w-3.5 text-brand-orange" />
                      <span>{new Date(activeOrder.scheduledPickupTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block pl-5">
                      {new Date(activeOrder.scheduledPickupTime).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ordered Products</h4>
                  <div className="space-y-2.5">
                    {activeOrder.items.map(item => {
                      const isPackingActive = activeOrder.orderStatus === "PACKING" || activeOrder.orderStatus === "REPLACEMENT_NEEDED";
                      const isPending = !item.packingStatus || item.packingStatus === "PENDING";
                      const isPacked = item.packingStatus === "PACKED";
                      const isUnavailable = item.packingStatus === "NOT_AVAILABLE";

                      return (
                        <div key={item.id} className="flex justify-between items-center bg-white dark:bg-slate-900/20 p-3 border border-slate-200 dark:border-slate-900/80 rounded-xl">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{item.productName}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                              <span>₹{item.unitPrice} each</span>
                              {isPacked && (
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-extrabold uppercase border border-emerald-500/20">Packed</span>
                              )}
                              {isUnavailable && (
                                <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[8px] font-extrabold uppercase border border-rose-500/20">
                                  Unavailable
                                  {item.remarks ? ` (${item.remarks})` : ""}
                                  {item.replacementStatus && item.replacementStatus !== "NONE" && ` - Replacement ${item.replacementStatus}`}
                                </span>
                              )}
                              {isPending && (
                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 text-[8px] font-extrabold uppercase border border-slate-200 dark:border-slate-700">Pending</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-slate-400 dark:text-slate-400 font-bold">x{item.quantity}</span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 w-12 text-right">₹{item.lineTotal}</span>
                            
                            {isPackingActive && isPending && (
                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={() => handleMarkItemPacked(item.id, "PACKED")}
                                  title="Mark Packed"
                                  className="p-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 transition-all cursor-pointer"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    const remark = prompt("Enter replacement offer notes (e.g. 'Amul Gold (1L) instead of Amul Slim'):");
                                    if (remark !== null) {
                                      handleMarkItemPacked(item.id, "NOT_AVAILABLE", remark);
                                    }
                                  }}
                                  title="Flag Unavailable (Trigger Replacement)"
                                  className="p-1 rounded bg-rose-500 hover:bg-rose-600 text-white active:scale-95 transition-all cursor-pointer"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {activeOrder.orderNotes && (
                  <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 p-4 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Customer Notes</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{activeOrder.orderNotes}"</p>
                  </div>
                )}
              </div>

              {/* Interactive State Actions Panel */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 shrink-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400 dark:text-slate-500">Status Flow Stage:</span>
                    <span className="text-brand-orange uppercase">{activeOrder.orderStatus}</span>
                  </div>

                  {activeOrder.orderStatus === "PENDING" && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleReject(activeOrder.id)}
                        className="py-3 border border-rose-800 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                        Reject Order
                      </button>
                      <button
                        onClick={() => handleAccept(activeOrder.id)}
                        className="py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
                      >
                        <Check className="h-4 w-4" />
                        Accept Order
                      </button>
                    </div>
                  )}

                  {activeOrder.orderStatus === "ACCEPTED" && (
                    <button
                      onClick={() => handleStartPacking(activeOrder.id)}
                      className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
                    >
                      <Package className="h-4 w-4" />
                      Start Packing Items
                    </button>
                  )}

                  {(activeOrder.orderStatus === "PACKING" || activeOrder.orderStatus === "REPLACEMENT_NEEDED") && (
                    <button
                      onClick={() => handleMarkReady(activeOrder.id)}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Ready for Handover
                    </button>
                  )}

                  {activeOrder.orderStatus === "READY" && (
                    <div className="space-y-4">
                      <div className="border border-brand-orange/20 bg-brand-orange/5 p-4 rounded-xl flex gap-3 text-xs text-slate-700 dark:text-slate-300">
                        <Lock className="h-4.5 w-4.5 text-brand-orange shrink-0 mt-0.5" />
                        <div>
                          <strong>Verification PIN (Optional):</strong> Ask the customer for the 4-digit pickup PIN, or bypass verification to hand over directly.
                        </div>
                      </div>

                      <form onSubmit={handleVerifyPin} className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="Enter 4-digit PIN (Optional)..."
                            value={pinInput}
                            onChange={e => setPinInput(e.target.value.replace(/\D/g, ""))}
                            disabled={verifyingPin}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-orange"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={verifyingPin}
                          className="px-6 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Verify & Handover
                        </button>
                      </form>

                      <button
                        type="button"
                        disabled={verifyingPin}
                        onClick={() => handleComplete(activeOrder.id)}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="h-4.5 w-4.5" />
                        Bypass PIN & Complete Handover
                      </button>

                      {pinError && (
                        <p className="text-[10px] text-rose-500 font-bold">{pinError}</p>
                      )}
                    </div>
                  )}

                  {activeOrder.orderStatus === "COMPLETED" && (
                    <div className="border border-emerald-950 bg-emerald-500/5 p-4 rounded-xl flex items-center gap-3 text-xs text-emerald-500 dark:text-emerald-450">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <span>Order completed successfully and handed over.</span>
                    </div>
                  )}

                  {activeOrder.orderStatus === "REJECTED" && (
                    <div className="border border-rose-950 bg-rose-500/5 p-4 rounded-xl flex items-center gap-3 text-xs text-rose-500 dark:text-rose-455">
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      <span>Order has been rejected.</span>
                    </div>
                  )}

                  {activeOrder.orderStatus === "CANCELLED" && (
                    <div className="border border-rose-950 bg-rose-500/5 p-4 rounded-xl flex items-center gap-3 text-xs text-rose-500 dark:text-rose-455">
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      <span>Order was cancelled.</span>
                    </div>
                  )}

                  {/* Cancel fallback action for admin override */}
                  {["PENDING", "ACCEPTED", "PACKING", "READY", "REPLACEMENT_NEEDED"].includes(activeOrder.orderStatus) && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => handleCancelOrder(activeOrder.id)}
                        className="text-[10px] text-rose-500 hover:underline font-bold cursor-pointer"
                      >
                        Force Cancel Order
                      </button>
                    </div>
                  )}

                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8 bg-slate-50 dark:bg-slate-900/30">
              <div className="h-16 w-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center shadow-sm">
                <ShoppingBag className="h-7 w-7 text-slate-400 dark:text-slate-700" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">Order Details Panel</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 max-w-xs leading-relaxed">
                  Select any pickup order card from the left panel to review items list, scheduled time, customer metadata, and manage order flow state.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default IncomingOrders;
